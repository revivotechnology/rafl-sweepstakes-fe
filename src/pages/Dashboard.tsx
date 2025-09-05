import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

interface Store {
  id: string;
  store_name: string;
  store_url: string;
  subscription_tier: string;
  status: string;
}

interface Giveaway {
  id: string;
  title: string;
  prize_amount: number;
  status: string;
  total_entries: number;
  start_date: string;
  end_date: string;
}

interface Participant {
  id: string;
  email: string;
  entry_count: number;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [waitlist, setWaitlist] = useState<Array<{ id: string; email: string; source: string | null; utm_source: string | null; utm_campaign: string | null; utm_medium: string | null; created_at: string; }>>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
        } else {
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            loadDashboardData();
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        loadDashboardData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user exists before making queries
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      // Determine if user is admin
      const { data: adminRole, error: adminRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminRoleError) {
        console.error('Role check error:', adminRoleError);
      }

      const isAdminUser = adminRole !== null;
      setIsAdmin(isAdminUser);

      if (isAdminUser) {
        // Admin: load all stores
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });

        if (storesError) {
          console.error('Stores error:', storesError);
          toast({
            title: 'Error loading stores',
            description: storesError.message,
            variant: 'destructive',
          });
        } else {
          setStores(storesData || []);

          if (storesData && storesData.length > 0) {
            const storeIds = storesData.map(s => s.id);
            const { data: giveawaysData, error: giveawaysError } = await supabase
              .from('giveaways')
              .select('*')
              .in('store_id', storeIds)
              .order('created_at', { ascending: false });

            if (giveawaysError) {
              console.error('Giveaways error:', giveawaysError);
            } else {
              setGiveaways(giveawaysData || []);

              // For admins, do not fetch participants to protect customer emails
              setParticipants([]);
            }
          }
        }

        // Fetch waitlist signups for admin view
        const { data: waitlistData, error: waitlistError } = await supabase
          .from('waitlist')
          .select('*')
          .order('created_at', { ascending: false });

        if (waitlistError) {
          console.error('Waitlist error:', waitlistError);
        } else {
          setWaitlist(waitlistData || []);
        }
      } else {
        // Non-admin: load single store and related data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .maybeSingle();

        if (storeError && storeError.code !== 'PGRST116') {
          console.error('Store error:', storeError);
          toast({
            title: 'Error loading store data',
            description: storeError.message,
            variant: 'destructive',
          });
        } else if (storeData) {
          setStore(storeData);
          
          // Load giveaways for this store
          const { data: giveawaysData, error: giveawaysError } = await supabase
            .from('giveaways')
            .select('*')
            .eq('store_id', storeData.id)
            .order('created_at', { ascending: false });

          if (giveawaysError) {
            console.error('Giveaways error:', giveawaysError);
          } else {
            setGiveaways(giveawaysData || []);
            
            // Load participants for all giveaways
            if (giveawaysData && giveawaysData.length > 0) {
              const giveawayIds = giveawaysData.map(g => g.id);
              const { data: participantsData, error: participantsError } = await supabase
                .from('participants')
                .select('*')
                .in('giveaway_id', giveawayIds)
                .order('created_at', { ascending: false });

              if (participantsError) {
                console.error('Participants error:', participantsError);
              } else {
                setParticipants(participantsData || []);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Dashboard error:', error);
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
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
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

  const totalEntries = participants.length;
  const totalEmails = new Set(participants.map(p => p.email)).size;
  const activeGiveaways = giveaways.filter(g => g.status === 'active').length;

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
                  {isAdmin ? 'Global Admin View' : (store?.store_name || 'Your Store')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Badge variant="default">Admin</Badge>
              )}
              {store && (
                <Badge variant={store.subscription_tier === 'premium' ? 'default' : 'outline'}>
                  {store.subscription_tier === 'premium' ? 'Premium' : 'Free Tier'}
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
                amount={store?.subscription_tier === 'premium' ? 8500 : 1000} 
                animateOnMount={false} 
              />
            </div>
            <p className="text-xs opacity-90">
              {store?.subscription_tier === 'premium' ? 'Network Pool' : 'Individual Prize'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Entries</h3>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">All giveaways</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Email Subscribers</h3>
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalEmails}</div>
            <p className="text-xs text-muted-foreground">Unique emails collected</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Giveaways</h3>
              <Store className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{activeGiveaways}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </Card>
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
                {participants.slice(0, 10).map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium text-sm">{participant.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {participant.entry_count} {participant.entry_count === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(participant.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {participants.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No email subscribers yet</p>
                    <p className="text-xs">Share your giveaway to start collecting emails</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Giveaway Management</h2>
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Giveaway
                </Button>
              </div>
              <div className="space-y-3">
                {giveaways.slice(0, 3).map((giveaway) => (
                  <div key={giveaway.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h3 className="font-medium">{giveaway.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${giveaway.prize_amount.toLocaleString()} • {giveaway.total_entries} entries
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={giveaway.status === 'active' ? 'default' : 'outline'}>
                        {giveaway.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {giveaways.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No giveaways created yet</p>
                    <p className="text-xs">Create your first giveaway to get started</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {isAdmin && (
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
          )}

        </div>
      </div>
    </div>
  );
}