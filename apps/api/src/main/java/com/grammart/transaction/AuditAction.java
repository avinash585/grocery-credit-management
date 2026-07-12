package com.grammart.transaction;

/**
 * All possible transaction management actions tracked in audit trail.
 */
public enum AuditAction {
    // Creation actions
    BILL_CREATED,
    PAYMENT_RECEIVED,
    
    // Modification actions
    BILL_ITEM_ADDED,
    BILL_ITEM_REMOVED,
    BILL_ITEM_QUANTITY_UPDATED,
    BILL_ITEM_PRICE_UPDATED,
    
    // Reversal actions
    BILL_REVERSED,
    BILL_ITEM_REVERSED,
    PAYMENT_REVERSED,
    LAST_TRANSACTION_UNDONE,
    
    // Transfer actions
    BILL_TRANSFERRED,
    PAYMENT_TRANSFERRED,
    
    // Restoration actions
    BILL_RESTORED,
    PAYMENT_RESTORED,
    
    // Status changes
    BILL_CANCELLED,
    BILL_CONFIRMED,
    
    // Admin corrections
    MANUAL_ADJUSTMENT,
    INVENTORY_CORRECTION,
    BALANCE_CORRECTION
}
