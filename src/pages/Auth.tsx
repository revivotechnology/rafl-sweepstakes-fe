import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Zap, Store, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Redirect to dashboard if already logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !storeName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.post('/api/auth/signup', {
        email,
        password,
        name,
        storeName,
        storeUrl: storeUrl || ''
      });

      if (response.success && response.data) {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.data.token);
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('store', JSON.stringify(response.data.store));

        toast({
          title: "Welcome to Rafl!",
          description: "Your account has been created successfully.",
        });

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        toast({
          title: "Sign Up Error",
          description: response.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.post('/api/auth/signin', {
        email,
        password,
      });

      if (response.success && response.data) {
        // Store token in localStorage (get from session.access_token)
        const token = response.data.session?.access_token;
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('store', JSON.stringify(response.data.store));

        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });

        // Check if user is admin and redirect accordingly
        const userRole = response.data.user?.role;
        if (userRole === 'admin') {
          setTimeout(() => {
            navigate('/admin');
          }, 500);
        } else {
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        }
      } else {
        toast({
          title: "Sign In Error",
          description: response.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement password reset endpoint
      toast({
        title: "Feature Coming Soon",
        description: "Password reset will be available soon. Please contact support.",
      });
      setShowPasswordReset(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShopifyConnect = () => {
    // Get shop domain from user input
    const shopDomain = prompt('Enter your Shopify store domain (e.g., your-store or your-store.myshopify.com):');
    
    if (!shopDomain) {
      toast({
        title: "Shop Domain Required",
        description: "Please enter your Shopify store domain",
        variant: "destructive",
      });
      return;
    }
    
    // Redirect to Shopify OAuth
    const oauthUrl = `http://localhost:4000/api/auth/shopify?shop=${encodeURIComponent(shopDomain)}`;
    console.log('Redirecting to:', oauthUrl);
    
    // Force redirect
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Rafl</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-primary text-white">
              <Store className="w-3 h-3 mr-1" />
              Store Owner Portal
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Join Rafl</h1>
            <p className="text-muted-foreground">
              Create an account to start offering life-changing prizes to your customers
            </p>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input
                      id="store-name"
                      type="text"
                      placeholder="Your Store Name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-url">Store URL (Optional)</Label>
                    <Input
                      id="store-url"
                      type="url"
                      placeholder="https://yourstore.com"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                {/* Shopify Connect Section */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or connect with Shopify
                    </span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  className="w-full" 
                  variant="outline"
                  onClick={handleShopifyConnect}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Connect with Shopify
                </Button>
              </TabsContent>

              <TabsContent value="signin" className="space-y-4">
                {!showPasswordReset ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowPasswordReset(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter your email and we'll send you a reset link
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordReset(false)}
                        disabled={loading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}