import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.224.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-shop-domain, x-shopify-topic',
};

function verifyShopifyWebhook(body: string, hmacHeader: string, secret: string): boolean {
  const hash = createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
  return hash === hmacHeader;
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
    if (!hmacHeader || !verifyShopifyWebhook(body, hmacHeader, Deno.env.get('SHOPIFY_API_SECRET') ?? '')) {
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
