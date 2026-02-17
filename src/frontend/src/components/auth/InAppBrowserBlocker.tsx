import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { getInAppBrowserName } from '../../utils/detectInAppBrowser';
import { openInExternalBrowser } from '../../utils/openExternalBrowser';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { useState } from 'react';
import { toast } from 'sonner';

export default function InAppBrowserBlocker() {
  const [copied, setCopied] = useState(false);
  const appName = getInAppBrowserName();

  const handleOpenExternal = () => {
    const success = openInExternalBrowser();
    if (!success) {
      toast.error('Unable to open automatically. Please copy the link and open it in your browser.');
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error('Failed to copy link. Please copy it manually from the address bar.');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <Card className="w-full border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Unsupported Browser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground">
              {appName 
                ? `You're trying to sign in from inside ${appName}. This app's built-in browser is not supported.`
                : "You're trying to sign in from inside an app. This app's built-in browser is not supported."
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Secure authentication requires opening this page in a full browser like Chrome, Safari, Firefox, or Edge.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleOpenExternal}
              className="w-full gap-2"
              size="lg"
            >
              <ExternalLink className="h-5 w-5" />
              Open in Chrome/Safari to Continue
            </Button>

            <Button 
              onClick={handleCopyLink}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">How to continue:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Tap the button above to open in your browser</li>
              <li>Or copy the link and paste it in Chrome/Safari</li>
              <li>Sign in from there to access your account</li>
            </ol>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This limitation is required for secure passkey authentication and cannot be bypassed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
