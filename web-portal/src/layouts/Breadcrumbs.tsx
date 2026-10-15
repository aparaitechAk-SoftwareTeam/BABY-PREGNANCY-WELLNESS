import { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from '@/constants';

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const crumbs: { label: string; path: string }[] = [{ label: 'Home', path: '/dashboard' }];

  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const navItem = NAV_ITEMS.find((item) => item.path === currentPath);
    if (navItem) {
      crumbs.push({ label: navItem.label, path: navItem.path });
    } else {
      const label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({ label, path: currentPath });
    }
  }

  return (
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
  );
}
