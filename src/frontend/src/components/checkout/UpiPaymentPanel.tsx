import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { buildUpiDeepLink, getMerchantQrCodePath, MERCHANT_UPI_ID } from '../../constants/upi';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useGetMerchantConfig } from '../../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UpiPaymentPanelProps {
  amount?: number;
  transactionNote?: string;
  transactionRef?: string;
}

const DEFAULT_MERCHANT_ID = 'default';

export default function UpiPaymentPanel({ 
  amount, 
  transactionNote, 
  transactionRef 
}: UpiPaymentPanelProps) {
  const [copied, setCopied] = useState(false);
  const { data: merchantConfig, isLoading: configLoading, isError: configError } = useGetMerchantConfig(DEFAULT_MERCHANT_ID);
  const [showDefaultNotice, setShowDefaultNotice] = useState(false);

  // Show notice if config failed to load or is missing
  useEffect(() => {
    if (!configLoading && (configError || !merchantConfig)) {
      setShowDefaultNotice(true);
      toast.info('Using default payment settings. Admin can configure custom UPI details.', {
        duration: 5000,
      });
    }
  }, [configLoading, configError, merchantConfig]);

  // Build UPI deep link with config override if available
  const configOverride = merchantConfig ? {
    upiId: merchantConfig.upiId,
    merchantName: merchantConfig.merchantName,
    merchantCode: merchantConfig.merchantCode,
    qrImagePath: merchantConfig.qrImagePath,
  } : undefined;

  const upiDeepLink = buildUpiDeepLink(amount, transactionNote, transactionRef, configOverride);
  const qrCodePath = getMerchantQrCodePath(configOverride);
  const displayUpiId = merchantConfig?.upiId || MERCHANT_UPI_ID;

  const handleQrClick = () => {
    try {
      // Navigate to UPI deep link in the same window
      // This allows the OS to hand off to installed UPI apps
      window.location.href = upiDeepLink;
    } catch (error) {
      console.error('Failed to open UPI app:', error);
      toast.error('Unable to open UPI app. Please try copying the UPI ID instead.');
    }
  };

  const handleCopyUpiId = async () => {
    const success = await copyToClipboard(displayUpiId);
    if (success) {
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error('Failed to copy UPI ID. Please copy it manually.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-gold" />
          Pay with UPI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default settings notice */}
        {showDefaultNotice && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Using default payment settings. Contact admin to configure custom UPI details.
            </AlertDescription>
          </Alert>
        )}

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="relative bg-white p-4 rounded-lg border-2 border-gold/20 cursor-pointer hover:border-gold/40 transition-colors group"
            onClick={handleQrClick}
          >
            <img 
              src={qrCodePath} 
              alt="UPI Payment QR Code" 
              className="w-64 h-64 object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = '/assets/GooglePay_QR.png';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gold text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Open UPI App
              </div>
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            Tap the QR code to open your UPI app
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">How to pay:</p>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Tap the QR code above to open your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
            <li>Or scan the QR code using any UPI app</li>
            <li>Verify the payment details and complete the transaction</li>
            <li>Return here after payment to continue</li>
          </ol>
        </div>

        {/* Fallback: Copy UPI ID */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Or pay manually:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono">
              {displayUpiId}
            </div>
            <Button 
              onClick={handleCopyUpiId}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Copy this UPI ID and paste it in your UPI app to make payment
          </p>
        </div>

        {/* Amount display if provided */}
        {amount && amount > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount to pay:</span>
              <span className="text-2xl font-bold text-gold">₹{amount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
