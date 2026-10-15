import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/services/subscriptions.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, TrendingUp, DollarSign } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/format';

export function SubscriptionOverview() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.fetchSubscriptionPlans(),
  });

  const totalActive = plans ? plans.filter((p) => p.name !== 'Expired Subscriptions').reduce((sum, p) => sum + p.activeCount, 0) : 0;
  const totalRevenue = plans ? plans.filter((p) => p.price > 0).reduce((sum, p) => sum + p.activeCount * p.price, 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Subscription Management</h2>
        <p className="text-sm text-muted-foreground">Overview of subscription plans, active counts, and statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Active Subscriptions" value={formatNumber(totalActive)} icon={<CreditCard className="h-5 w-5" />} accent="primary" />
        <StatCard title="Premium Subscribers" value={formatNumber(plans?.find((p) => p.name === 'Premium Monthly')?.activeCount || 0 + (plans?.find((p) => p.name === 'Premium Yearly')?.activeCount || 0))} icon={<Users className="h-5 w-5" />} accent="sage" />
        <StatCard title="Monthly Revenue (est.)" value={formatCurrency(totalRevenue)} icon={<DollarSign className="h-5 w-5" />} accent="blush" />
        <StatCard title="Free Plan Users" value={formatNumber(plans?.find((p) => p.name === 'Free')?.activeCount || 0)} icon={<TrendingUp className="h-5 w-5" />} accent="navy" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Loading subscription plans...</CardContent></Card>
        ) : (
          plans?.filter((p) => p.name !== 'Expired Subscriptions').map((plan) => {
            const pct = totalActive > 0 ? (plan.activeCount / totalActive) * 100 : 0;
            return (
              <Card key={plan.id}>
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
                      <span className="text-sm text-muted-foreground">Active subscribers</span>
                      <span className="text-sm font-semibold text-navy">{formatNumber(plan.activeCount)}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(1)}% of total active</p>
                  </div>
                  {plan.features.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Plan Features</p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy">Subscription Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
              <p className="text-xl font-bold text-navy mt-1">42.3%</p>
              <p className="text-xs text-sage mt-0.5">+3.2% vs last month</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Churn Rate</p>
              <p className="text-xl font-bold text-navy mt-1">2.1%</p>
              <p className="text-xs text-destructive mt-0.5">+0.3% vs last month</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Avg. Revenue/User</p>
              <p className="text-xl font-bold text-navy mt-1">{formatCurrency(totalRevenue / (totalActive || 1))}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Expired Subscriptions</p>
              <p className="text-xl font-bold text-navy mt-1">{formatNumber(plans?.find((p) => p.name === 'Expired Subscriptions')?.activeCount || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
        <p className="text-xs text-amber-800">
          <strong>Security Notice:</strong> Raw payment-card details are never stored or displayed. Purchase references are shown only where permitted by user consent and data policies.
        </p>
      </div>
    </div>
  );
}
