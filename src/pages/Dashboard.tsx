import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrizeCounter } from '@/components/ui/prize-counter';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { 
  Zap, 
  Store, 
  Users, 
  Mail, 
  TrendingUp, 
  Copy, 
  ExternalLink,
  LogOut,
  Settings,
  Plus,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ShopifyConnect } from '@/components/shopify-connect';
import { ApiKeyManager } from '@/components/api-key-manager';
import { PromoManager } from '@/components/promo-manager';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { DataExport } from '@/components/data-export';

interface Store {
  id: string;
  storeName: string;
  storeUrl: string;
  subscriptionTier: string;
  status: string;
}

interface Promo {
  id: string;
  title: string;
  prizeAmount: number;
  status: string;
  totalEntries: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Entry {
  id: string;
  email: string;
  entryCount: number;
  source: string;
  createdAt: string;
}

interface DashboardStats {
  totalEntries: number;
  uniqueEmails: number;
  activePromos: number;
  prizePool: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    uniqueEmails: 0,
    activePromos: 0,
    prizePool: 1000
  });
  const [loading, setLoading] = useState(true);
  
  // TODO: Restore when implementing admin features
  // const [waitlist, setWaitlist] = useState<Array<{ id: string; email: string; source: string | null; utm_source: string | null; utm_campaign: string | null; utm_medium: string | null; created_at: string; }>>([]);
  // const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for token in URL parameters (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const shopifyConnected = urlParams.get('shopify_connected');
    
    if (urlToken) {
      // Store token from OAuth callback
      localStorage.setItem('auth_token', urlToken);
      
      // Show success message
      if (shopifyConnected === 'true') {
        toast({
          title: "Shopify Connected!",
          description: "Your store has been successfully connected.",
        });
      }
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      navigate('/auth');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/api/dashboard');

      if (response.success && response.data) {
        const { store: storeData, promos: promosData, entries: entriesData, stats: statsData } = response.data;
        
        setStore(storeData);
        setPromos(promosData || []);
        setEntries(entriesData || []);
        setStats(statsData || {
          totalEntries: 0,
          uniqueEmails: 0,
          activePromos: 0,
          prizePool: 1000
        });

        // TODO: Restore when implementing admin features
        // Check if user is admin
        // const userData = JSON.parse(localStorage.getItem('user') || '{}');
        // if (userData.role === 'admin') {
        //   setIsAdmin(true);
        //   // Fetch waitlist data for admin
        //   const waitlistResponse = await apiClient.get('/api/waitlist');
        //   if (waitlistResponse.success && waitlistResponse.data) {
        //     setWaitlist(waitlistResponse.data);
        //   }
        // }
      } else {
        toast({
          title: "Error loading dashboard",
          description: response.error || "Please try refreshing the page",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Call logout endpoint
      await apiClient.post('/api/auth/logout', {});
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('store');
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      // Clear local storage anyway
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('store');
      navigate('/');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard",
    });
  };

  const widgetCode = `<script>
  (function() {
    var raffleScript = document.createElement('script');
    raffleScript.src = 'https://cdn.rafl.com/widget.js';
    raffleScript.setAttribute('data-store-id', '${store?.id || 'YOUR_STORE_ID'}');
    document.head.appendChild(raffleScript);
  })();
</script>`;

  const adCopy = `🎉 WIN $${store?.subscription_tier === 'premium' ? '8,500' : '1,000'} CASH! 🎉

Enter our exclusive giveaway for a chance to win life-changing money! 

✨ Easy to enter
🎯 Fair & transparent
💰 Real cash prizes

Enter now at ${store?.store_url || 'your-store.com'}

#Giveaway #CashPrize #Rafl`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Rafl Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {store?.storeName || 'Your Store'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* TODO: Restore when implementing admin features */}
              {/* {isAdmin && (
                <Badge variant="default">Admin</Badge>
              )} */}
              {store && (
                <Badge variant={store.subscriptionTier === 'premium' ? 'default' : 'outline'}>
                  {store.subscriptionTier === 'premium' ? 'Premium' : 'Free Tier'}
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-primary text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Current Prize Pool</h3>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">
              <PrizeCounter 
                amount={stats.prizePool} 
                animateOnMount={false} 
              />
            </div>
            <p className="text-xs opacity-90">
              {store?.subscriptionTier === 'premium' ? 'Network Pool' : 'Individual Prize'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Entries</h3>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground">All promos</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Email Subscribers</h3>
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.uniqueEmails}</div>
            <p className="text-xs text-muted-foreground">Unique emails collected</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Promos</h3>
              <Store className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.activePromos}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </Card>
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" id="promo-manager">
          <PromoManager storeId={store?.id || null} />
          <ApiKeyManager storeId={store?.id || null} />
          <DataExport storeId={store?.id || null} />
        </div>

        <div className="mb-8">
          <ShopifyConnect storeId={store?.id || null} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Widget Code & Marketing Materials */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Giveaway Widget Code</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(widgetCode)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Add this code to your website to display the giveaway widget
              </p>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                {widgetCode}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Marketing Copy</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(adCopy)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Use this copy for social media posts and advertisements
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-line">
                {adCopy}
              </div>
            </Card>
          </div>

          {/* Email List & Campaign Stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Email Subscribers</h2>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {entries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium text-sm">{entry.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.entryCount} {entry.entryCount === 1 ? 'entry' : 'entries'} • {entry.source}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {entries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No entries yet</p>
                    <p className="text-xs">Share your promo to start collecting entries</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Giveaway Management</h2>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => window.location.href = '#promo-manager'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Giveaway
                </Button>
              </div>
              <div className="space-y-3">
                {promos.slice(0, 3).map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h3 className="font-medium">{promo.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${promo.prizeAmount.toLocaleString()} • {promo.totalEntries} entries
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={promo.status === 'active' ? 'default' : 'outline'}>
                        {promo.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {promos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No promos created yet</p>
                    <p className="text-xs">Create your first promo to get started</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* TODO: Restore when implementing analytics with MongoDB backend */}
        {/* <div className="mb-8">
          <AnalyticsDashboard storeId={store?.id || null} />
        </div> */}

        {/* TODO: Restore when implementing admin features and waitlist */}
        {/* Admin Waitlist Section */}
        {/* {isAdmin && (
          <div className="mt-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Waitlist Signups</h2>
              </div>
              {waitlist.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>UTM Campaign</TableHead>
                      <TableHead>UTM Source</TableHead>
                      <TableHead>UTM Medium</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitlist.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.email}</TableCell>
                        <TableCell>{w.source || '-'}</TableCell>
                        <TableCell>{w.utm_campaign || '-'}</TableCell>
                        <TableCell>{w.utm_source || '-'}</TableCell>
                        <TableCell>{w.utm_medium || '-'}</TableCell>
                        <TableCell>{new Date(w.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No waitlist signups yet</p>
                </div>
              )}
            </Card>
          </div>
        )} */}
      </div>
    </div>
  );
}