import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface ApiKeyManagerProps {
  storeId: string | null;
}

export function ApiKeyManager({ storeId }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (storeId) {
      loadApiKeys();
    }
  }, [storeId]);

  const loadApiKeys = async () => {
    if (!storeId) return;

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'rafl_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const hashKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const createApiKey = async () => {
    if (!storeId || !newKeyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the API key',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const apiKey = generateApiKey();
      const keyHash = await hashKey(apiKey);
      const keyPrefix = apiKey.substring(0, 12);

      const { error } = await supabase
        .from('api_keys')
        .insert({
          store_id: storeId,
          name: newKeyName,
          key_hash: keyHash,
          key_prefix: keyPrefix,
        });

      if (error) throw error;

      setGeneratedKey(apiKey);
      setNewKeyName('');
      await loadApiKeys();

      toast({
        title: 'API Key Created',
        description: 'Copy your API key now - it will only be shown once',
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      await loadApiKeys();
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been removed',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">API Keys</h2>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for authenticating entry requests from your ESP or custom integrations.
              </DialogDescription>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Your API Key (save it now - it won't be shown again)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-sm font-mono break-all">
                      {showKey ? generatedKey : '•'.repeat(generatedKey.length)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => setGeneratedKey(null)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Klaviyo Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={createApiKey}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Generate API Key'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No API keys yet</p>
          <p className="text-sm">Create an API key to authenticate entry requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{key.name}</p>
                  <Badge variant={key.is_active ? 'default' : 'secondary'}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {key.key_prefix}••••••••••••
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(key.created_at).toLocaleDateString()}
                  {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteApiKey(key.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Usage:</strong> Include the API key in your requests:
        </p>
        <code className="text-xs mt-1 block bg-background p-2 rounded">
          x-api-key: rafl_••••••••••••
        </code>
      </div>
    </Card>
  );
}
