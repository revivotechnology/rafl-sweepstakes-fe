import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mail, 
  Trophy
} from 'lucide-react';
import { Store, Promo, Entry, Winner, AdminStats } from '@/types/admin';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: string | null;
  stores: Store[];
  promos: Promo[];
  entries: Entry[];
  winners: Winner[];
  stats: AdminStats;
}

export default function DetailsModal({ 
  isOpen, 
  onClose, 
  modalType, 
  stores, 
  promos, 
  entries, 
  winners, 
  stats 
}: DetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {modalType === 'stores' && 'Store Details'}
            {modalType === 'promos' && 'Promo Details'}
            {modalType === 'entries' && 'Entry Details'}
            {modalType === 'emails' && 'Unique Email Addresses'}
            {modalType === 'active' && 'Active Promos'}
            {modalType === 'winners' && 'Winner Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {modalType === 'stores' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Total of {stores.length} stores in the system
              </div>
              <div className="grid gap-4">
                {stores.map((store) => (
                  <Card key={store.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{store.store_name}</h3>
                        <p className="text-sm text-muted-foreground">{store.store_url}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Badge variant={store.subscription_tier === 'premium' ? 'default' : 'outline'}>
                              {store.subscription_tier}
                            </Badge>
                          </span>
                          <span className="flex items-center gap-1">
                            <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                              {store.status}
                            </Badge>
                          </span>
                        </div>
                        {store.shopify_domain && (
                          <p className="text-sm text-green-600">🛒 Connected to Shopify: {store.shopify_domain}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Created: {new Date(store.created_at).toLocaleDateString()}</p>
                        <p>ID: {store.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {modalType === 'promos' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Total of {promos.length} promos in the system
              </div>
              <div className="grid gap-4">
                {promos.map((promo) => {
                  const store = stores.find(s => s.id === promo.store_id);
                  return (
                    <Card key={promo.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{promo.title}</h3>
                          <p className="text-sm text-muted-foreground">Store: {store?.store_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">Prize: ${promo.prize_amount}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                                {promo.status}
                              </Badge>
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Duration: {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Created: {new Date(promo.created_at).toLocaleDateString()}</p>
                          <p>ID: {promo.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {modalType === 'entries' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Showing {Math.min(entries.length, 20)} of {entries.length} total entries
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {entries.slice(0, 20).map((entry) => (
                  <Card key={entry.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{entry.customer_email}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Entries: {entry.entry_count}</span>
                          <span>Source: {entry.source}</span>
                          <span>Date: {new Date(entry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{entry.source}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {modalType === 'emails' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {stats.uniqueEmails} unique email addresses
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {Array.from(new Set(entries.map(e => e.customer_email))).map((email, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{email}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {modalType === 'active' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {stats.activePromos} active promos
              </div>
              <div className="grid gap-4">
                {promos.filter(p => p.status === 'active').map((promo) => {
                  const store = stores.find(s => s.id === promo.store_id);
                  return (
                    <Card key={promo.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{promo.title}</h3>
                          <p className="text-sm text-muted-foreground">Store: {store?.store_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">Prize: ${promo.prize_amount}</p>
                          <p className="text-sm text-muted-foreground">
                            Ends: {new Date(promo.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {modalType === 'winners' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {stats.totalWinners} winners selected
              </div>
              <div className="grid gap-4">
                {winners.map((winner) => (
                  <Card key={winner.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          {winner.customer_email}
                        </h3>
                        <p className="text-sm text-muted-foreground">Name: {winner.customer_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">Prize: {winner.prize_description}</p>
                        <p className="text-sm text-muted-foreground">
                          Won: {new Date(winner.drawn_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="default">Winner</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
