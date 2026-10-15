import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { PriorityBadge } from '@/components/support/TicketBadges';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { mockEscalations } from '@/mocks/support.mock';
import { formatDateTime, timeAgo } from '@/utils/format';
import { cn } from '@/lib/utils';

export function Escalations() {
  const navigate = useNavigate();

  const pending = mockEscalations.filter((e) => e.status === 'pending');
  const reviewing = mockEscalations.filter((e) => e.status === 'reviewing');
  const resolved = mockEscalations.filter((e) => e.status === 'resolved');

  const escalationStatusColors: Record<string, string> = {
    pending: 'bg-destructive/10 text-destructive border-destructive/20',
    reviewing: 'bg-blue-50 text-blue-600 border-blue-200',
    resolved: 'bg-sage/15 text-sage border-sage/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Escalations</h2>
        <p className="text-sm text-muted-foreground">Tickets that have been escalated for admin or engineering review</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Pending Review" value={pending.length} icon={<AlertTriangle className="h-5 w-5" />} accent="primary" />
        <StatCard title="Under Review" value={reviewing.length} icon={<Clock className="h-5 w-5" />} accent="navy" />
        <StatCard title="Resolved" value={resolved.length} icon={<CheckCircle2 className="h-5 w-5" />} accent="sage" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy">All Escalations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Ticket</TableHead>
                <TableHead className="hidden md:table-cell">Reason</TableHead>
                <TableHead className="hidden sm:table-cell">Escalated By</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEscalations.map((esc) => (
                <TableRow key={esc.id}>
                  <TableCell className="pl-4 max-w-xs">
                    <p className="font-mono text-xs text-muted-foreground">{esc.ticketId}</p>
                    <p className="font-medium text-navy truncate">{esc.ticketSubject}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">{esc.reason}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{esc.escalatedBy}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDateTime(esc.escalatedAt)}</TableCell>
                  <TableCell><PriorityBadge priority={esc.priority} /></TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize', escalationStatusColors[esc.status])}>
                      {esc.status}
                    </span>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/support-team/tickets/${esc.ticketId}`)}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
