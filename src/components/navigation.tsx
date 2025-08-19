import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const navigate = useNavigate();
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-bold">Rafl</span>
          <Badge variant="secondary" className="ml-2">Beta</Badge>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">
            Pricing
          </a>
          <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-smooth">
            Analytics
          </a>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>
            Start Free
          </Button>
        </div>
      </div>
    </nav>
  );
}