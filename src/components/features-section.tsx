import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Shield, 
  Mail, 
  BarChart3,
  Sparkles,
  CreditCard,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Prize Pools",
    description: "Join existing pools or create your own. Prizes grow automatically as more stores participate.",
    badge: "Core"
  },
  {
    icon: Users,
    title: "Cross-Store Network",
    description: "Tap into thousands of customers from partner stores. Expand your reach exponentially.",
    badge: "Growth"
  },
  {
    icon: TrendingUp,
    title: "Revenue Amplification",
    description: "Average 340% increase in email signups and 180% boost in purchase conversion rates.",
    badge: "Impact"
  },
  {
    icon: Shield,
    title: "Fraud Protection",
    description: "Built-in fraud detection and legal compliance across all 50 states.",
    badge: "Security"
  },
  {
    icon: Mail,
    title: "Email Marketing Engine",
    description: "Automated cross-promotion campaigns that drive traffic between network stores.",
    badge: "Marketing"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track performance, ROI, and customer acquisition with detailed dashboards.",
    badge: "Analytics"
  },
  {
    icon: Sparkles,
    title: "One-Click Setup",
    description: "Install in minutes with our Shopify app. No coding required.",
    badge: "Ease"
  },
  {
    icon: CreditCard,
    title: "Automated Payouts",
    description: "Winners receive payments instantly. Full escrow and tax documentation included.",
    badge: "Finance"
  },
  {
    icon: Globe,
    title: "Global Compliance",
    description: "Legal frameworks for international giveaways with automatic regulation checking.",
    badge: "Legal"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-accent/20 text-accent">
            Features
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <br />
            <span className="text-transparent bg-gradient-primary bg-clip-text">
              Dominate Your Market
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform handles the complexity so you can focus on growing your business
            through the power of network-driven giveaways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card/50 backdrop-blur-sm border-border hover:shadow-card transition-smooth hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}