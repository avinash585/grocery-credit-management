package com.grammart.ledger;

import com.grammart.common.BaseEntity;
import com.grammart.customer.Customer;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "ledger_entries", indexes = {
        @Index(name = "idx_ledger_customer_created", columnList = "customer_id,created_at"),
        @Index(name = "idx_ledger_shop_type", columnList = "shop_id,type")
})
public class LedgerEntry extends BaseEntity {
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
    @Column(nullable = false)
    private LedgerEntryType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance_after", nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceAfter;

    @Column(columnDefinition = "json")
    private String metadata;

    protected LedgerEntry() {
    }

    public LedgerEntry(Shop shop, Customer customer, LedgerEntryType type, BigDecimal amount, BigDecimal balanceAfter, String metadata) {
        this.shop = shop;
        this.customer = customer;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.metadata = metadata;
    }
}

