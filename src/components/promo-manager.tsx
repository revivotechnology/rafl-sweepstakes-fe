import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gift, Plus, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Promo {
  id: string;
  title: string;
  prize_description: string;
  prize_amount: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  start_date: string | null;
  end_date: string | null;
  max_entries_per_email: number | null;
  enable_purchase_entries: boolean | null;
  created_at: string;
}

interface PromoManagerProps {
  storeId: string | null;
}

export function PromoManager({ storeId }: PromoManagerProps) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    prize_description: '',
    prize_amount: '',
    status: 'draft' as const,
    start_date: '',
    end_date: '',
    max_entries_per_email: '1',
    enable_purchase_entries: false,
    rules_text: '',
    amoe_instructions: '',
    eligibility_text: '',
  });

  useEffect(() => {
    if (storeId) {
      loadPromos();
    }
  }, [storeId]);

  const loadPromos = async () => {
    if (!storeId) return;

    try {
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (error) {
      console.error('Error loading promos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      prize_description: '',
      prize_amount: '',
      status: 'draft',
      start_date: '',
      end_date: '',
      max_entries_per_email: '1',
      enable_purchase_entries: false,
      rules_text: '',
      amoe_instructions: '',
      eligibility_text: '',
    });
    setEditingPromo(null);
  };

  const handleCreate = async () => {
    if (!storeId || !formData.title || !formData.prize_amount) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const { error } = await supabase.from('promos').insert({
        store_id: storeId,
        title: formData.title,
        prize_description: formData.prize_description,
        prize_amount: parseFloat(formData.prize_amount),
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        max_entries_per_email: parseInt(formData.max_entries_per_email),
        enable_purchase_entries: formData.enable_purchase_entries,
        rules_text: formData.rules_text || null,
        amoe_instructions: formData.amoe_instructions || null,
        eligibility_text: formData.eligibility_text || null,
      });

      if (error) throw error;

      await loadPromos();
      resetForm();

      toast({
        title: 'Promo Created',
        description: 'Your promo has been created successfully',
      });
    } catch (error) {
      console.error('Error creating promo:', error);
      toast({
        title: 'Error',
        description: 'Failed to create promo',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deletePromo = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('promos')
        .delete()
        .eq('id', promoId);

      if (error) throw error;

      await loadPromos();
      toast({
        title: 'Promo Deleted',
        description: 'The promo has been removed',
      });
    } catch (error) {
      console.error('Error deleting promo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promo',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'ended': return 'outline';
      default: return 'outline';
    }
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
          <Gift className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Promos</h2>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Promo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Promo</DialogTitle>
              <DialogDescription>
                Set up a new giveaway promotion with legal compliance features.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Promo Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Cash Giveaway"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="prize_amount">Prize Amount ($) *</Label>
                  <Input
                    id="prize_amount"
                    type="number"
                    placeholder="500"
                    value={formData.prize_amount}
                    onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prize_description">Prize Description</Label>
                <Input
                  id="prize_description"
                  placeholder="$500 cash via PayPal or check"
                  value={formData.prize_description}
                  onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max_entries">Max Entries per Email</Label>
                  <Input
                    id="max_entries"
                    type="number"
                    value={formData.max_entries_per_email}
                    onChange={(e) => setFormData({ ...formData, max_entries_per_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enable_purchase"
                  checked={formData.enable_purchase_entries}
                  onChange={(e) => setFormData({ ...formData, enable_purchase_entries: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="enable_purchase" className="font-normal cursor-pointer">
                  Enable purchase-based entries
                </Label>
              </div>

              <div>
                <Label htmlFor="eligibility">Eligibility Requirements</Label>
                <Textarea
                  id="eligibility"
                  placeholder="e.g., Must be 18+ and US resident..."
                  value={formData.eligibility_text}
                  onChange={(e) => setFormData({ ...formData, eligibility_text: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <div className="mb-2">
                  <Label htmlFor="rules" className="text-base font-semibold">Sweepstakes Rules</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{PRIZE_AMOUNT}"}, {"{START_DATE}"}, and {"{END_DATE}"} as placeholders
                  </p>
                </div>
                <Textarea
                  id="rules"
                  placeholder="Enter your complete sweepstakes rules here..."
                  value={formData.rules_text}
                  onChange={(e) => setFormData({ ...formData, rules_text: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="border-t pt-4">
                <div className="mb-2">
                  <Label htmlFor="amoe" className="text-base font-semibold">No Purchase Necessary (AMOE)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{PRIZE_AMOUNT}"}, {"{START_DATE}"}, and {"{END_DATE}"} as placeholders
                  </p>
                </div>
                <Textarea
                  id="amoe"
                  placeholder="Enter your AMOE/free entry method instructions here..."
                  value={formData.amoe_instructions}
                  onChange={(e) => setFormData({ ...formData, amoe_instructions: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <Button
                variant="default"
                className="w-full"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Promo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No promos yet</p>
          <p className="text-sm">Create your first promo to start collecting entries</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium">{promo.title}</h3>
                  <Badge variant={getStatusColor(promo.status)}>
                    {promo.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  ${promo.prize_amount.toLocaleString()} • {promo.prize_description || 'No description'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {promo.start_date && `Starts ${new Date(promo.start_date).toLocaleDateString()}`}
                  {promo.end_date && ` • Ends ${new Date(promo.end_date).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/rules/${promo.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePromo(promo.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
