import { cn } from '@/lib/utils';
import type { TicketStatus, TicketPriority } from '@/types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

const statusColors: Record<string, string> = {
  open: 'bg-primary/10 text-primary border-primary/20',
  awaiting_response: 'bg-blue-50 text-blue-600 border-blue-200',
  resolved: 'bg-sage/15 text-sage border-sage/20',
  unassigned: 'bg-amber-100 text-amber-700 border-amber-200',
  escalated: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize', statusColors[status] || 'bg-muted text-muted-foreground border-border')}>
      {label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
}

const priorityColors: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-amber-600',
  high: 'text-orange-600',
  urgent: 'text-destructive',
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium capitalize', priorityColors[priority] || 'text-muted-foreground')}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        priority === 'low' && 'bg-muted-foreground',
        priority === 'medium' && 'bg-amber-500',
        priority === 'high' && 'bg-orange-500',
        priority === 'urgent' && 'bg-destructive',
      )} />
      {priority}
    </span>
  );
}
