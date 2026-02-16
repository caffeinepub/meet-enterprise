import AdminGuard from '../../components/admin/AdminGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users } from 'lucide-react';

export default function AdminCustomersPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Customers</h1>

        <Alert>
          <Users className="h-4 w-4" />
          <AlertTitle>Customer Management</AlertTitle>
          <AlertDescription>
            Customer profiles are stored securely on-chain. Each user's identity is managed through
            blockchain-based authentication. User profile information (name, email, phone, address)
            is encrypted and stored on the Internet Computer.
          </AlertDescription>
        </Alert>
      </div>
    </AdminGuard>
  );
}
