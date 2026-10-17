import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/tables/DataTableCard';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LifeBuoy, AlertCircle, Clock, CheckCircle2, ArrowRight, Inbox } from 'lucide-react';
import { ticketApi } from '@/services/ticket.api';
import type { SupportTicket } from '@/types';
import { formatDateTime } from '@/utils/format';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';

export function SupportOverview() {
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ticketApi.fetchTickets(1, 10);
        if (mounted && res?.data) {
          setTickets(res.data);
        }
      } catch (e) {
        console.warn('Failed to load live tickets in overview:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const open = tickets.filter((t) => t.status === 'open').length;
  const unassigned = tickets.filter((t) => t.status === 'unassigned' || !t.assignedAgent).length;
  const awaiting = tickets.filter((t) => t.status === 'awaiting_response').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Support Overview</h2>
          <p className="text-sm text-muted-foreground">Monitor real-time support ticket activity and operations</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/support-team')}>
          Go to Support Team Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open Tickets" value={open} icon={<LifeBuoy className="h-5 w-5" />} accent="primary" />
        <StatCard title="Unassigned" value={unassigned} icon={<Inbox className="h-5 w-5" />} accent="blush" />
        <StatCard title="Awaiting Response" value={awaiting} icon={<Clock className="h-5 w-5" />} accent="navy" />
        <StatCard title="Resolved" value={resolved} icon={<CheckCircle2 className="h-5 w-5" />} accent="sage" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy">Recent Support Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">User</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Agent</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                    Loading live tickets...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                    No active support tickets found. All maternal inquiries resolved!
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="pl-4 font-mono text-xs text-muted-foreground">{ticket.id}</TableCell>
                    <TableCell className="font-medium text-navy max-w-xs truncate">{ticket.subject}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{ticket.user}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`text-xs font-medium capitalize ${
                        ticket.priority === 'high' ? 'text-destructive' :
                        ticket.priority === 'medium' ? 'text-amber-600' : 'text-muted-foreground'
                      }`}>{ticket.priority}</span>
                    </TableCell>
                    <TableCell><StatusBadge status={ticket.status} /></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{ticket.assignedAgent || 'Unassigned'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDateTime(ticket.updatedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy">Support Team Realtime Operations</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAdmin
                  ? 'As an administrator, you have real-time visibility into all maternal care inquiries, ticket assignments, and agent SLAs.'
                  : 'As a support agent, you can access the Support Team Dashboard to manage assigned tickets and respond to user inquiries.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
