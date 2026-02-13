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
            Customer profiles are managed through Internet Identity. Each user's identity is secured by the
            Internet Computer's authentication system. User profile information (name, email, phone, address)
            is stored securely on-chain.
          </AlertDescription>
        </Alert>
      </div>
    </AdminGuard>
  );
}
