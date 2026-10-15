import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RoleGuard({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const { role, canAccessRoute } = useRole();
  const location = useLocation();

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-navy">Access Restricted</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            You do not have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
