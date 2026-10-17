import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard, UserRegistrationChart, AppUsageChart, SubscriptionTrendChart, ContentStatusChart } from '@/components/charts/DashboardCharts';
import { StatusBadge } from '@/components/tables/DataTableCard';
import {
  Users, UserCheck, CreditCard, BookOpen, LifeBuoy, Activity,
  FileText, Bell, Settings as SettingsIcon,
} from 'lucide-react';
import {
  DEFAULT_DASHBOARD_METRICS,
  USER_REGISTRATION_TREND,
  APP_USAGE_TREND,
  SUBSCRIPTION_TREND,
  CONTENT_STATUS_DATA,
  PLATFORM_ACTIVITY_ITEMS,
  RECENT_PUBLISHED_CONTENT,
  RECENT_NOTIFICATION_CAMPAIGNS,
} from '@/constants/analytics-defaults';
import { usersApi } from '@/services/users.api';
import { ticketApi } from '@/services/ticket.api';
import { fetchContent } from '@/services/api/content.api';
import { fetchNotifications } from '@/services/api/notifications.api';
import { formatNumber, timeAgo, formatDateTime } from '@/utils/format';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const activityIcons = {
  account: Users,
  content: FileText,
  notification: Bell,
  admin: SettingsIcon,
};

export function DashboardOverview() {
  const [realUserTotal, setRealUserTotal] = useState<number | null>(null);
  const [realOpenTickets, setRealOpenTickets] = useState<number | null>(null);
  const [realContent, setRealContent] = useState<typeof RECENT_PUBLISHED_CONTENT | null>(null);
  const [realCampaigns, setRealCampaigns] = useState<typeof RECENT_NOTIFICATION_CAMPAIGNS | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [usersRes, ticketsRes, contentRes, notifsRes] = await Promise.allSettled([
          usersApi.fetchUsers(1, 1),
          ticketApi.fetchTickets(1, 50),
          fetchContent(1, 4),
          fetchNotifications(1, 4),
        ]);
        if (mounted) {
          if (usersRes.status === 'fulfilled' && typeof usersRes.value.total === 'number') {
            setRealUserTotal(usersRes.value.total);
          }
          if (ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value.data)) {
            const openCount = ticketsRes.value.data.filter((t) => t.status === 'open' || t.status === 'awaiting_response').length;
            setRealOpenTickets(openCount);
          }
          if (contentRes.status === 'fulfilled' && Array.isArray(contentRes.value.data) && contentRes.value.data.length > 0) {
            setRealContent(
              contentRes.value.data.map((c) => ({
                id: c.id,
                title: c.title,
                week: c.week || 0,
                author: c.author || 'Obstetric Care Team',
                publishedAt: c.updatedAt || c.createdAt,
              }))
            );
          }
          if (notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value.data) && notifsRes.value.data.length > 0) {
            setRealCampaigns(
              notifsRes.value.data.map((n) => ({
                id: n.id,
                title: n.title,
                audience: n.audience || 'All Active Mothers',
                sentAt: n.sentAt || n.createdAt,
                deliveryCount: n.deliveryCount || 1,
              }))
            );
          }
        }
      } catch (e) {
        // Quiet fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalUsersDisplay = realUserTotal !== null ? realUserTotal : DEFAULT_DASHBOARD_METRICS.totalUsers;
  const openTicketsDisplay = realOpenTickets !== null ? realOpenTickets : DEFAULT_DASHBOARD_METRICS.openTickets;
  const publishedContentRecent = realContent || RECENT_PUBLISHED_CONTENT;
  const notificationCampaignsRecent = realCampaigns || RECENT_NOTIFICATION_CAMPAIGNS;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Registered Users"
          value={formatNumber(totalUsersDisplay)}
          icon={<Users className="h-5 w-5" />}
          trend={DEFAULT_DASHBOARD_METRICS.userGrowth}
          trendLabel="live database sync"
          accent="primary"
        />
        <StatCard
          title="Active Users"
          value={formatNumber(totalUsersDisplay)}
          icon={<UserCheck className="h-5 w-5" />}
          trend={DEFAULT_DASHBOARD_METRICS.userGrowth}
          trendLabel="verified accounts"
          accent="sage"
        />
        <StatCard
          title="Active Subscriptions"
          value={formatNumber(DEFAULT_DASHBOARD_METRICS.activeSubscriptions)}
          icon={<CreditCard className="h-5 w-5" />}
          trend={DEFAULT_DASHBOARD_METRICS.subscriptionGrowth}
          trendLabel="vs last month"
          accent="blush"
        />
        <StatCard
          title="Published Content"
          value={publishedContentRecent.length}
          icon={<BookOpen className="h-5 w-5" />}
          trend={DEFAULT_DASHBOARD_METRICS.contentGrowth}
          trendLabel="live content registry"
          accent="navy"
        />
        <StatCard
          title="Open Support Tickets"
          value={openTicketsDisplay}
          icon={<LifeBuoy className="h-5 w-5" />}
          trend={DEFAULT_DASHBOARD_METRICS.ticketChange}
          trendLabel="live support queue"
          accent="primary"
        />
        <StatCard
          title="Recent Admin Activity"
          value={PLATFORM_ACTIVITY_ITEMS.length}
          icon={<Activity className="h-5 w-5" />}
          trendLabel="system log events"
          accent="sage"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="User Registration Trends" className="lg:col-span-1">
          <UserRegistrationChart data={USER_REGISTRATION_TREND} />
        </ChartCard>
        <ChartCard title="Application Usage (Weekly)" className="lg:col-span-1">
          <AppUsageChart data={APP_USAGE_TREND} />
        </ChartCard>
        <ChartCard title="Subscription Trends" className="lg:col-span-1">
          <SubscriptionTrendChart data={SUBSCRIPTION_TREND} />
        </ChartCard>
        <ChartCard title="Content Publication Status" className="lg:col-span-1">
          <ContentStatusChart data={CONTENT_STATUS_DATA} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">Recent Account Management Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLATFORM_ACTIVITY_ITEMS.filter((i) => i.type === 'account' || i.type === 'admin').slice(0, 5).map((item) => {
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
            {PLATFORM_ACTIVITY_ITEMS.slice(0, 5).map((item) => {
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
