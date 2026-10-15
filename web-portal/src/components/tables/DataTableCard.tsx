import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataTableProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DataTableCard({ title, action, children, className }: DataTableProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-navy">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-sage/15 text-sage border-sage/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  published: 'bg-sage/15 text-sage border-sage/20',
  draft: 'bg-muted text-muted-foreground border-border',
  review: 'bg-blue-50 text-blue-600 border-blue-200',
  free: 'bg-muted text-muted-foreground border-border',
  premium: 'bg-primary/10 text-primary border-primary/20',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
  open: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-sage/15 text-sage border-sage/20',
  unassigned: 'bg-amber-100 text-amber-700 border-amber-200',
  awaiting_response: 'bg-blue-50 text-blue-600 border-blue-200',
  success: 'bg-sage/15 text-sage border-sage/20',
  failure: 'bg-destructive/10 text-destructive border-destructive/20',
  sent: 'bg-sage/15 text-sage border-sage/20',
  approved: 'bg-blue-50 text-blue-600 border-blue-200',
  pending_approval: 'bg-amber-100 text-amber-700 border-amber-200',
  unpublished: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const colorClass = statusColors[status] || 'bg-muted text-muted-foreground border-border';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        colorClass,
      )}
    >
      {label}
    </span>
  );
}
