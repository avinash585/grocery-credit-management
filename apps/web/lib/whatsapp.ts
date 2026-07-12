// ─── GramMart WhatsApp Notification Helper ───────────────────────────────────
// Uses the /api/whatsapp route which calls Twilio under the hood

import type { Language } from "./i18n";

export type NotificationLanguage = Language;

export type WhatsAppPayload =
  | { type: "CREDIT_SALE";       to: string; language: NotificationLanguage; data: CreditData }
  | { type: "PAYMENT_RECEIVED";  to: string; language: NotificationLanguage; data: PaymentData }
  | { type: "BALANCE_REMINDER";  to: string; language: NotificationLanguage; data: ReminderData };

interface CreditData {
  customerName: string;
  productName:  string;
  quantity:     string;
  amount:       string;
  balance:      string;
  shopName:     string;
}
interface PaymentData {
  customerName: string;
  amount:       string;
  balance:      string;
  shopName:     string;
}
interface ReminderData {
  customerName: string;
  balance:      string;
  shopName:     string;
}

/**
 * Send a WhatsApp notification via Twilio.
 * Returns true on success, false on failure.
 */
export async function sendWhatsApp(payload: WhatsAppPayload): Promise<boolean> {
  // Don't block if phone is missing
  if (!payload.to || payload.to.length < 7) return false;

  try {
    const res = await fetch("/api/whatsapp", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[WhatsApp] Twilio error:", err);
      return false;
    }
    const data = await res.json() as { success?: boolean; messageSid?: string };
    console.info("[WhatsApp] Sent:", data.messageSid);
    return data.success === true;
  } catch (e) {
    console.warn("[WhatsApp] Network error:", e);
    return false;
  }
}

/**
 * Convenience: send credit-sale notification.
 */
export function notifyCreditSale(opts: {
  phone:        string;
  customerName: string;
  productName:  string;
  quantity:     string;
  amount:       number;
  balance:      number;
  shopName:     string;
  language:     NotificationLanguage;
}) {
  return sendWhatsApp({
    type:     "CREDIT_SALE",
    to:       opts.phone,
    language: opts.language,
    data: {
      customerName: opts.customerName,
      productName:  opts.productName,
      quantity:     opts.quantity,
      amount:       opts.amount.toFixed(2),
      balance:      opts.balance.toFixed(2),
      shopName:     opts.shopName,
    },
  });
}

/**
 * Convenience: send payment-received notification.
 */
export function notifyPaymentReceived(opts: {
  phone:        string;
  customerName: string;
  amount:       number;
  balance:      number;
  shopName:     string;
  language:     NotificationLanguage;
}) {
  return sendWhatsApp({
    type:     "PAYMENT_RECEIVED",
    to:       opts.phone,
    language: opts.language,
    data: {
      customerName: opts.customerName,
      amount:       opts.amount.toFixed(2),
      balance:      opts.balance.toFixed(2),
      shopName:     opts.shopName,
    },
  });
}

/**
 * Convenience: send balance reminder notification.
 */
export function notifyBalanceReminder(opts: {
  phone:        string;
  customerName: string;
  balance:      number;
  shopName:     string;
  language:     NotificationLanguage;
}) {
  return sendWhatsApp({
    type:     "BALANCE_REMINDER",
    to:       opts.phone,
    language: opts.language,
    data: {
      customerName: opts.customerName,
      balance:      opts.balance.toFixed(2),
      shopName:     opts.shopName,
    },
  });
}
