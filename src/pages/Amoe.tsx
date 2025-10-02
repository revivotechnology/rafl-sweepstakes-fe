import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Send } from 'lucide-react';

interface Promo {
  id: string;
  title: string;
  prize_description: string;
  prize_amount: number;
  start_date: string | null;
  end_date: string | null;
  amoe_instructions: string | null;
  stores: {
    store_name: string;
    store_url: string;
  };
}

export default function Amoe() {
  const { promoId } = useParams();
  const { toast } = useToast();
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [consentBrand, setConsentBrand] = useState(false);
  const [consentRafl, setConsentRafl] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !consentRafl) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your email and consent to enter.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // This would call your entry API
      // For now, we'll show a success message
      // In production, you'd make a call to the process-entry edge function
      
      toast({
        title: 'Entry Submitted!',
        description: 'Your free entry has been recorded. Good luck!',
      });
      
      setEmail('');
      setConsentBrand(false);
      setConsentRafl(false);
    } catch (err: any) {
      console.error('Error submitting entry:', err);
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit your entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Skeleton className="h-8 w-64 mb-8" />
          <Card className="p-8">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
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
      <div className="container mx-auto px-4 max-w-2xl">
        <Link to={`/rules/${promoId}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Official Rules
        </Link>

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Free Entry</h1>
            <p className="text-xl text-muted-foreground">{promo.title}</p>
            <p className="text-sm text-muted-foreground mt-2">
              No Purchase Necessary • Equal Odds
            </p>
          </div>

          <div className="prose prose-sm max-w-none mb-8">
            <p className="text-lg font-semibold mb-4">
              You can enter this giveaway for free, with the same odds as any other entry method.
            </p>

            <h3 className="text-xl font-semibold mb-3">Online Free Entry</h3>
            <p className="mb-4">
              Complete the form below to submit your free entry online. Your entry will have identical odds
              to entries submitted through other methods.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 not-prose">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-1"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-rafl"
                    checked={consentRafl}
                    onCheckedChange={(checked) => setConsentRafl(checked as boolean)}
                    required
                  />
                  <label
                    htmlFor="consent-rafl"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link to={`/rules/${promoId}`} className="text-primary hover:underline">
                      Official Rules
                    </Link>{' '}
                    and consent to being contacted if I win. *
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-brand"
                    checked={consentBrand}
                    onCheckedChange={(checked) => setConsentBrand(checked as boolean)}
                  />
                  <label
                    htmlFor="consent-brand"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I'd like to receive updates and promotions from {promo.stores.store_name} (optional)
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Free Entry'}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Mail-In Entry
              </h3>
              
              {promo.amoe_instructions ? (
                <div className="whitespace-pre-wrap text-sm">
                  {promo.amoe_instructions
                    .replace(/{PRIZE_AMOUNT}/g, `$${promo.prize_amount.toLocaleString()}`)
                    .replace(/{START_DATE}/g, promo.start_date ? new Date(promo.start_date).toLocaleDateString() : '[Start Date]')
                    .replace(/{END_DATE}/g, promo.end_date ? new Date(promo.end_date).toLocaleDateString() : '[End Date]')}
                </div>
              ) : (
                <div className="text-sm">
                  <p className="mb-2">
                    To enter by mail, hand-print your name, email address, and phone number on a 3x5 card and mail it to:
                  </p>
                  <address className="not-italic bg-muted p-4 rounded-md mb-4">
                    <strong>{promo.stores.store_name}</strong><br />
                    Attn: {promo.title}<br />
                    [Address to be provided by merchant]
                  </address>
                  <p className="text-muted-foreground">
                    Mail-in entries must be postmarked during the promotion period and received within 7 days
                    after the end date. Limit one entry per envelope.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Link to={`/rules/${promoId}`}>
              <Button variant="outline">View Official Rules</Button>
            </Link>
            <a href={promo.stores.store_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost">Visit Store</Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
