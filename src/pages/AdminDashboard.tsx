import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Store, 
  Users, 
  Mail, 
  Trophy,
  Download,
  Plus,
  Eye,
  LogOut,
  Settings,
  Crown,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Store {
  id: string;
  store_name: string;
  store_url: string;
  subscription_tier: string;
  status: string;
  created_at: string;
}

interface Promo {
  id: string;
  title: string;
  prize_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  store_id: string;
}

interface Entry {
  id: string;
  customer_email: string;
  entry_count: number;
  source: string;
  is_manual: boolean;
  created_at: string;
  promo_id: string;
}

interface Winner {
  id: string;
  customer_email: string;
  customer_name: string;
  prize_description: string;
  drawn_at: string;
  promo_id: string;
  store_id: string;
}

interface AdminStats {
  totalStores: number;
  totalPromos: number;
  totalEntries: number;
  totalWinners: number;
  activePromos: number;
  uniqueEmails: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalStores: 0,
    totalPromos: 0,
    totalEntries: 0,
    totalWinners: 0,
    activePromos: 0,
    uniqueEmails: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Manual entry form state
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntryEmail, setManualEntryEmail] = useState('');
  const [manualEntryPromoId, setManualEntryPromoId] = useState('');
  const [submittingEntry, setSubmittingEntry] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('auth_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      navigate('/auth');
      return;
    }

    if (userData.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin role required to access this page.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
    loadAdminData();
  }, [navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/api/admin/dashboard');

      if (response.success && response.data) {
        // The API client wraps the response, so we need to access response.data.data
        const actualData = response.data.data || response.data;
        const { stores, promos, entries, winners, stats } = actualData;
        
        setStores(stores || []);
        setPromos(promos || []);
        setEntries(entries || []);
        setWinners(winners || []);
        setStats(stats || {
          totalStores: 0,
          totalPromos: 0,
          totalEntries: 0,
          totalWinners: 0,
          activePromos: 0,
          uniqueEmails: 0
        });
      } else {
        toast({
          title: "Error loading admin data",
          description: response.error || "Please try refreshing the page",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading admin data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await apiClient.post('/api/auth/logout', {});
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('store');
      navigate('/');
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('store');
      navigate('/');
    }
  };

  const handleManualEntry = async () => {
    if (!manualEntryEmail || !manualEntryPromoId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingEntry(true);
      
      const response = await apiClient.post('/api/admin/entries/manual', {
        email: manualEntryEmail,
        promoId: manualEntryPromoId,
        source: 'direct'
      });

      if (response.success) {
        toast({
          title: "AMOE Entry Created",
          description: `AMOE entry (1000 entries) created for ${manualEntryEmail}`,
        });
        
        // Reset form
        setManualEntryEmail('');
        setManualEntryPromoId('');
        setManualEntryOpen(false);
        
        // Reload data
        loadAdminData();
      } else {
        toast({
          title: "Error Creating Entry",
          description: response.data?.message || response.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Creating Entry",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmittingEntry(false);
    }
  };

  const handleSelectWinner = async (promoId: string) => {
    try {
      const response = await apiClient.post('/api/winners/select', {
        promoId: promoId
      });

      if (response.success) {
        toast({
          title: "Winner Selected!",
          description: `Winner: ${response.data.winner.customer_email}`,
        });
        loadAdminData();
      } else {
        toast({
          title: "Error Selecting Winner",
          description: response.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Selecting Winner",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleExportEntries = async (promoId: string) => {
    try {
      const response = await fetch(`/api/admin/export/entries/${promoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entries_${promoId}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: "Entries CSV downloaded",
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Could not download entries",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not download entries",
        variant: "destructive",
      });
    }
  };

  const handleExportWinners = async () => {
    try {
      const response = await fetch('/api/admin/export/winners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winners_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: "Winners CSV downloaded",
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Could not download winners",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not download winners",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  System Overview & Management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-red-500">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </Badge>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Stores</h3>
              <Store className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Promos</h3>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalPromos}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Entries</h3>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Unique Emails</h3>
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.uniqueEmails}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Promos</h3>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.activePromos}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Winners</h3>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalWinners}</div>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Manual Entry Management</h2>
              <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add AMOE Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add AMOE Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={manualEntryEmail}
                        onChange={(e) => setManualEntryEmail(e.target.value)}
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="promo">Promo</Label>
                      <Select value={manualEntryPromoId} onValueChange={setManualEntryPromoId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a promo" />
                        </SelectTrigger>
                        <SelectContent>
                          {promos.map((promo) => (
                            <SelectItem key={promo.id} value={promo.id}>
                              {promo.title} - ${promo.prize_amount}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setManualEntryOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleManualEntry} disabled={submittingEntry}>
                        {submittingEntry ? 'Creating...' : 'Create AMOE Entry'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manually add AMOE (Alternative Method of Entry) entries for any active promo. Each AMOE entry gives the maximum entries (1000).
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Data Export</h2>
              <Button variant="outline" onClick={handleExportWinners}>
                <Download className="w-4 h-4 mr-2" />
                Export Winners
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Download CSV files of all winners and entries
            </p>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stores Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Stores</h2>
              <Badge variant="outline">{stores.length} total</Badge>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.slice(0, 10).map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.store_name}</TableCell>
                      <TableCell>
                        <Badge variant={store.subscription_tier === 'premium' ? 'default' : 'outline'}>
                          {store.subscription_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={store.status === 'active' ? 'default' : 'outline'}>
                          {store.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Promos Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Promos</h2>
              <Badge variant="outline">{promos.length} total</Badge>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promos.slice(0, 10).map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">{promo.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {promo.prize_amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={promo.status === 'active' ? 'default' : 'outline'}>
                          {promo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportEntries(promo.id)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          {promo.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectWinner(promo.id)}
                            >
                              <Trophy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Recent Entries */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Entries</h2>
            <Badge variant="outline">{entries.length} total</Badge>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Entry Count</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.slice(0, 20).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.customer_email}</TableCell>
                    <TableCell>{entry.entry_count}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.is_manual ? 'default' : 'outline'}>
                        {entry.is_manual ? 'Manual' : 'Purchase'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Recent Winners */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Winners</h2>
            <Badge variant="outline">{winners.length} total</Badge>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Winner Email</TableHead>
                  <TableHead>Winner Name</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Drawn At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.slice(0, 20).map((winner) => (
                  <TableRow key={winner.id}>
                    <TableCell className="font-medium">{winner.customer_email}</TableCell>
                    <TableCell>{winner.customer_name || '-'}</TableCell>
                    <TableCell>{winner.prize_description}</TableCell>
                    <TableCell>{new Date(winner.drawn_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
