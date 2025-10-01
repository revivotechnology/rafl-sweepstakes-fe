# Rafl Shopify Integration - Setup Guide

## Phase 2 Complete ✅

The following components have been implemented:

### 1. Database Tables
- `shopify_shops` - Stores OAuth connections to Shopify stores
- `purchases` - Tracks orders for attribution and purchase-based entries

### 2. Edge Functions

#### `shopify-auth` (OAuth Handler)
- **URL**: `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-auth`
- **Purpose**: Handles OAuth callback from Shopify
- **Flow**: 
  1. Shopify redirects here with authorization code
  2. Exchanges code for access token
  3. Stores token in `shopify_shops` table
  4. Redirects merchant to dashboard

#### `shopify-webhooks` (Webhook Receiver)
- **URL**: `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-webhooks`
- **Purpose**: Receives and processes Shopify webhooks
- **Handles**:
  - `orders/create` - Creates purchase records for attribution
  - `orders/updated` - Updates existing purchase records
  - `customers/data_request` - GDPR compliance (logged)
  - `customers/redact` - GDPR compliance (logged)
  - `shop/redact` - GDPR compliance (logged)

#### `process-entry` (Entry API)
- **URL**: `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/process-entry`
- **Purpose**: Processes giveaway entries from ESPs and AMOE
- **Authentication**: HMAC signature or API key

### 3. Theme Extension Script

#### `rafl.js`
- **Location**: `/public/rafl.js`
- **Provides**:
  - `window.Rafl.enter({ email, promoId, apiKey })` - Main entry function
  - `window.Rafl.showBadge({ promoId, position })` - Rules badge

### 4. Legal Pages
- `/rules/:promoId` - Official rules display
- `/amoe/:promoId` - Alternative method of entry

---

## Next Steps: Setting Up Your Shopify Partner App

### Step 1: Create Shopify Partner App

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Navigate to **Apps** → **Create app**
3. Choose **Public app**
4. Fill in app details:
   - **App name**: Rafl
   - **App URL**: `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-auth`
   - **Allowed redirection URL(s)**:
     ```
     https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-auth
     ```

5. **API scopes** (start minimal):
   - `read_orders` - For attribution and purchase entries
   - `read_products` - Optional, for future features

### Step 2: Configure Secrets

Update your Supabase secrets with values from Shopify Partner dashboard:

```bash
SHOPIFY_API_KEY=<your_api_key>
SHOPIFY_API_SECRET=<your_api_secret>
```

### Step 3: Register Webhooks

In your Shopify Partner dashboard, configure webhooks:

| Topic | URL | Purpose |
|-------|-----|---------|
| `orders/create` | `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-webhooks` | Track purchases |
| `orders/updated` | `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-webhooks` | Update purchases |
| `customers/data_request` | `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-webhooks` | GDPR compliance |
| `customers/redact` | `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-webhooks` | GDPR compliance |
| `shop/redact` | `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-webhooks` | GDPR compliance |

### Step 4: Create Theme App Extension

1. In Shopify CLI, create a new extension:
   ```bash
   npm init @shopify/app@latest
   cd your-app
   shopify app generate extension
   ```

2. Choose **Theme app extension**

3. In your extension, create an app embed that loads `/rafl.js`:
   ```liquid
   {% comment %} blocks/rafl-embed.liquid {% endcomment %}
   <script src="{{ 'https://your-app-domain.com/rafl.js' | append: '?v=' | append: 'now' | date: '%s' }}"></script>
   
   {% schema %}
   {
     "name": "Rafl Giveaway",
     "target": "body",
     "enabled_on": {
       "templates": ["*"]
     }
   }
   {% endschema %}
   ```

4. Deploy the extension:
   ```bash
   shopify app deploy
   ```

### Step 5: Merchant Installation Flow

When a merchant wants to connect:

1. They navigate to your Dashboard
2. Click "Connect Shopify Store"
3. Enter their shop domain (e.g., `mystore.myshopify.com`)
4. Redirected to Shopify OAuth consent screen
5. After approval, redirected back to dashboard
6. Connection appears in "Shopify Integration" card

---

## Integration with ESPs (Klaviyo Example)

### 1. Popup Configuration

Merchants add this to their existing Klaviyo popup:

```html
<p>Enter our $500 Giveaway (No Purchase Necessary)</p>
<a href="https://your-app.com/rules/PROMO_ID">Official Rules</a> | 
<a href="https://your-app.com/amoe/PROMO_ID">Free Entry</a>
```

### 2. Welcome Email

Add a "Confirm Entry" button that calls the entry API:

```html
<a href="https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/process-entry?email={{ email|url_encode }}&promo_id=PROMO_ID&sig=SIGNATURE">
  Confirm Your Entry
</a>
```

Or use JavaScript in the thank-you page:

```html
<script src="https://your-domain.com/rafl.js"></script>
<script>
  Rafl.enter({
    email: '{{ email }}',
    promoId: 'PROMO_ID',
    apiKey: 'MERCHANT_API_KEY'
  });
</script>
```

---

## Testing Checklist

- [ ] OAuth flow works (connect test Shopify store)
- [ ] Webhooks receive order events
- [ ] Purchases are recorded in database
- [ ] Entry API accepts entries with valid signatures
- [ ] AMOE page displays correctly
- [ ] Rules page displays correctly
- [ ] rafl.js loads and exposes `window.Rafl.enter()`
- [ ] Badge shows on frontend

---

## Architecture Overview

```
┌─────────────────┐
│  Shopify Store  │
└────────┬────────┘
         │
         │ OAuth
         ▼
┌─────────────────┐      ┌──────────────┐
│  shopify-auth   │─────▶│ shopify_shops│
│  Edge Function  │      └──────────────┘
└─────────────────┘
         │
         │ Webhooks (orders/create)
         ▼
┌─────────────────┐      ┌──────────────┐
│shopify-webhooks │─────▶│  purchases   │
│  Edge Function  │      └──────────────┘
└─────────────────┘

┌─────────────────┐
│   Theme (rafl.js)│
└────────┬────────┘
         │
         │ window.Rafl.enter()
         ▼
┌─────────────────┐      ┌──────────────┐
│  process-entry  │─────▶│   entries    │
│  Edge Function  │      │ consent_logs │
└─────────────────┘      └──────────────┘
```

---

## Security Notes

1. **OAuth tokens** are stored encrypted in `shopify_shops.access_token`
2. **Webhook verification** uses HMAC-SHA256 signature validation
3. **Entry API** requires either:
   - Valid HMAC signature (for ESP flows)
   - Valid API key from `api_keys` table
4. **Email hashing** for entries ensures PII protection
5. **RLS policies** enforce store-level data isolation

---

## What's Next?

- [ ] Build API key management UI in Dashboard
- [ ] Add promo creation/editing UI
- [ ] Implement attribution tracking (purchase → entry correlation)
- [ ] Add analytics dashboard for lift measurement
- [ ] Build holdout group feature
- [ ] Add fraud detection (velocity caps, IP blocking)

---

## Support

For issues or questions:
- Check [Supabase Edge Function Logs](https://supabase.com/dashboard/project/rjugqrifeecoxewscqdk/functions)
- Review webhook delivery in Shopify Partner dashboard
- Inspect browser console for rafl.js errors
