import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { PriorityBadge } from '@/components/support/TicketBadges';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { ticketApi } from '@/services/ticket.api';
import type { SupportTicket } from '@/types';
import { timeAgo } from '@/utils/format';

export function Escalations() {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ticketApi.fetchTickets(1, 50);
        if (mounted && res?.data) {
          const escalatedList = res.data.filter(
            (t) => t.status === 'escalated' || t.escalated || t.priority === 'urgent',
          );
          setEscalations(escalatedList);
        }
      } catch (e) {
        console.warn('Failed to load escalations:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pending = escalations.filter((e) => e.status !== 'resolved');
  const reviewing = escalations.filter((e) => e.status === 'awaiting_response');
  const resolved = escalations.filter((e) => e.status === 'resolved');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Escalations Queue</h2>
        <p className="text-sm text-muted-foreground">
          Realtime maternal support tickets escalated for clinical or engineering intervention
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Active Urgent / Escalated" value={pending.length} icon={<AlertTriangle className="h-5 w-5" />} accent="primary" />
        <StatCard title="Under Clinical Review" value={reviewing.length} icon={<Clock className="h-5 w-5" />} accent="navy" />
        <StatCard title="Resolved" value={resolved.length} icon={<CheckCircle2 className="h-5 w-5" />} accent="sage" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy">All Live Escalations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Ticket</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Patient / Mother</TableHead>
                <TableHead className="hidden lg:table-cell">Last Update</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                    Querying live escalation database...
                  </TableCell>
                </TableRow>
              ) : escalations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                    No active escalations. All maternal triage tickets within normal limits!
                  </TableCell>
                </TableRow>
              ) : (
                escalations.map((esc) => (
                  <TableRow key={esc.id}>
                    <TableCell className="pl-4 max-w-xs">
                      <p className="font-mono text-xs text-muted-foreground">{esc.id}</p>
                      <p className="font-medium text-navy truncate">{esc.subject}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground capitalize">
                      {esc.category}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {esc.user}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {timeAgo(esc.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={esc.priority} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {esc.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/support-team/tickets/${esc.id}`)}
                      >
                        Review
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
