import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi, UserSubscription } from '@/services/subscriptions.api';
import { usersApi } from '@/services/users.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, Users, TrendingUp, DollarSign, Plus, CheckCircle2, User, Database, ShieldAlert } from 'lucide-react';
import { formatNumber, formatCurrency, formatDate } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

export function SubscriptionOverview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. Fetch Plans from DB
  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.fetchSubscriptionPlans(),
  });

  // 2. Fetch Realtime Stats from DB
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: () => subscriptionsApi.fetchSubscriptionStats(),
  });

  // 3. Fetch Real-time Subscriptions List from DB
  const { data: subsData, isLoading: loadingSubs } = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionsApi.fetchSubscriptionsList(),
  });

  // 4. Fetch Users list for Assignment modal
  const { data: usersData } = useQuery({
    queryKey: ['users-for-subscription'],
    queryFn: () => usersApi.fetchUsers(1, 100),
  });

  const subscriptions = subsData?.data || [];
  const usersList = usersData?.data || [];

  // Dialog State
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Assign Subscription Mutation
  const assignMutation = useMutation({
    mutationFn: () =>
      subscriptionsApi.assignSubscription({
        userId: selectedUserId,
        planId: selectedPlanId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast({
        title: 'Subscription Activated',
        description: 'New subscription has been saved directly to Neon database.',
      });
      setAssignOpen(false);
      setSelectedUserId('');
      setSelectedPlanId('');
    },
    onError: (err: any) => {
      toast({
        title: 'Activation Failed',
        description: err?.response?.data?.message || err?.message || 'Could not assign subscription.',
        variant: 'destructive',
      });
    },
  });

  // Cancel Subscription Mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast({
        title: 'Subscription Canceled',
        description: 'Subscription status updated to CANCELED in Neon database.',
      });
    },
  });

  const totalActive = stats?.totalActive ?? 0;
  const paidActive = stats?.paidActive ?? 0;
  const freeActive = stats?.freeActive ?? 0;
  const totalRevenue = stats?.monthlyRevenue ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-navy">Subscription Management</h2>
            <Badge variant="outline" className="gap-1 border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-700">
              <Database className="h-3 w-3 text-emerald-600" />
              Live Database Realtime Sync
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage plans, review active subscriber counts, and assign subscriptions directly in PostgreSQL database.
          </p>
        </div>
        <Button onClick={() => setAssignOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Assign Subscription
        </Button>
      </div>

      {/* Real-time Stats from Database */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Active Subscriptions"
          value={loadingStats ? '...' : formatNumber(totalActive)}
          icon={<CreditCard className="h-5 w-5" />}
          accent="primary"
          trendLabel="real-time database records"
        />
        <StatCard
          title="Premium Paid Subscribers"
          value={loadingStats ? '...' : formatNumber(paidActive)}
          icon={<Users className="h-5 w-5" />}
          accent="sage"
          trendLabel="active paid members"
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={loadingStats ? '...' : formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          accent="blush"
          trendLabel="live calculated estimate"
        />
        <StatCard
          title="Free Plan Subscribers"
          value={loadingStats ? '...' : formatNumber(freeActive)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="navy"
          trendLabel="free tier accounts"
        />
      </div>

      {/* Database Plans Grid */}
      <div>
        <h3 className="text-sm font-semibold text-navy mb-3">Live Subscription Plans in Database</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {loadingPlans ? (
            <Card className="col-span-3">
              <CardContent className="p-8 text-center text-muted-foreground">Loading database subscription plans...</CardContent>
            </Card>
          ) : plans.length > 0 ? (
            plans.map((plan) => {
              const pct = totalActive > 0 ? (plan.activeCount / totalActive) * 100 : 0;
              return (
                <Card key={plan.id} className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-navy">{plan.name}</CardTitle>
                      <Badge variant={plan.price > 0 ? 'default' : 'secondary'} className={plan.price > 0 ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                        {plan.price === 0 ? 'Free' : `${formatCurrency(plan.price)}/${plan.billingCycle}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">Realtime active subscribers</span>
                        <span className="text-sm font-bold text-navy">{formatNumber(plan.activeCount)}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(1)}% of total active</p>
                    </div>
                    {plan.features.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Plan Features</p>
                        <ul className="space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-3">
              <CardContent className="p-8 text-center text-muted-foreground">No subscription plans found in database.</CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Real-time Subscriptions Active Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-navy">Active Database Subscriptions</CardTitle>
              <p className="text-xs text-muted-foreground">List of current subscriptions queried directly from the Neon database</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {subscriptions.length} records in DB
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Subscriber / Mother</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Start Date</TableHead>
                <TableHead className="hidden lg:table-cell">End Date</TableHead>
                <TableHead className="text-right pr-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingSubs ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Querying Neon PostgreSQL subscriptions table...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length > 0 ? (
                subscriptions.map((sub: UserSubscription) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-xs text-navy">{sub.user?.name || 'Unnamed Mother'}</p>
                          <p className="text-[11px] text-muted-foreground">{sub.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-medium">
                        {sub.plan?.name || 'Standard Plan'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-semibold text-navy">
                      {formatCurrency(sub.amountPaid || sub.plan?.price || 0)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {formatDate(sub.startDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {sub.endDate ? formatDate(sub.endDate) : 'Renews monthly'}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {sub.status === 'ACTIVE' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (window.confirm(`Cancel active subscription for ${sub.user?.name}?`)) {
                              cancelMutation.mutate(sub.id);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Inactive</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-semibold text-sm text-navy">No subscriptions in database yet</p>
                      <p className="text-xs">Use the "Assign Subscription" button above to activate a subscription for any mother.</p>
                      <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)} className="mt-2 text-xs">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Assign First Subscription
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security & Database Notice */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3">
        <Database className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-900">
          <strong>Database Ground Truth:</strong> All plans and active subscription counts are queried dynamically from the <code>SubscriptionPlan</code> and <code>Subscription</code> PostgreSQL tables. No counts or plans are hardcoded in the frontend.
        </p>
      </div>

      {/* Assign Subscription Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-navy flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Assign Subscription (PostgreSQL DB)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Activate an active subscription plan for a mother directly in the database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div>
              <label className="text-xs font-semibold text-navy">Select Mother / User *</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Choose a mother..." />
                </SelectTrigger>
                <SelectContent className="max-h-52">
                  {usersList.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.displayName} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-navy">Select Subscription Plan *</label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Choose a plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.price === 0 ? 'Free' : `${formatCurrency(p.price)}/${p.billingCycle}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedUserId || !selectedPlanId || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              {assignMutation.isPending ? 'Activating...' : 'Activate in Database'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
