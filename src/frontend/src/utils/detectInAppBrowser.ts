/**
 * Detects if the current browser is an in-app browser/WebView
 * based on user agent patterns for common social media and messaging apps
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const ua = window.navigator.userAgent.toLowerCase();

  // Common in-app browser patterns
  const inAppPatterns = [
    'fban', // Facebook App
    'fbav', // Facebook App
    'fb_iab', // Facebook In-App Browser
    'instagram', // Instagram
    'twitter', // Twitter/X
    'line/', // LINE
    'micromessenger', // WeChat
    'telegram', // Telegram
    'snapchat', // Snapchat
    'tiktok', // TikTok
    'linkedin', // LinkedIn
    'whatsapp', // WhatsApp
    'pinterestbot', // Pinterest
    'reddit', // Reddit
  ];

  // Check if any in-app browser pattern matches
  return inAppPatterns.some((pattern) => ua.includes(pattern));
}

/**
 * Gets a user-friendly name for the detected in-app browser
 */
export function getInAppBrowserName(): string | null {
  if (!isInAppBrowser()) {
    return null;
  }

  const ua = window.navigator.userAgent.toLowerCase();

  if (ua.includes('fban') || ua.includes('fbav') || ua.includes('fb_iab')) {
    return 'Facebook';
  }
  if (ua.includes('instagram')) {
    return 'Instagram';
  }
  if (ua.includes('twitter')) {
    return 'X (Twitter)';
  }
  if (ua.includes('telegram')) {
    return 'Telegram';
  }
  if (ua.includes('snapchat')) {
    return 'Snapchat';
  }
  if (ua.includes('tiktok')) {
    return 'TikTok';
  }
  if (ua.includes('linkedin')) {
    return 'LinkedIn';
  }
  if (ua.includes('whatsapp')) {
    return 'WhatsApp';
  }
  if (ua.includes('line/')) {
    return 'LINE';
  }
  if (ua.includes('micromessenger')) {
    return 'WeChat';
  }
  if (ua.includes('reddit')) {
    return 'Reddit';
  }
  if (ua.includes('pinterestbot')) {
    return 'Pinterest';
  }

  return 'in-app browser';
}
