import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rafl-signature',
};

interface EntryRequest {
  promoId: string;
  email: string;
  source: 'klaviyo' | 'mailchimp' | 'aweber' | 'sendgrid' | 'amoe' | 'direct';
  consentBrand: boolean;
  consentRafl: boolean;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { promoId, email, source, consentBrand, consentRafl, metadata = {} }: EntryRequest = await req.json();

    // Validate required fields
    if (!promoId || !email || !source) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: promoId, email, source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify HMAC signature (API key authentication)
    const signature = req.headers.get('x-rafl-signature');
    const apiKey = req.headers.get('x-api-key');
    
    if (!signature || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing authentication headers' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify API key
    const keyPrefix = apiKey.substring(0, 12);
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, store_id, key_hash, is_active')
      .eq('key_prefix', keyPrefix)
      .single();

    if (keyError || !apiKeyData || !apiKeyData.is_active) {
      console.error('Invalid API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the provided API key and compare with stored hash
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const providedKeyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (providedKeyHash !== apiKeyData.key_hash) {
      console.error('API key hash mismatch');
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch promo details
    const { data: promo, error: promoError } = await supabase
      .from('promos')
      .select('*')
      .eq('id', promoId)
      .eq('store_id', apiKeyData.store_id)
      .single();

    if (promoError || !promo) {
      console.error('Promo not found:', promoError);
      return new Response(
        JSON.stringify({ error: 'Promo not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if promo is active
    if (promo.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Promo is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check date range
    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) {
      return new Response(
        JSON.stringify({ error: 'Promo has not started yet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (promo.end_date && new Date(promo.end_date) < now) {
      return new Response(
        JSON.stringify({ error: 'Promo has ended' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash email for privacy (SHA-256)
    const emailData = encoder.encode(email.toLowerCase().trim());
    const emailHashBuffer = await crypto.subtle.digest('SHA-256', emailData);
    const emailHashArray = Array.from(new Uint8Array(emailHashBuffer));
    const hashedEmail = emailHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check entry limits
    const { data: existingEntries, error: entriesError } = await supabase
      .from('entries')
      .select('id')
      .eq('promo_id', promoId)
      .eq('hashed_email', hashedEmail);

    if (entriesError) {
      console.error('Error checking existing entries:', entriesError);
      return new Response(
        JSON.stringify({ error: 'Failed to check entry limits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingEntries.length >= promo.max_entries_per_email) {
      return new Response(
        JSON.stringify({ 
          error: 'Maximum entries per email reached',
          current: existingEntries.length,
          max: promo.max_entries_per_email
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create entry
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .insert({
        promo_id: promoId,
        hashed_email: hashedEmail,
        source,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata
      })
      .select()
      .single();

    if (entryError || !entry) {
      console.error('Error creating entry:', entryError);
      return new Response(
        JSON.stringify({ error: 'Failed to create entry' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create consent log
    const { error: consentError } = await supabase
      .from('consent_logs')
      .insert({
        entry_id: entry.id,
        consent_brand: consentBrand,
        consent_rafl: consentRafl,
        consent_text: `Brand: ${consentBrand}, Rafl: ${consentRafl}`,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (consentError) {
      console.error('Error creating consent log:', consentError);
    }

    // Update API key last used
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    console.log('Entry created successfully:', entry.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        entryId: entry.id,
        message: 'Entry recorded successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-entry function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
