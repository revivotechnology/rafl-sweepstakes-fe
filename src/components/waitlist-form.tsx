import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/api-client";
import { Mail, Check, Loader2 } from "lucide-react";

interface WaitlistFormProps {
  variant?: 'hero' | 'inline' | 'modal';
  className?: string;
}

export function WaitlistForm({ variant = 'inline', className = '' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, get active promos to create manual entries
      const activePromosResponse = await apiClient.get('/api/entries/active-promos');
      
      let entriesCreated = 0;
      let totalPromos = 0;

      // Handle the API response structure: apiClient returns { success, data }
      // where data is the server response { success, data: { promos: [...] } }
      console.log('Active promos response:', activePromosResponse);
      
      const promos = activePromosResponse.success && activePromosResponse.data?.data?.promos 
        ? activePromosResponse.data.data.promos 
        : [];
      
      console.log('Extracted promos:', promos);

      if (promos.length > 0) {
        totalPromos = promos.length;
        
        // Create manual entries for each active promo
        for (const promo of promos) {
          try {
            const entryResponse = await apiClient.post('/api/entries/manual', {
              email: email.toLowerCase().trim(),
              promoId: promo.id,
              source: 'direct',
              consentBrand: false,
              consentRafl: true
            });
            
            if (entryResponse.success) {
              entriesCreated++;
            } else if (entryResponse.error?.includes('Maximum entries per email reached')) {
              // User already has entries for this promo, that's okay
              console.log(`User already has entries for promo ${promo.id}`);
            } else {
              console.error(`Error creating entry for promo ${promo.id}:`, entryResponse.error);
            }
          } catch (entryError) {
            console.error(`Error creating entry for promo ${promo.id}:`, entryError);
          }
        }
      }

      // Also add to waitlist (this will handle duplicates gracefully)
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            source: 'website',
            utm_source: 'organic',
            utm_campaign: 'october_2025_beta'
          }
        ]);

      if (error && error.code !== '23505') { // 23505 is unique constraint violation (already in waitlist)
        throw error;
      }

      // Show success message
      setIsSuccess(true);
      
      if (entriesCreated > 0) {
        toast({
          title: "Welcome to the giveaway!",
          description: `You've been entered into ${entriesCreated} active giveaway${entriesCreated > 1 ? 's' : ''}! We'll also notify you about future launches.`,
        });
      } else if (totalPromos > 0) {
        toast({
          title: "Already entered!",
          description: "You're already entered in our active giveaways. We'll notify you about future launches!",
        });
      } else {
        toast({
          title: "Welcome to the waitlist!",
          description: "We'll notify you when our next giveaway launches.",
        });
      }
      
      setEmail('');
    } catch (error) {
      console.error('Error joining waitlist:', error);
      
      // Check if it's a network error (backend not running)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please make sure the backend is running.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess && variant !== 'hero') {
    return (
      <div className={`flex items-center gap-2 text-success ${className}`}>
        <Check className="w-5 h-5" />
        <span className="text-sm font-medium">You're on the waitlist!</span>
      </div>
    );
  }

  const isHero = variant === 'hero';

  return (
    <div className={className}>
      {isHero && (
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/5">
            🎉 October 2025 Beta Launch
          </Badge>
          <h3 className="text-2xl font-bold mb-2">Join the Waitlist</h3>
          <p className="text-muted-foreground">
            Be the first to know when our beta giveaway launches with life-changing prizes
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="pl-10"
            required
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !email}
          variant="primary"
          className="shadow-primary whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            'Join Waitlist'
          )}
        </Button>
      </form>
      
      {isHero && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          No spam, ever. We'll only email you about the beta launch.
        </p>
      )}
    </div>
  );
}