package com.grammart.transaction;

/**
 * Predefined reasons for transaction reversals and modifications.
 */
public enum ReversalReason {
    WRONG_CUSTOMER("Wrong customer selected"),
    WRONG_PRODUCT("Wrong product selected"),
    WRONG_QUANTITY("Incorrect quantity entered"),
    WRONG_PRICE("Incorrect price entered"),
    DUPLICATE_ENTRY("Duplicate transaction entry"),
    CANCELLED_PURCHASE("Purchase cancelled by customer"),
    PAYMENT_ERROR("Payment entered by mistake"),
    INVENTORY_CORRECTION("Inventory count correction"),
    CUSTOMER_REQUEST("Customer requested change"),
    ADMIN_ERROR("Administrative error"),
    SYSTEM_ERROR("System error or bug"),
    OTHER("Other reason");

    private final String displayName;

    ReversalReason(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
