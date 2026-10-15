import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard, UserRegistrationChart, AppUsageChart, SubscriptionTrendChart, ContentStatusChart } from '@/components/charts/DashboardCharts';
import { StatusBadge } from '@/components/tables/DataTableCard';
import {
  Users, UserCheck, CreditCard, BookOpen, LifeBuoy, Activity,
  FileText, Bell, Settings as SettingsIcon,
} from 'lucide-react';
import {
  dashboardMetrics,
  userRegistrationTrend,
  appUsageTrend,
  subscriptionTrend,
  contentStatusData,
  recentActivityItems,
  publishedContentRecent,
  notificationCampaignsRecent,
} from '@/mocks/dashboard.mock';
import { formatNumber, timeAgo, formatDateTime } from '@/utils/format';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const activityIcons = {
  account: Users,
  content: FileText,
  notification: Bell,
  admin: SettingsIcon,
};

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Registered Users"
          value={formatNumber(dashboardMetrics.totalUsers)}
          icon={<Users className="h-5 w-5" />}
          trend={dashboardMetrics.userGrowth}
          trendLabel="vs last month"
          accent="primary"
        />
        <StatCard
          title="Active Users"
          value={formatNumber(dashboardMetrics.activeUsers)}
          icon={<UserCheck className="h-5 w-5" />}
          trend={dashboardMetrics.userGrowth}
          trendLabel="this week"
          accent="sage"
        />
        <StatCard
          title="Active Subscriptions"
          value={formatNumber(dashboardMetrics.activeSubscriptions)}
          icon={<CreditCard className="h-5 w-5" />}
          trend={dashboardMetrics.subscriptionGrowth}
          trendLabel="vs last month"
          accent="blush"
        />
        <StatCard
          title="Published Content"
          value={dashboardMetrics.publishedContent}
          icon={<BookOpen className="h-5 w-5" />}
          trend={dashboardMetrics.contentGrowth}
          trendLabel="vs last month"
          accent="navy"
        />
        <StatCard
          title="Open Support Tickets"
          value={dashboardMetrics.openTickets}
          icon={<LifeBuoy className="h-5 w-5" />}
          trend={dashboardMetrics.ticketChange}
          trendLabel="vs last week"
          accent="primary"
        />
        <StatCard
          title="Recent Admin Activity"
          value={dashboardMetrics.recentActivity}
          icon={<Activity className="h-5 w-5" />}
          trendLabel="last 24 hours"
          accent="sage"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="User Registration Trends" className="lg:col-span-1">
          <UserRegistrationChart data={userRegistrationTrend} />
        </ChartCard>
        <ChartCard title="Application Usage (Weekly)" className="lg:col-span-1">
          <AppUsageChart data={appUsageTrend} />
        </ChartCard>
        <ChartCard title="Subscription Trends" className="lg:col-span-1">
          <SubscriptionTrendChart data={subscriptionTrend} />
        </ChartCard>
        <ChartCard title="Content Publication Status" className="lg:col-span-1">
          <ContentStatusChart data={contentStatusData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">Recent Account Management Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivityItems.filter((i) => i.type === 'account' || i.type === 'admin').slice(0, 5).map((item) => {
              const Icon = activityIcons[item.type];
              return (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.actor} - {timeAgo(item.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">Recently Published Educational Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {publishedContentRecent.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/15">
                  <FileText className="h-4 w-4 text-sage" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Week {item.week > 0 ? item.week : 'General'} - by {item.author}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(item.publishedAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">Recent Notification Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificationCampaignsRecent.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blush/20">
                  <Bell className="h-4 w-4 text-blush-dark" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.audience} - {formatNumber(item.deliveryCount)} delivered</p>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(item.sentAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">Administrative Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivityItems.slice(0, 5).map((item) => {
              const Icon = activityIcons[item.type];
              return (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-navy/10 text-navy text-xs font-semibold">
                      {item.actor.split(' ').slice(-2).map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.actor} - {formatDateTime(item.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
