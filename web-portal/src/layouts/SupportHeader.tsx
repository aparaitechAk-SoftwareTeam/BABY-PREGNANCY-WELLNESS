import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, User, Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SUPPORT_NAV_ITEMS } from '@/constants';
import { timeAgo } from '@/utils/format';
import { Fragment } from 'react';

interface SupportHeaderProps {
  onMobileMenuOpen: () => void;
}

export function SupportHeader({ onMobileMenuOpen }: SupportHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const notifications: any[] = [];

  const currentItem = SUPPORT_NAV_ITEMS.find(
    (item) => location.pathname === item.path || (item.path !== '/support-team' && location.pathname.startsWith(item.path)),
  );
  const pageTitle = currentItem?.label || 'Support Overview';

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const crumbs: { label: string; path: string }[] = [{ label: 'Support', path: '/support-team' }];
  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const navItem = SUPPORT_NAV_ITEMS.find((item) => item.path === currentPath);
    if (navItem && !crumbs.find((c) => c.path === navItem.path)) {
      crumbs.push({ label: navItem.label, path: navItem.path });
    } else if (!crumbs.find((c) => c.path === currentPath)) {
      crumbs.push({ label: segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), path: currentPath });
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-col gap-0.5">
        <h1 className="text-lg font-semibold text-navy">{pageTitle}</h1>
        <nav className="flex items-center text-sm">
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.path}>
              {index > 0 && <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-muted-foreground/50" />}
              {index === crumbs.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-muted-foreground hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </Fragment>
          ))}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-2 lg:gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets, users..."
            className="w-48 pl-9 lg:w-64"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Support Notifications ({unreadCount} unread)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 5).map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-2">
                <div className="flex w-full items-center gap-2">
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  <span className="text-sm font-medium">{n.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.message}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(n.timestamp)}</span>
              </DropdownMenuItem>
            ))}
            {notifications.length === 0 && (
              <div className="py-4 text-center text-xs text-muted-foreground">No new notifications</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-sm text-primary"
              onClick={() => navigate('/support-team/notifications')}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sage/15 text-sage text-xs font-semibold">
                  {user?.displayName?.split(' ').map((n) => n[0]).join('') || 'SA'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start lg:flex">
                <span className="text-sm font-medium text-navy">{user?.displayName}</span>
                <span className="text-[10px] text-muted-foreground">Support Agent</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/support-team/profile')}>
              <User className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of the support console? You will need to sign in again to access your tickets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
