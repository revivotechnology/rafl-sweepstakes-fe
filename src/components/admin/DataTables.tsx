import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { 
  Download,
  Trophy,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Store, Promo, Entry, Winner } from '@/types/admin';

interface DataTablesProps {
  stores: Store[];
  promos: Promo[];
  entries: Entry[];
  winners: Winner[];
  onDataReload: () => void;
}

export default function DataTables({ stores, promos, entries, winners, onDataReload }: DataTablesProps) {
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
        onDataReload();
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
      const response = await (apiClient.get as any)(`/api/admin/export/entries/${promoId}`, {
        responseType: 'blob'
      });

      if (response.success && response.data) {
        // Create blob from the response data
        const blob = new Blob([response.data], { type: 'text/csv' });
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

  return (
    <div className="space-y-8">
      {/* Stores and Promos Tables */}
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
      <Card className="p-6">
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
      <Card className="p-6">
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
  );
}
