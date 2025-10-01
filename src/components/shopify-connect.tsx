import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShopifyShop {
  id: string;
  shop_domain: string;
  webhook_verified: boolean;
  created_at: string;
}

interface ShopifyConnectProps {
  storeId: string | null;
}

export function ShopifyConnect({ storeId }: ShopifyConnectProps) {
  const [shops, setShops] = useState<ShopifyShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      loadShopifyShops();
    }
  }, [storeId]);

  const loadShopifyShops = async () => {
    if (!storeId) return;
    
    try {
      const { data, error } = await supabase
        .from('shopify_shops')
        .select('*')
        .eq('store_id', storeId);

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error('Error loading Shopify shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!storeId) {
      toast({
        title: 'Error',
        description: 'Please create a store first',
        variant: 'destructive',
      });
      return;
    }

    // Construct OAuth URL
    const apiKey = 'YOUR_SHOPIFY_API_KEY'; // This should come from your Shopify Partner dashboard
    const scopes = 'read_orders,read_products';
    const redirectUri = `https://rjugqrifeecoxewscqdk.supabase.co/functions/v1/shopify-auth`;
    
    const shopDomain = prompt('Enter your Shopify store domain (e.g., mystore.myshopify.com):');
    
    if (!shopDomain) return;

    const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
      `client_id=${apiKey}&` +
      `scope=${scopes}&` +
      `redirect_uri=${redirectUri}&` +
      `state=${storeId}`;

    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Shopify Integration</h2>
        </div>
        <Button onClick={handleConnect} variant="outline" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          Connect Store
        </Button>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No Shopify stores connected</p>
          <p className="text-sm">Connect your Shopify store to enable purchase-based entries</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {shop.webhook_verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">{shop.shop_domain}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected {new Date(shop.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant={shop.webhook_verified ? 'default' : 'secondary'}>
                {shop.webhook_verified ? 'Active' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Setup Instructions:</strong> After connecting, you'll need to:
        </p>
        <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
          <li>Install the Rafl app from your Shopify Partner dashboard</li>
          <li>Configure webhook endpoints for order events</li>
          <li>Add the rafl.js script to your theme via App Extension</li>
        </ol>
      </div>
    </Card>
  );
}
