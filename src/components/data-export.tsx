import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataExportProps {
  storeId: string | null;
}

export function DataExport({ storeId }: DataExportProps) {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'entries' | 'participants' | 'purchases'>('entries');

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no data to export',
        variant: 'destructive',
      });
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Complete',
      description: `Downloaded ${data.length} records`,
    });
  };

  const handleExport = async () => {
    if (!storeId) {
      toast({
        title: 'Error',
        description: 'No store selected',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);

    try {
      switch (exportType) {
        case 'entries': {
          const { data: promos } = await supabase
            .from('promos')
            .select('id')
            .eq('store_id', storeId);

          const promoIds = promos?.map(p => p.id) || [];

          if (promoIds.length === 0) {
            toast({
              title: 'No Data',
              description: 'No promos found for this store',
              variant: 'destructive',
            });
            return;
          }

          const { data: entries, error } = await supabase
            .from('entries')
            .select('id, promo_id, source, created_at, metadata')
            .in('promo_id', promoIds)
            .order('created_at', { ascending: false });

          if (error) throw error;

          exportToCSV(entries || [], 'entries');
          break;
        }

        case 'participants': {
          const { data: giveaways } = await supabase
            .from('giveaways')
            .select('id')
            .eq('store_id', storeId);

          const giveawayIds = giveaways?.map(g => g.id) || [];

          if (giveawayIds.length === 0) {
            toast({
              title: 'No Data',
              description: 'No giveaways found for this store',
              variant: 'destructive',
            });
            return;
          }

          const { data: participants, error } = await supabase
            .from('participants')
            .select('id, giveaway_id, email, entry_count, entry_type, created_at')
            .in('giveaway_id', giveawayIds)
            .order('created_at', { ascending: false });

          if (error) throw error;

          exportToCSV(participants || [], 'participants');
          break;
        }

        case 'purchases': {
          const { data: shops } = await supabase
            .from('shopify_shops')
            .select('id')
            .eq('store_id', storeId);

          const shopIds = shops?.map(s => s.id) || [];

          if (shopIds.length === 0) {
            toast({
              title: 'No Data',
              description: 'No Shopify shops connected',
              variant: 'destructive',
            });
            return;
          }

          const { data: purchases, error } = await supabase
            .from('purchases')
            .select('id, shopify_order_id, customer_email, total_amount_usd, currency, order_date, created_at')
            .in('shopify_shop_id', shopIds)
            .order('order_date', { ascending: false });

          if (error) throw error;

          exportToCSV(purchases || [], 'purchases');
          break;
        }
      }

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting data',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Data Export</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Export your data to CSV for further analysis or record keeping
      </p>

      <div className="flex items-center space-x-3">
        <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entries">Entries</SelectItem>
            <SelectItem value="participants">Participants</SelectItem>
            <SelectItem value="purchases">Purchases</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={handleExport} 
          disabled={exporting || !storeId}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Sensitive data like email hashes are exported for compliance. 
          Handle all exports securely and in accordance with privacy regulations.
        </p>
      </div>
    </Card>
  );
}
