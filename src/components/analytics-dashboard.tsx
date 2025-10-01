import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  AlertTriangle,
  Mail,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsDashboardProps {
  storeId: string | null;
}

interface AnalyticsData {
  totalEntries: number;
  purchaseEntries: number;
  amoeEntries: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  fraudAlerts: number;
  entryTrend: Array<{ date: string; count: number }>;
  sourcesBreakdown: Array<{ name: string; value: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard({ storeId }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEntries: 0,
    purchaseEntries: 0,
    amoeEntries: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    fraudAlerts: 0,
    entryTrend: [],
    sourcesBreakdown: [],
  });

  useEffect(() => {
    if (storeId) {
      loadAnalytics();
    }
  }, [storeId]);

  const loadAnalytics = async () => {
    if (!storeId) return;

    try {
      // Get all giveaways for this store
      const { data: giveaways, error: giveawaysError } = await supabase
        .from('giveaways')
        .select('id')
        .eq('store_id', storeId);

      if (giveawaysError) throw giveawaysError;

      const giveawayIds = giveaways?.map(g => g.id) || [];

      if (giveawayIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get participants data
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('giveaway_id', giveawayIds);

      if (participantsError) throw participantsError;

      // Get entries data for fraud detection
      const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('*, promos!inner(store_id)')
        .eq('promos.store_id', storeId);

      if (entriesError) throw entriesError;

      // Get purchase data
      const { data: shopifyShops } = await supabase
        .from('shopify_shops')
        .select('id')
        .eq('store_id', storeId);

      const shopIds = shopifyShops?.map(s => s.id) || [];
      
      let purchases: any[] = [];
      if (shopIds.length > 0) {
        const { data: purchasesData } = await supabase
          .from('purchases')
          .select('*')
          .in('shopify_shop_id', shopIds);
        purchases = purchasesData || [];
      }

      // Calculate metrics
      const totalEntries = participants?.length || 0;
      const purchaseEntries = participants?.filter(p => p.entry_type === 'purchase').length || 0;
      const amoeEntries = totalEntries - purchaseEntries;
      
      const totalRevenue = purchases.reduce((sum, p) => sum + parseFloat(p.total_amount_usd), 0);
      const avgOrderValue = purchases.length > 0 ? totalRevenue / purchases.length : 0;
      
      const conversionRate = totalEntries > 0 ? (purchaseEntries / totalEntries) * 100 : 0;

      // Fraud detection: check for suspicious patterns
      const ipCounts: Record<string, number> = {};
      entries?.forEach((entry: any) => {
        if (entry.ip_address) {
          const ip = entry.ip_address as string;
          ipCounts[ip] = (ipCounts[ip] || 0) + 1;
        }
      });
      const fraudAlerts = Object.values(ipCounts).filter(count => count > 5).length;

      // Entry trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const entryTrend = last7Days.map(date => ({
        date,
        count: participants?.filter(p => 
          p.created_at.startsWith(date)
        ).length || 0,
      }));

      // Sources breakdown
      const sourcesMap: Record<string, number> = {};
      entries?.forEach((entry: any) => {
        if (entry.source) {
          sourcesMap[entry.source as string] = (sourcesMap[entry.source as string] || 0) + 1;
        }
      });

      const sourcesBreakdown = Object.entries(sourcesMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      setAnalytics({
        totalEntries,
        purchaseEntries,
        amoeEntries,
        totalRevenue,
        avgOrderValue,
        conversionRate,
        fraudAlerts,
        entryTrend,
        sourcesBreakdown,
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{analytics.totalEntries}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.purchaseEntries} from purchases
              </p>
            </div>
            <Users className="w-8 h-8 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ${analytics.avgOrderValue.toFixed(2)} AOV
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                {analytics.conversionRate > 10 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <p className="text-xs text-muted-foreground">
                  Entry to purchase
                </p>
              </div>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fraud Alerts</p>
              <p className="text-2xl font-bold">{analytics.fraudAlerts}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Suspicious IPs
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 opacity-20 ${analytics.fraudAlerts > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trend" className="w-full">
        <TabsList>
          <TabsTrigger value="trend">Entry Trend</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Entry Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.entryTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Entries"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Entry Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.sourcesBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.sourcesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Purchase vs AMOE</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Purchase Entries', value: analytics.purchaseEntries },
                { name: 'AMOE Entries', value: analytics.amoeEntries },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fraud Alerts */}
      {analytics.fraudAlerts > 0 && (
        <Card className="p-6 border-red-500/50">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-500">Fraud Alerts</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Detected {analytics.fraudAlerts} IP addresses with more than 5 entries. 
            Review your entry logs for potential abuse.
          </p>
        </Card>
      )}
    </div>
  );
}
