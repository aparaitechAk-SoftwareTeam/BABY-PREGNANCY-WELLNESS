import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Loader2, ShieldCheck, Database, KeyRound } from 'lucide-react';

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
        title: 'Authentication Successful',
        description: `Welcome back, ${user.displayName}! Signed in with ${user.role === 'admin' ? 'Administrator' : 'Support Specialist'} privileges.`,
      });
      navigate(user.role === 'support_agent' ? '/support-team' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'support') => {
    if (role === 'admin') {
      setEmail('admin@aparaitech.com');
      setPassword('admin123');
    } else {
      setEmail('support@aparaitech.com');
      setPassword('support123');
    }
  };

  return (
    <AuthLayout>
      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-navy">Staff Sign In</CardTitle>
            <Badge variant="outline" className="gap-1 border-emerald-300 bg-emerald-50 text-xs text-emerald-700">
              <Database className="h-3 w-3" /> Live DB
            </Badge>
          </div>
          <CardDescription>
            Enter your authorized AparaiTech Administrator or Support credentials to access the console
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@aparaitech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoCapitalize="none"
                  autoCorrect="off"
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
                  placeholder="Enter your account password"
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
                  Verifying with Database...
                </>
              ) : (
                'Sign In to Console'
              )}
            </Button>
          </form>

          {/* Official Staff Accounts Quick Selector */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                Active Staff Credentials
              </span>
              <span className="text-[11px] text-muted-foreground">Stored in Neon DB</span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Select an account to autofill your verified credentials:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill('admin')}
                className="h-auto flex-col items-start p-2.5 text-left hover:border-primary hover:bg-primary/5"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-semibold text-navy">Administrator</span>
                  <Badge variant="secondary" className="text-[10px]">ADMIN</Badge>
                </div>
                <span className="mt-0.5 text-[11px] text-muted-foreground">admin@aparaitech.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill('support')}
                className="h-auto flex-col items-start p-2.5 text-left hover:border-purple-500 hover:bg-purple-50/50"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-semibold text-navy">Support Team</span>
                  <Badge variant="secondary" className="text-[10px]">SUPPORT</Badge>
                </div>
                <span className="mt-0.5 text-[11px] text-muted-foreground">support@aparaitech.com</span>
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              🔒 256-bit SSL Encrypted • Admins can create additional support accounts in <span className="font-semibold text-slate-700">Role Management</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
