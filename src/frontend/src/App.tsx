import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import FaqPage from './pages/support/FaqPage';
import SupportTicketsPage from './pages/support/SupportTicketsPage';
import SupportTicketDetailPage from './pages/support/SupportTicketDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSupportTicketsPage from './pages/admin/AdminSupportTicketsPage';
import AdminActivatePage from './pages/admin/AdminActivatePage';
import AccountPage from './pages/account/AccountPage';
import AccountLoginPage from './pages/account/AccountLoginPage';
import { useEffect } from 'react';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderDetailPage,
});

const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wishlist',
  component: WishlistPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: AccountPage,
});

const accountLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/login',
  component: AccountLoginPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support/faq',
  component: FaqPage,
});

const supportTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support/tickets',
  component: SupportTicketsPage,
});

const supportTicketDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support/tickets/$ticketId',
  component: SupportTicketDetailPage,
});

const adminActivateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/activate',
  component: AdminActivatePage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/products',
  component: AdminProductsPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: AdminOrdersPage,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/customers',
  component: AdminCustomersPage,
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/analytics',
  component: AdminAnalyticsPage,
});

const adminSupportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/support',
  component: AdminSupportTicketsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  ordersRoute,
  orderDetailRoute,
  wishlistRoute,
  profileRoute,
  accountRoute,
  accountLoginRoute,
  notificationsRoute,
  faqRoute,
  supportTicketsRoute,
  supportTicketDetailRoute,
  adminActivateRoute,
  adminDashboardRoute,
  adminProductsRoute,
  adminOrdersRoute,
  adminCustomersRoute,
  adminAnalyticsRoute,
  adminSupportRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) => console.error('Service Worker registration failed:', err));
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
