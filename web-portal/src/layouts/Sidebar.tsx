import { NavLink, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { visibleNavItems } = useRole();
  const location = useLocation();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col bg-navy text-white transition-all duration-300 lg:relative lg:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className={cn('flex h-16 items-center gap-3 border-b border-white/10 px-4', collapsed && 'justify-center px-0')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/90 shadow-lg">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">AparaiTech</span>
              <span className="text-[10px] text-white/60">Admin Console</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {visibleNavItems.map((item) => {
            const isExact = location.pathname === item.path;
            const isSubPath =
              item.path !== '/dashboard' &&
              item.path !== '/' &&
              location.pathname.startsWith(item.path + '/') &&
              !visibleNavItems.some(
                (other) =>
                  other.path !== item.path &&
                  other.path.startsWith(item.path + '/') &&
                  (location.pathname === other.path || location.pathname.startsWith(other.path + '/'))
              );
            const isActive = isExact || isSubPath;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-white')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className={cn('border-t border-white/10 p-3', collapsed && 'flex justify-center')}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'text-white/60 hover:bg-white/10 hover:text-white',
              collapsed ? 'h-9 w-9 p-0' : 'w-full justify-start gap-3',
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
