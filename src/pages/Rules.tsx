import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, DollarSign, MapPin } from 'lucide-react';

interface Promo {
  id: string;
  title: string;
  prize_description: string;
  prize_amount: number;
  start_date: string | null;
  end_date: string | null;
  rules_text: string | null;
  eligibility_text: string | null;
  max_entries_per_email: number;
  stores: {
    store_name: string;
    store_url: string;
  };
}

export default function Rules() {
  const { promoId } = useParams();
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromo = async () => {
      if (!promoId) {
        setError('Promo ID is required');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('promos')
          .select(`
            *,
            stores (
              store_name,
              store_url
            )
          `)
          .eq('id', promoId)
          .eq('status', 'active')
          .single();

        if (error) throw error;
        setPromo(data);
      } catch (err: any) {
        console.error('Error fetching promo:', err);
        setError('Promo not found or no longer active');
      } finally {
        setLoading(false);
      }
    };

    fetchPromo();
  }, [promoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-8" />
          <Card className="p-8">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Promo Not Found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{promo.title}</h1>
            <p className="text-xl text-muted-foreground">Official Rules</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Prize</p>
                <p className="font-semibold">${promo.prize_amount}</p>
                <p className="text-sm">{promo.prize_description}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">
                  {promo.start_date ? new Date(promo.start_date).toLocaleDateString() : 'TBD'}
                </p>
                <p className="text-sm">
                  to {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'TBD'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Sponsor</p>
                <p className="font-semibold">{promo.stores.store_name}</p>
                <a 
                  href={promo.stores.store_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Store
                </a>
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none mb-8">
            <h2 className="text-2xl font-bold mb-4">Giveaway Rules</h2>
            
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">NO PURCHASE NECESSARY TO ENTER OR WIN</h3>
              <p>
                This giveaway is open to legal residents who meet the eligibility requirements stated below.
                A purchase does not increase your chances of winning. See Alternative Method of Entry (AMOE) below.
              </p>
            </section>

            {promo.eligibility_text && (
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Eligibility</h3>
                <p className="whitespace-pre-wrap">{promo.eligibility_text}</p>
              </section>
            )}

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">How to Enter</h3>
              <p>
                Entries can be received through email signup, purchases, or through the Alternative Method of Entry.
                Maximum of {promo.max_entries_per_email} {promo.max_entries_per_email === 1 ? 'entry' : 'entries'} per email address.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Alternative Method of Entry (AMOE)</h3>
              <p>
                To enter without making a purchase or signing up, see our{' '}
                <Link to={`/amoe/${promo.id}`} className="text-primary hover:underline">
                  Free Entry Instructions
                </Link>
                . Free entries have the same odds and entry limits as other methods.
              </p>
            </section>

            {promo.rules_text && (
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Additional Terms</h3>
                <div className="whitespace-pre-wrap">
                  {promo.rules_text
                    .replace(/{PRIZE_AMOUNT}/g, `$${promo.prize_amount.toLocaleString()}`)
                    .replace(/{START_DATE}/g, promo.start_date ? new Date(promo.start_date).toLocaleDateString() : '[Start Date]')
                    .replace(/{END_DATE}/g, promo.end_date ? new Date(promo.end_date).toLocaleDateString() : '[End Date]')}
                </div>
              </section>
            )}

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Winner Selection</h3>
              <p>
                Winner(s) will be selected at random from all eligible entries received during the promotion period.
                Winner will be notified via email within 7 days of the drawing.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Privacy</h3>
              <p>
                Your information will be used in accordance with our privacy policy and will not be sold to third parties.
                By entering, you consent to receive communications from {promo.stores.store_name} and Rafl.
              </p>
            </section>
          </div>

          <div className="flex gap-4">
            <Link to={`/amoe/${promo.id}`}>
              <Button variant="outline">Free Entry Instructions</Button>
            </Link>
            <a href={promo.stores.store_url} target="_blank" rel="noopener noreferrer">
              <Button>Visit Store</Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
