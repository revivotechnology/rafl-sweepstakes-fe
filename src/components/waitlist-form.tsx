import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already signed up!",
            description: "This email is already on our waitlist. We'll notify you when the beta launches!",
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Welcome to the waitlist!",
          description: "We'll notify you when our October 2025 beta giveaway launches.",
        });
      }
      
      setEmail('');
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
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