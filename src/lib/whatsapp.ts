/**
 * WhatsApp integration utilities for Patel Motors
 * Handles phone number normalization, message formatting, and WhatsApp forwarding.
 */

export const DEFAULT_DEALER_WHATSAPP = '918452088500';

/**
 * Normalizes any phone number into an international E.164-compatible format for wa.me links
 * Handles 10-digit Indian numbers, numbers with leading +91, 0, spaces, dashes, etc.
 */
export function sanitizeWhatsAppNumber(phone: string | undefined | null): string {
  if (!phone) return DEFAULT_DEALER_WHATSAPP;
  
  // Remove all non-numeric characters
  let digits = phone.replace(/\D/g, '');
  
  if (!digits) return DEFAULT_DEALER_WHATSAPP;

  // Standard Indian 10-digit mobile number
  if (digits.length === 10) {
    return '91' + digits;
  }

  // 11 digits starting with 0 (e.g. 09820155443)
  if (digits.length === 11 && digits.startsWith('0')) {
    return '91' + digits.substring(1);
  }

  // Already has 91 country code (12 digits)
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  return digits;
}

export interface BikeSellDetails {
  make: string;
  model: string;
  year: string | number;
  mileage: string | number;
  ownership: string;
  expectedPrice?: string | number;
  name: string;
  phone: string;
  notes?: string;
  images?: string[];
}

/**
 * Compiles a concise, readable WhatsApp message for bike valuation inquiries
 */
export function formatBikeSellWhatsAppMessage(data: BikeSellDetails): string {
  const lines = [
    `*Bike for Sale - Valuation Request*`,
    `Patel Motors Mumbai`,
    ``,
    `*Bike:* ${data.make.trim()} ${data.model.trim()} (${data.year})`,
    `*Kilometers:* ${Number(data.mileage || 0).toLocaleString('en-IN')} KM`,
    `*Ownership:* ${data.ownership} Owner`,
    data.expectedPrice ? `*Expected Price:* ₹${Number(data.expectedPrice).toLocaleString('en-IN')}` : null,
    data.notes ? `*Notes:* ${data.notes.trim()}` : null,
    ``,
    `*Seller Contact:*`,
    `• Name: ${data.name.trim()}`,
    `• Phone: ${data.phone.trim()}`
  ];

  if (data.images && data.images.length > 0) {
    lines.push(``);
    lines.push(`*Photos (${data.images.length}):*`);
    data.images.slice(0, 3).forEach((img, i) => {
      lines.push(`${i + 1}. ${img}`);
    });
  }

  return lines.filter(line => line !== null).join('\n');
}

/**
 * Returns a wa.me direct URL with encoded message
 */
export function createWhatsAppUrl(targetPhone: string, text: string): string {
  const cleanPhone = sanitizeWhatsAppNumber(targetPhone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Forwards details to WhatsApp by opening the link in a safe window/tab
 */
export function forwardToWhatsApp(targetPhone: string, text: string): boolean {
  try {
    const url = createWhatsAppUrl(targetPhone, text);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      return true;
    }
    // Fallback if popup blocker intercepted
    window.location.href = url;
    return true;
  } catch (err) {
    console.error('Failed to open WhatsApp window:', err);
    return false;
  }
}

/**
 * Concise message when dealer replies to a customer inquiry on WhatsApp
 */
export function formatDealerFollowUpMessage(leadName: string, vehicleInfo: string): string {
  const shortInfo = vehicleInfo.split('\n')[0];
  return `Hi ${leadName.trim()}, regarding your ${shortInfo} submitted to Patel Motors. We have reviewed your details and would like to share our valuation offer.`;
}
