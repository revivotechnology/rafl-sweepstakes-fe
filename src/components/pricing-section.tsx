import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrizeCounter } from "@/components/ui/prize-counter";
import { Check, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Free Tier",
    price: 0,
    description: "Perfect for getting started with smaller prizes",
    features: [
      "Up to $1,000 monthly prizes",
      "Basic giveaway widget",
      "Email collection tools",
      "Standard analytics",
      "Community support"
    ],
    cta: "Start Free",
    popular: false,
    prizeAmount: 1000
  },
  {
    name: "Premium",
    price: 149,
    description: "Join the network for life-changing prizes",
    features: [
      "Access to $5,000+ pooled prizes",
      "Cross-store customer sharing",
      "Advanced email marketing",
      "Real-time analytics dashboard",
      "Priority support",
      "Custom branding options",
      "Fraud protection included",
      "Automated winner selection"
    ],
    cta: "Start Premium Trial",
    popular: true,
    prizeAmount: 8500
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-success/20 text-success">
            Pricing
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Choose Your
            <br />
            <span className="text-transparent bg-gradient-prize bg-clip-text">
              Prize Power
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free with smaller prizes, or join our premium network for 
            life-changing prize pools that grow with every store.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 relative ${
                plan.popular 
                  ? 'bg-gradient-secondary border-primary shadow-primary' 
                  : 'bg-card/50 backdrop-blur-sm'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    {plan.price === 0 ? "Your max prize" : "Current network prize"}
                  </p>
                  <div className="text-3xl font-bold">
                    <PrizeCounter amount={plan.prizeAmount} animateOnMount={false} />
                  </div>
                  {plan.price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Grows with network size
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-5 h-5 bg-success/10 rounded-full">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.popular ? "primary" : "outline"} 
                className="w-full"
                size="lg"
              >
                {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
          <p className="text-xs text-muted-foreground">
            Premium tier pricing scales with network size. Current rate: $149/month for stores earning $10K+/month
          </p>
        </div>
      </div>
    </section>
  );
}