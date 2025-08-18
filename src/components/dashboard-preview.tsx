import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrizeCounter } from "@/components/ui/prize-counter";
import { 
  TrendingUp, 
  Users, 
  Mail, 
  DollarSign,
  Calendar,
  Crown,
  BarChart3
} from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-20 lg:py-32 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-accent/20 text-accent">
            Dashboard Preview
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Your Command Center for
            <br />
            <span className="text-transparent bg-gradient-primary bg-clip-text">
              Prize Pool Domination
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage giveaways, track performance, and 
            maximize your network effect in one beautiful dashboard.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Main dashboard mockup */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Key metrics */}
              <Card className="p-6 bg-gradient-secondary border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">+23%</Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  <PrizeCounter amount={12500} animateOnMount={false} />
                </div>
                <p className="text-sm text-muted-foreground">Current Prize Pool</p>
              </Card>

              <Card className="p-6 bg-gradient-secondary border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">+156</Badge>
                </div>
                <div className="text-2xl font-bold mb-1">2,847</div>
                <p className="text-sm text-muted-foreground">Active Participants</p>
              </Card>

              <Card className="p-6 bg-gradient-secondary border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
                    <Mail className="w-5 h-5 text-success" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">+34%</Badge>
                </div>
                <div className="text-2xl font-bold mb-1">47.2%</div>
                <p className="text-sm text-muted-foreground">Email Open Rate</p>
              </Card>

              <Card className="p-6 bg-gradient-secondary border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">+89%</Badge>
                </div>
                <div className="text-2xl font-bold mb-1">$18.4K</div>
                <p className="text-sm text-muted-foreground">Revenue This Month</p>
              </Card>
            </div>

            {/* Prize pool visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-secondary border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Prize Pool Growth</h3>
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Base Pool</span>
                    <span className="font-medium">$5,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network Bonus (+73 stores)</span>
                    <span className="font-medium text-success">+$7,500</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Prize</span>
                      <span className="text-xl font-bold text-primary">
                        <PrizeCounter amount={12500} animateOnMount={false} />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Days Remaining</span>
                    <span>12 days</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-secondary border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Network Activity</h3>
                  <Badge variant="outline" className="text-xs">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-sm">New store joined</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2m ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">Prize pool updated</span>
                    </div>
                    <span className="text-xs text-muted-foreground">5m ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span className="text-sm">347 new participants</span>
                    </div>
                    <span className="text-xs text-muted-foreground">15m ago</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}