/**
 * UPI payment configuration constants
 */

// Default merchant UPI ID (Virtual Payment Address)
export const MERCHANT_UPI_ID = 'merchant@upi'; // Replace with actual merchant UPI ID

// Default merchant name
export const MERCHANT_NAME = 'Meet Enterprise';

// Default merchant code (optional, for categorization)
export const MERCHANT_CODE = '5411'; // General retail

/**
 * Merchant configuration override type
 */
export interface MerchantConfigOverride {
  upiId?: string;
  merchantName?: string;
  merchantCode?: string;
  qrImagePath?: string;
}

/**
 * Builds a UPI deep link for payment
 * @param amount - Payment amount in INR (optional, can be left empty for user to enter)
 * @param transactionNote - Note/description for the transaction (optional)
 * @param transactionRef - Unique transaction reference ID (optional)
 * @param configOverride - Optional merchant configuration overrides
 * @returns UPI deep link string
 */
export function buildUpiDeepLink(
  amount?: number,
  transactionNote?: string,
  transactionRef?: string,
  configOverride?: MerchantConfigOverride
): string {
  const params = new URLSearchParams();
  
  // Use override values or fall back to defaults
  const upiId = configOverride?.upiId || MERCHANT_UPI_ID;
  const merchantName = configOverride?.merchantName || MERCHANT_NAME;
  const merchantCode = configOverride?.merchantCode || MERCHANT_CODE;
  
  // Required parameters
  params.append('pa', upiId); // Payee address
  params.append('pn', merchantName); // Payee name
  params.append('cu', 'INR'); // Currency
  
  // Optional parameters
  if (merchantCode) {
    params.append('mc', merchantCode); // Merchant code
  }
  
  if (amount && amount > 0) {
    params.append('am', amount.toFixed(2)); // Amount
  }
  
  if (transactionNote) {
    params.append('tn', transactionNote); // Transaction note
  }
  
  if (transactionRef) {
    params.append('tr', transactionRef); // Transaction reference
  }
  
  return `upi://pay?${params.toString()}`;
}

/**
 * Gets the path to the merchant UPI QR code image
 * @param configOverride - Optional merchant configuration overrides
 */
export function getMerchantQrCodePath(configOverride?: MerchantConfigOverride): string {
  return configOverride?.qrImagePath || '/assets/merchant-upi-qr.png';
}
