import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-shop-domain, x-shopify-topic',
};

async function verifyShopifyWebhook(body: string, hmacHeader: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(body);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return hashBase64 === hmacHeader;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const shopDomain = req.headers.get('x-shopify-shop-domain');
    const topic = req.headers.get('x-shopify-topic');
    const body = await req.text();

    console.log('Webhook received:', { topic, shopDomain, hasHmac: !!hmacHeader });

    // Verify webhook
    const isValid = await verifyShopifyWebhook(body, hmacHeader, Deno.env.get('SHOPIFY_API_SECRET') ?? '');
    if (!hmacHeader || !isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.parse(body);

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
      case 'orders/updated': {
        console.log('Processing order webhook:', payload.id);

        // Find shopify_shop record
        const { data: shop, error: shopError } = await supabase
          .from('shopify_shops')
          .select('id, store_id')
          .eq('shop_domain', shopDomain)
          .single();

        if (shopError || !shop) {
          console.error('Shop not found:', shopDomain);
          return new Response(JSON.stringify({ error: 'Shop not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Calculate USD amount (convert if needed)
        const totalUsd = payload.currency === 'USD' 
          ? parseFloat(payload.total_price)
          : parseFloat(payload.total_price); // TODO: Add currency conversion

        // Insert or update purchase
        const { error: purchaseError } = await supabase
          .from('purchases')
          .upsert({
            shopify_shop_id: shop.id,
            shopify_order_id: payload.id.toString(),
            customer_email: payload.email || payload.customer?.email,
            total_amount_usd: totalUsd,
            currency: payload.currency,
            order_date: payload.created_at,
          }, {
            onConflict: 'shopify_shop_id,shopify_order_id',
          });

        if (purchaseError) {
          console.error('Error saving purchase:', purchaseError);
          return new Response(JSON.stringify({ error: 'Database error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Purchase recorded:', payload.id);
        
        // Forward to MongoDB backend
        try {
          const backendUrl = Deno.env.get('MONGODB_BACKEND_URL') || 'http://localhost:4000';
          const webhookEndpoint = topic === 'orders/create' 
            ? '/api/webhooks/orders/create'
            : '/api/webhooks/orders/updated';
          
          const backendResponse = await fetch(`${backendUrl}${webhookEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-shopify-shop-domain': shopDomain,
              'x-shopify-hmac-sha256': hmacHeader,
              'x-shopify-topic': topic
            },
            body: JSON.stringify(payload)
          });
          
          if (backendResponse.ok) {
            console.log('✅ Forwarded to MongoDB backend successfully');
          } else {
            console.error('❌ Failed to forward to MongoDB backend:', backendResponse.status);
          }
        } catch (error) {
          console.error('Error forwarding to backend:', error);
        }
        
        break;
      }

      case 'customers/data_request':
      case 'customers/redact':
      case 'shop/redact': {
        console.log('Compliance webhook received:', topic);
        // Log for manual review - implement GDPR compliance as needed
        break;
      }

      default:
        console.log('Unhandled webhook topic:', topic);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
