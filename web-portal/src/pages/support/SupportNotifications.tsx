import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { mockSupportNotifications } from '@/mocks/support.mock';
import type { SupportNotification } from '@/types';
import { Ticket as TicketIcon, AlertTriangle, Bell, Info, CheckCheck } from 'lucide-react';
import { timeAgo, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';

let notificationStore = [...mockSupportNotifications];

export function SupportNotifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = filter === 'unread' ? notificationStore.filter((n) => !n.read) : notificationStore;

  const markAsRead = (id: string) => {
    const idx = notificationStore.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notificationStore[idx] = { ...notificationStore[idx], read: true };
      queryClient.invalidateQueries({ queryKey: ['supportNotifications'] });
    }
  };

  const markAllAsRead = () => {
    notificationStore = notificationStore.map((n) => ({ ...n, read: true }));
    queryClient.invalidateQueries({ queryKey: ['supportNotifications'] });
    toast({ title: 'All notifications marked as read' });
  };

  const getIcon = (type: SupportNotification['type']) => {
    switch (type) {
      case 'ticket_assigned':
      case 'ticket_updated':
        return <TicketIcon className="h-4 w-4 text-primary" />;
      case 'escalation':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'system':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const unreadCount = notificationStore.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Notifications</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>Unread ({unreadCount})</Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {notifications.length > 0 ? notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-4 p-4 transition-colors hover:bg-muted/30',
                  !n.read && 'bg-primary/5',
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  n.type === 'escalation' ? 'bg-destructive/10' : n.type === 'system' ? 'bg-blue-50' : 'bg-primary/10',
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <p className="text-sm font-semibold text-navy">{n.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.timestamp)} - {timeAgo(n.timestamp)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {n.ticketId && (
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/support-team/tickets/${n.ticketId}`)}>
                      View Ticket
                    </Button>
                  )}
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(n.id)} title="Mark as read">
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Bell className="h-8 w-8" />
                  <p>No notifications to display.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
