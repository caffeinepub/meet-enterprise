import AdminGuard from '../../components/admin/AdminGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageCircle } from 'lucide-react';

export default function AdminSupportTicketsPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Support Tickets</h1>

        <Alert>
          <MessageCircle className="h-4 w-4" />
          <AlertTitle>Support System</AlertTitle>
          <AlertDescription>
            The support ticket system is currently implemented as a demo using local storage. In a production
            environment, this would be integrated with the backend canister to store and manage support tickets
            on-chain with proper access control and notification systems.
          </AlertDescription>
        </Alert>
      </div>
    </AdminGuard>
  );
}
