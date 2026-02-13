import { Link, useRouterState } from '@tanstack/react-router';
import { Grid3x3, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  const navItems = [
    { icon: Grid3x3, label: 'Catalog', path: '/catalog' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
    { icon: User, label: 'Account', path: '/account' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path === '/account' && pathname.startsWith('/account'));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive ? 'text-gold' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
