import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DEMO_ADMIN_CREDENTIALS } from '@/constants';
import { Lock, Mail, Loader2, Info } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${user.displayName}`,
      });
      navigate(user.role === 'support_agent' ? '/support-team' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (type: 'admin' | 'support') => {
    if (type === 'admin') {
      setEmail(DEMO_ADMIN_CREDENTIALS.admin.email);
      setPassword(DEMO_ADMIN_CREDENTIALS.admin.password);
    } else {
      setEmail(DEMO_ADMIN_CREDENTIALS.support.email);
      setPassword(DEMO_ADMIN_CREDENTIALS.support.password);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-navy">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access the admin console</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@aparaitech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Info className="h-4 w-4" />
              Demo Authentication (Not for Production)
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Use the following credentials to explore the dashboard:
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => fillDemo('admin')} className="justify-between text-xs">
                <span>Admin: {DEMO_ADMIN_CREDENTIALS.admin.email}</span>
                <span className="text-muted-foreground">{DEMO_ADMIN_CREDENTIALS.admin.password}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => fillDemo('support')} className="justify-between text-xs">
                <span>Support: {DEMO_ADMIN_CREDENTIALS.support.email}</span>
                <span className="text-muted-foreground">{DEMO_ADMIN_CREDENTIALS.support.password}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
