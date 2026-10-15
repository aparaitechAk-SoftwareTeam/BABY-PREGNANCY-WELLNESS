import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  accent?: 'primary' | 'sage' | 'navy' | 'blush';
}

const accentStyles = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage',
  navy: 'bg-navy/10 text-navy',
  blush: 'bg-blush/20 text-blush-dark',
};

export function StatCard({ title, value, icon, trend, trendLabel, accent = 'primary' }: StatCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-navy">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={cn(
                    'flex items-center font-medium',
                    trend >= 0 ? 'text-sage' : 'text-destructive',
                  )}
                >
                  {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </span>
                {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', accentStyles[accent])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
