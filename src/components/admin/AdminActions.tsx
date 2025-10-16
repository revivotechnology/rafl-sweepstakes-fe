import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Download,
  Plus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Promo } from '@/types/admin';

interface AdminActionsProps {
  promos: Promo[];
  onDataReload: () => void;
}

export default function AdminActions({ promos, onDataReload }: AdminActionsProps) {
  // Manual entry form state
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntryEmail, setManualEntryEmail] = useState('');
  const [manualEntryPromoId, setManualEntryPromoId] = useState('');
  const [submittingEntry, setSubmittingEntry] = useState(false);

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
          description: `AMOE entry (1 entry) created for ${manualEntryEmail}`,
        });
        
        // Reset form
        setManualEntryEmail('');
        setManualEntryPromoId('');
        setManualEntryOpen(false);
        
        // Reload data
        onDataReload();
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

  const handleExportWinners = async () => {
    try {
      const response = await (apiClient.get as any)('/api/admin/export/winners', {
        responseType: 'blob'
      });

      if (response.success && response.data) {
        // Create blob from the response data
        const blob = new Blob([response.data], { type: 'text/csv' });
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

  return (
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
          Manually add AMOE (Alternative Method of Entry) entries for any active promo. Each manual entry gives 1 entry.
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
  );
}
