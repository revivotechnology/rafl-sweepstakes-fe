import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrizeCounter } from "@/components/ui/prize-counter";
import { WaitlistForm } from "./waitlist-form";

import { ArrowRight, Zap, Store, Users, DollarSign } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-secondary opacity-50" />
      
      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Beta announcement */}
          <Badge variant="outline" className="mb-6 border-primary/20 text-primary">
            🎉 Now in Beta - Join 500+ Shopify stores
          </Badge>

          {/* Main headline */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Turn Your Store Into a
            <br />
            <span className="text-transparent bg-gradient-prize bg-clip-text">
              Conversion Machine with Giveaways
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be among the first to experience the network effect. Our October 2025 beta will feature 
            life-changing cash prizes and revolutionary cross-store promotion technology.
          </p>

          {/* Prize showcase */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 mb-8 shadow-card">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">This Month's Prize Pool</p>
                <div className="text-5xl lg:text-6xl font-bold">
                  <PrizeCounter amount={12500} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  From 73 participating stores
                </p>
              </div>
              
              <div className="hidden lg:block w-px h-20 bg-border" />
              
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3 mx-auto">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">73</div>
                  <div className="text-sm text-muted-foreground">Active Stores</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-3 mx-auto">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">24.3K</div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </div>
              </div>
            </div>
          </div>

          {/* Waitlist CTA */}
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 mb-8 shadow-card">
            <WaitlistForm variant="hero" />
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Store Owner? Sign Up
            </Button>
            <Button variant="ghost" size="lg">
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Trusted by Shopify stores worldwide</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Shopify Plus Compatible</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">$2M+ in Prizes Awarded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}