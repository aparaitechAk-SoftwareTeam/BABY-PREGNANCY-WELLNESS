import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/users.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/tables/DataTableCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Ban, CheckCircle2, Mail, Calendar, Clock, CreditCard, User as UserIcon } from 'lucide-react';
import { formatDate, formatDateTime } from '@/utils/format';

export function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'suspend' | 'reactivate'>('suspend');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.fetchUserById(id!),
    enabled: !!id,
  });

  const handleAction = async () => {
    if (!user) return;
    if (action === 'suspend') {
      const result = await usersApi.suspendUser(user.id);
      toast({ title: result.success ? 'Account Suspended' : 'Action Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    } else {
      const result = await usersApi.reactivateUser(user.id);
      toast({ title: result.success ? 'Account Reactivated' : 'Action Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    }
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="outline" onClick={() => navigate('/users')}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-navy">User Details</h2>
          <p className="text-sm text-muted-foreground">Limited account information for {user.displayName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/15 text-primary text-xl font-semibold">
                {user.displayName.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-navy">{user.displayName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <StatusBadge status={user.accountStatus} />
              <StatusBadge status={user.subscriptionStatus} />
            </div>
            <Separator />
            <div className="flex w-full flex-col gap-2">
              {user.accountStatus === 'active' ? (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => { setAction('suspend'); setDialogOpen(true); }}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend Account
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full text-sage hover:text-sage"
                  onClick={() => { setAction('reactivate'); setDialogOpen(true); }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Reactivate Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-navy">Account Information</CardTitle>
            <CardDescription>Basic account details (private health data is not shown)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10">
                  <UserIcon className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm font-medium text-navy">{user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-navy">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/15">
                  <Calendar className="h-4 w-4 text-sage" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registration Date</p>
                  <p className="text-sm font-medium text-navy">{formatDate(user.registrationDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blush/20">
                  <Clock className="h-4 w-4 text-blush-dark" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Active</p>
                  <p className="text-sm font-medium text-navy">{formatDateTime(user.lastActiveDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10">
                  <CreditCard className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subscription Plan</p>
                  <p className="text-sm font-medium text-navy">{user.subscriptionPlan || 'N/A'}</p>
                </div>
              </div>
              {user.weekOfPregnancy && (
                <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Week</p>
                    <p className="text-sm font-medium text-navy">Week {user.weekOfPregnancy}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-xs text-amber-800">
                <strong>Privacy Notice:</strong> This view intentionally excludes personal health data including symptoms, mood entries, personal notes, and movement records. Only administrative account information is displayed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'suspend' ? 'Confirm Account Suspension' : 'Confirm Account Reactivation'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'suspend'
                ? `Are you sure you want to suspend ${user.displayName}'s account? The user will lose access to the platform immediately.`
                : `Are you sure you want to reactivate ${user.displayName}'s account? The user will regain access to the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={action === 'suspend' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {action === 'suspend' ? 'Suspend Account' : 'Reactivate Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
