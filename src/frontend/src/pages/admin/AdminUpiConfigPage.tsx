import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminGuard from '../../components/admin/AdminGuard';
import { useGetMerchantConfig, useSaveMerchantConfig } from '../../hooks/useQueries';
import { extractBackendErrorMessage } from '../../utils/extractBackendErrorMessage';

const DEFAULT_MERCHANT_ID = 'default';

export default function AdminUpiConfigPage() {
  const navigate = useNavigate();
  const { data: merchantConfig, isLoading: configLoading } = useGetMerchantConfig(DEFAULT_MERCHANT_ID);
  const saveMutation = useSaveMerchantConfig();

  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantCode, setMerchantCode] = useState('');
  const [qrImagePath, setQrImagePath] = useState('');

  // Load initial values when config is fetched
  useEffect(() => {
    if (merchantConfig) {
      setUpiId(merchantConfig.upiId);
      setMerchantName(merchantConfig.merchantName);
      setMerchantCode(merchantConfig.merchantCode || '');
      setQrImagePath(merchantConfig.qrImagePath);
    }
  }, [merchantConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!upiId.trim()) {
      toast.error('UPI ID is required');
      return;
    }

    if (!merchantName.trim()) {
      toast.error('Merchant name is required');
      return;
    }

    if (!qrImagePath.trim()) {
      toast.error('QR image path is required');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        merchantId: DEFAULT_MERCHANT_ID,
        config: {
          upiId: upiId.trim(),
          merchantName: merchantName.trim(),
          merchantCode: merchantCode.trim() || undefined,
          qrImagePath: qrImagePath.trim(),
        },
      });

      toast.success('UPI configuration saved successfully');
    } catch (error: any) {
      const errorMessage = extractBackendErrorMessage(error);
      if (errorMessage.toLowerCase().includes('unauthorized')) {
        toast.error('Access denied: Only admins can update UPI configuration');
      } else {
        toast.error(errorMessage || 'Failed to save UPI configuration');
      }
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/admin' })}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>UPI Payment Configuration</CardTitle>
            <CardDescription>
              Configure your UPI merchant details for accepting payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {configLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="upiId">
                    UPI ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="upiId"
                    type="text"
                    placeholder="merchant@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Virtual Payment Address (VPA) for receiving payments
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchantName">
                    Merchant Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="merchantName"
                    type="text"
                    placeholder="Meet Enterprise"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Business name shown to customers during payment
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchantCode">Merchant Code (Optional)</Label>
                  <Input
                    id="merchantCode"
                    type="text"
                    placeholder="5411"
                    value={merchantCode}
                    onChange={(e) => setMerchantCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Merchant Category Code (MCC) for transaction categorization
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qrImagePath">
                    QR Code Image Path <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="qrImagePath"
                    type="text"
                    placeholder="/assets/GooglePay_QR.png"
                    value={qrImagePath}
                    onChange={(e) => setQrImagePath(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Path to your UPI QR code image (e.g., /assets/GooglePay_QR.png)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="gap-2"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/admin' })}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
