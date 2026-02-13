import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';

export default function NotificationsPage() {
  return (
    <RequireAuth message="Please sign in to view notifications">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
            <p className="text-muted-foreground">We'll notify you about orders and offers</p>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
