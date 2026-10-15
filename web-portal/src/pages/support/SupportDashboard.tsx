import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { TicketStatusBadge, PriorityBadge } from '@/components/support/TicketBadges';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Inbox, Clock, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { mockSupportTickets, mockEscalations } from '@/mocks/support.mock';
import { useAuth } from '@/hooks/useAuth';
import { timeAgo, formatDateTime, formatNumber } from '@/utils/format';

export function SupportDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const myTickets = mockSupportTickets.filter((t) => t.assignedAgentId === user?.id);
  const openTickets = mockSupportTickets.filter((t) => t.status === 'open');
  const unassigned = mockSupportTickets.filter((t) => t.status === 'unassigned');
  const awaiting = mockSupportTickets.filter((t) => t.status === 'awaiting_response');
  const resolved = mockSupportTickets.filter((t) => t.status === 'resolved');
  const escalated = mockSupportTickets.filter((t) => t.status === 'escalated');
  const pendingEscalations = mockEscalations.filter((e) => e.status === 'pending');

  const recentTickets = [...mockSupportTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Support Overview</h2>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.displayName}. Here is your support workload.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="My Open Tickets" value={myTickets.filter((t) => t.status === 'open' || t.status === 'awaiting_response').length} icon={<Inbox className="h-5 w-5" />} accent="primary" />
        <StatCard title="Unassigned" value={unassigned.length} icon={<AlertTriangle className="h-5 w-5" />} accent="blush" />
        <StatCard title="Awaiting Response" value={awaiting.length} icon={<Clock className="h-5 w-5" />} accent="navy" />
        <StatCard title="Resolved" value={resolved.length} icon={<CheckCircle2 className="h-5 w-5" />} accent="sage" />
        <StatCard title="Escalations" value={pendingEscalations.length} icon={<TrendingUp className="h-5 w-5" />} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-navy">Recent Ticket Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/support-team/tickets')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Ticket</TableHead>
                  <TableHead className="hidden sm:table-cell">User</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer" onClick={() => navigate(`/support-team/tickets/${ticket.id}`)}>
                    <TableCell className="pl-4 max-w-xs">
                      <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
                      <p className="font-medium text-navy truncate">{ticket.subject}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{ticket.user}</TableCell>
                    <TableCell className="hidden md:table-cell"><PriorityBadge priority={ticket.priority} /></TableCell>
                    <TableCell><TicketStatusBadge status={ticket.status} /></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{timeAgo(ticket.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">Active Escalations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockEscalations.filter((e) => e.status !== 'resolved').map((esc) => (
              <div
                key={esc.id}
                className="cursor-pointer rounded-lg border border-destructive/20 bg-destructive/5 p-3 transition-all hover:bg-destructive/10"
                onClick={() => navigate(`/support-team/tickets/${esc.ticketId}`)}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy truncate">{esc.ticketSubject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{esc.reason}</p>
                    <div className="flex items-center justify-between mt-2">
                      <PriorityBadge priority={esc.priority} />
                      <span className="text-xs text-muted-foreground">{timeAgo(esc.escalatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {mockEscalations.filter((e) => e.status !== 'resolved').length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No active escalations</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">My Assigned Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myTickets.filter((t) => t.status !== 'resolved').slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                className="cursor-pointer rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                onClick={() => navigate(`/support-team/tickets/${ticket.id}`)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-navy truncate flex-1">{ticket.subject}</p>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{ticket.user}</p>
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
            ))}
            {myTickets.filter((t) => t.status !== 'resolved').length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No active tickets assigned to you</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy">Recently Resolved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolved.map((ticket) => (
              <div
                key={ticket.id}
                className="cursor-pointer rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                onClick={() => navigate(`/support-team/tickets/${ticket.id}`)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-navy truncate flex-1">{ticket.subject}</p>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{ticket.user}</p>
                  <span className="text-xs text-muted-foreground">{timeAgo(ticket.updatedAt)}</span>
                </div>
              </div>
            ))}
            {resolved.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No recently resolved tickets</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
