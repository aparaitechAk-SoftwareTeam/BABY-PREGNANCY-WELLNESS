import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  ChartCard,
  UserRegistrationChart,
  AppUsageChart,
  SubscriptionTrendChart,
  ContentStatusChart,
} from '@/components/charts/DashboardCharts';
import {
  Users,
  UserCheck,
  CreditCard,
  BookOpen,
  LifeBuoy,
  Activity,
  FileText,
  Bell,
  Settings as SettingsIcon,
  Database,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { usersApi, DashboardAnalyticsData } from '@/services/users.api';
import { formatNumber, timeAgo, formatDateTime } from '@/utils/format';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const activityIcons = {
  account: Users,
  content: FileText,
  notification: Bell,
  admin: SettingsIcon,
};

export function DashboardOverview() {
  const [analytics, setAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await usersApi.fetchDashboardAnalytics();
      if (data) {
        setAnalytics(data);
      }
    } catch (e) {
      console.warn('Could not load live dashboard analytics:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = analytics?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    activeSubscriptions: 0,
    publishedContent: 0,
    openTickets: 0,
    recentActivity: 0,
    userGrowth: 0,
    subscriptionGrowth: 0,
    contentGrowth: 0,
    ticketChange: 0,
  };

  const charts = analytics?.charts || {
    userRegistrationTrend: [],
    appUsageTrend: [],
    subscriptionTrend: [],
    contentStatusData: [],
  };

  const recentContent = analytics?.recentContent || [];
  const recentActivity = analytics?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Executive Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live clinical telemetry, verified account registrations, and support desk volume directly from Neon PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            Live Neon DB Connected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing || isLoading}
            className="gap-1.5 text-xs text-navy"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Sync
          </Button>
        </div>
      </div>

      {/* Real-time Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Registered Users"
          value={isLoading ? '...' : formatNumber(metrics.totalUsers)}
          icon={<Users className="h-5 w-5" />}
          trend={metrics.userGrowth}
          trendLabel="live database accounts"
          accent="primary"
        />
        <StatCard
          title="Active & Verified Users"
          value={isLoading ? '...' : formatNumber(metrics.activeUsers)}
          icon={<UserCheck className="h-5 w-5" />}
          trend={metrics.userGrowth}
          trendLabel="email verified mothers"
          accent="sage"
        />
        <StatCard
          title="Active Subscriptions"
          value={isLoading ? '...' : formatNumber(metrics.activeSubscriptions)}
          icon={<CreditCard className="h-5 w-5" />}
          trend={metrics.subscriptionGrowth}
          trendLabel="maternal care plans"
          accent="blush"
        />
        <StatCard
          title="Published Content"
          value={isLoading ? '...' : formatNumber(metrics.publishedContent)}
          icon={<BookOpen className="h-5 w-5" />}
          trend={metrics.contentGrowth}
          trendLabel="clinical weekly guides"
          accent="navy"
        />
        <StatCard
          title="Open Support Tickets"
          value={isLoading ? '...' : formatNumber(metrics.openTickets)}
          icon={<LifeBuoy className="h-5 w-5" />}
          trend={metrics.ticketChange}
          trendLabel="live ticket desk"
          accent="primary"
        />
        <StatCard
          title="Real-time System Actions"
          value={isLoading ? '...' : formatNumber(metrics.recentActivity)}
          icon={<Activity className="h-5 w-5" />}
          trendLabel="audit log events"
          accent="sage"
        />
      </div>

      {/* Real-time Database Graphs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="User Registration Growth (Live Neon DB)" className="lg:col-span-1">
          {charts.userRegistrationTrend.length > 0 ? (
            <UserRegistrationChart data={charts.userRegistrationTrend} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              {isLoading ? 'Loading live metrics...' : 'No registration data recorded yet'}
            </div>
          )}
        </ChartCard>

        <ChartCard title="User Breakdown by Role (Mothers, Caregivers, Staff)" className="lg:col-span-1">
          {charts.appUsageTrend.length > 0 ? (
            <AppUsageChart data={charts.appUsageTrend} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              {isLoading ? 'Loading live metrics...' : 'No role distribution data recorded yet'}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Subscription Plan Distribution (Free vs Premium)" className="lg:col-span-1">
          {charts.subscriptionTrend.length > 0 ? (
            <SubscriptionTrendChart data={charts.subscriptionTrend} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              {isLoading ? 'Loading live metrics...' : 'No subscription data recorded yet'}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Pregnancy Educational Content Publication Status" className="lg:col-span-1">
          {charts.contentStatusData.length > 0 ? (
            <ContentStatusChart data={charts.contentStatusData} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              {isLoading ? 'Loading live metrics...' : 'No content items in database'}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Real-time Content & Operations Activity Feed */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Real Live Database Activities */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-navy">Live Operations & Account Feed</CardTitle>
              <Badge variant="secondary" className="text-[10px]">Real-Time</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">No recent system activity recorded in Neon DB</div>
            ) : (
              recentActivity.slice(0, 5).map((item) => {
                const Icon = activityIcons[item.type] || Activity;
                return (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.actor} • {timeAgo(item.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Real Weekly Pregnancy Content from Database */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-navy">Published Clinical Pregnancy Content</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{metrics.publishedContent} Total Articles</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentContent.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">No content articles found in database</div>
            ) : (
              recentContent.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/15">
                    <FileText className="h-4 w-4 text-sage" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Week {item.week > 0 ? item.week : 'General'} • by {item.author}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(item.publishedAt)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
