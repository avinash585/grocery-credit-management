package com.grammart.transaction;

import com.grammart.common.BaseEntity;
import com.grammart.customer.Customer;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Enterprise-grade audit trail for all transaction modifications.
 * Never delete - maintains complete history of every change.
 */
@Entity
@Table(name = "transaction_audits", indexes = {
        @Index(name = "idx_audit_transaction", columnList = "transaction_id,created_at"),
        @Index(name = "idx_audit_customer", columnList = "customer_id,created_at"),
        @Index(name = "idx_audit_shop_action", columnList = "shop_id,action,created_at"),
        @Index(name = "idx_audit_admin", columnList = "admin_username,created_at")
})
public class TransactionAudit extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "transaction_type")
    private String transactionType; // BILL, PAYMENT, LEDGER_ENTRY

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_customer_id")
    private Customer targetCustomer; // For transfer operations

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "reversal_reason")
    private ReversalReason reversalReason;

    @Column(name = "custom_reason", length = 500)
    private String customReason;

    @Column(name = "admin_username", nullable = false)
    private String adminUsername;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    @Column(name = "old_value", columnDefinition = "json")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "json")
    private String newValue;

    @Column(name = "amount_affected", precision = 12, scale = 2)
    private BigDecimal amountAffected;

    @Column(name = "balance_before", precision = 12, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", precision = 12, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "notification_sent")
    private boolean notificationSent;

    @Column(name = "notes", length = 1000)
    private String notes;

    protected TransactionAudit() {
    }

    public TransactionAudit(
            Shop shop,
            UUID transactionId,
            String transactionType,
            Customer customer,
            AuditAction action,
            ReversalReason reversalReason,
            String customReason,
            String adminUsername,
            String ipAddress,
            String deviceInfo,
            String oldValue,
            String newValue,
            BigDecimal amountAffected,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String notes
    ) {
        this.shop = shop;
        this.transactionId = transactionId;
        this.transactionType = transactionType;
        this.customer = customer;
        this.action = action;
        this.reversalReason = reversalReason;
        this.customReason = customReason;
        this.adminUsername = adminUsername;
        this.ipAddress = ipAddress;
        this.deviceInfo = deviceInfo;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.amountAffected = amountAffected;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.notes = notes;
        this.notificationSent = false;
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getTransactionId() { return transactionId; }
    public String getTransactionType() { return transactionType; }
    public Customer getCustomer() { return customer; }
    public Customer getTargetCustomer() { return targetCustomer; }
    public AuditAction getAction() { return action; }
    public ReversalReason getReversalReason() { return reversalReason; }
    public String getCustomReason() { return customReason; }
    public String getAdminUsername() { return adminUsername; }
    public String getIpAddress() { return ipAddress; }
    public String getDeviceInfo() { return deviceInfo; }
    public String getOldValue() { return oldValue; }
    public String getNewValue() { return newValue; }
    public BigDecimal getAmountAffected() { return amountAffected; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public boolean isNotificationSent() { return notificationSent; }
    public String getNotes() { return notes; }

    public void setTargetCustomer(Customer targetCustomer) {
        this.targetCustomer = targetCustomer;
    }

    public void markNotificationSent() {
        this.notificationSent = true;
    }
}
