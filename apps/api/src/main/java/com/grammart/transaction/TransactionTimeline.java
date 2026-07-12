package com.grammart.transaction;

import com.grammart.common.BaseEntity;
import com.grammart.customer.Customer;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Customer transaction timeline - visual history of all activities.
 * Provides chronological view of purchases, payments, edits, reversals.
 */
@Entity
@Table(name = "transaction_timeline", indexes = {
        @Index(name = "idx_timeline_customer_created", columnList = "customer_id,created_at DESC"),
        @Index(name = "idx_timeline_shop_event", columnList = "shop_id,event_type,created_at DESC"),
        @Index(name = "idx_timeline_transaction", columnList = "related_transaction_id")
})
public class TransactionTimeline extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private TimelineEventType eventType;

    @Column(name = "related_transaction_id")
    private UUID relatedTransactionId;

    @Column(name = "event_icon", length = 10)
    private String eventIcon; // Emoji for UI display

    @Column(name = "event_title", length = 255, nullable = false)
    private String eventTitle;

    @Column(name = "event_description", length = 1000)
    private String eventDescription;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance_after", precision = 12, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "admin_username", length = 100)
    private String adminUsername;

    @Column(name = "metadata", columnDefinition = "json")
    private String metadata; // Additional structured data

    @Column(name = "is_reversal")
    private boolean isReversal;

    @Column(name = "reversal_reason")
    @Enumerated(EnumType.STRING)
    private ReversalReason reversalReason;

    protected TransactionTimeline() {
    }

    public TransactionTimeline(
            Shop shop,
            Customer customer,
            TimelineEventType eventType,
            UUID relatedTransactionId,
            String eventIcon,
            String eventTitle,
            String eventDescription,
            BigDecimal amount,
            BigDecimal balanceAfter,
            String adminUsername,
            String metadata,
            boolean isReversal,
            ReversalReason reversalReason
    ) {
        this.shop = shop;
        this.customer = customer;
        this.eventType = eventType;
        this.relatedTransactionId = relatedTransactionId;
        this.eventIcon = eventIcon;
        this.eventTitle = eventTitle;
        this.eventDescription = eventDescription;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.adminUsername = adminUsername;
        this.metadata = metadata;
        this.isReversal = isReversal;
        this.reversalReason = reversalReason;
    }

    // Getters
    public UUID getId() { return id; }
    public Customer getCustomer() { return customer; }
    public TimelineEventType getEventType() { return eventType; }
    public UUID getRelatedTransactionId() { return relatedTransactionId; }
    public String getEventIcon() { return eventIcon; }
    public String getEventTitle() { return eventTitle; }
    public String getEventDescription() { return eventDescription; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public String getAdminUsername() { return adminUsername; }
    public String getMetadata() { return metadata; }
    public boolean isReversal() { return isReversal; }
    public ReversalReason getReversalReason() { return reversalReason; }
}
