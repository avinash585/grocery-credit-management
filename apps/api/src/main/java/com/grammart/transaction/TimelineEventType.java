package com.grammart.transaction;

/**
 * Types of events shown in customer timeline.
 */
public enum TimelineEventType {
    PURCHASE_ADDED("✓", "Purchase Added"),
    PAYMENT_RECEIVED("💰", "Payment Received"),
    QUANTITY_UPDATED("✏", "Quantity Updated"),
    PRICE_UPDATED("✏", "Price Updated"),
    ITEM_REMOVED("🗑", "Item Removed"),
    ITEM_REVERSED("↩", "Item Reversed"),
    TRANSACTION_REVERSED("↩", "Transaction Reversed"),
    TRANSACTION_CANCELLED("❌", "Transaction Cancelled"),
    TRANSACTION_TRANSFERRED("🔄", "Transaction Transferred"),
    TRANSACTION_RESTORED("🔄", "Transaction Restored"),
    PAYMENT_REVERSED("↩", "Payment Reversed"),
    LAST_TRANSACTION_UNDONE("↩", "Last Transaction Undone"),
    WHATSAPP_SENT("📲", "WhatsApp Notification Sent"),
    WHATSAPP_CORRECTION_SENT("📲", "WhatsApp Correction Sent"),
    RECEIPT_GENERATED("🧾", "Receipt Generated"),
    MANUAL_ADJUSTMENT("⚙", "Manual Adjustment"),
    INVENTORY_CORRECTED("📦", "Inventory Corrected"),
    BALANCE_CORRECTED("⚖", "Balance Corrected"),
    REPORT_GENERATED("📊", "Report Generated");

    private final String icon;
    private final String displayName;

    TimelineEventType(String icon, String displayName) {
        this.icon = icon;
        this.displayName = displayName;
    }

    public String getIcon() {
        return icon;
    }

    public String getDisplayName() {
        return displayName;
    }
}
