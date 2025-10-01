/**
 * Rafl Theme Extension Script
 * Embed this via Shopify App Extension
 * Provides: window.Rafl.enter({ email, promoId })
 */

(function() {
  'use strict';

  const RAFL_API_URL = 'https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/process-entry';

  // Initialize Rafl namespace
  window.Rafl = window.Rafl || {};

  /**
   * Main entry function
   * @param {Object} params
   * @param {string} params.email - Customer email
   * @param {string} params.promoId - Promo UUID
   * @param {string} [params.apiKey] - Optional API key (for authenticated entry)
   */
  window.Rafl.enter = async function({ email, promoId, apiKey }) {
    console.log('[Rafl] Processing entry:', { email: email?.substring(0, 3) + '***', promoId });

    if (!email || !promoId) {
      console.error('[Rafl] Missing required parameters: email and promoId');
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch(RAFL_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          promo_id: promoId,
          source: 'klaviyo', // Default source for ESP entries
          ip_address: null, // Browser can't reliably get this
          user_agent: navigator.userAgent,
          consent_brand: true, // Should be captured in ESP form
          consent_rafl: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[Rafl] Entry failed:', result);
        return { success: false, error: result.error || 'Entry failed' };
      }

      console.log('[Rafl] Entry successful:', result);
      return { success: true, data: result };

    } catch (error) {
      console.error('[Rafl] Entry error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Show rules badge (optional mini UI)
   */
  window.Rafl.showBadge = function({ promoId, position = 'bottom-right' }) {
    const badge = document.createElement('div');
    badge.id = 'rafl-badge';
    badge.innerHTML = `
      <a href="/pages/rules/${promoId}" target="_blank" 
         style="position: fixed; ${position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'} 
                ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                background: #000; color: #fff; padding: 8px 12px; border-radius: 4px; 
                font-size: 12px; text-decoration: none; z-index: 9999; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
        Official Rules
      </a>
    `;
    document.body.appendChild(badge);
  };

  console.log('[Rafl] SDK loaded successfully');
})();
