import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RequireAuth from '../../components/auth/RequireAuth';

export default function SupportTicketDetailPage() {
  const { ticketId } = useParams({ from: '/support/tickets/$ticketId' });
  const navigate = useNavigate();

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate({ to: '/support/tickets' })} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Ticket #{ticketId}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Ticket details will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
