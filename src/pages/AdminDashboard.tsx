import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  LogOut,
  Settings,
  Crown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Store, Promo, Entry, Winner, AdminStats } from '@/types/admin';
import StatsCards from '@/components/admin/StatsCards';
import AdminActions from '@/components/admin/AdminActions';
import DataTables from '@/components/admin/DataTables';
import DetailsModal from '@/components/admin/DetailsModal';


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


  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

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


  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
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
        <StatsCards stats={stats} onCardClick={openModal} />

        {/* Admin Actions */}
        <AdminActions promos={promos} onDataReload={loadAdminData} />

        {/* Data Tables */}
        <DataTables 
          stores={stores}
          promos={promos}
          entries={entries}
          winners={winners}
          onDataReload={loadAdminData}
        />
      </div>

      {/* Details Modal */}
      <DetailsModal
        isOpen={modalOpen}
        onClose={closeModal}
        modalType={modalType}
        stores={stores}
        promos={promos}
        entries={entries}
        winners={winners}
        stats={stats}
      />
    </div>
  );
}
