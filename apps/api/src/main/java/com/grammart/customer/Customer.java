package com.grammart.customer;

import com.grammart.common.BaseEntity;
import com.grammart.common.Language;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "customers", indexes = {
        @Index(name = "idx_customers_shop_name", columnList = "shop_id,name"),
        @Index(name = "idx_customers_shop_phone", columnList = "shop_id,phone")
})
public class Customer extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(nullable = false)
    private String name;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_language", nullable = false)
    private Language preferredLanguage = Language.ENGLISH;

    @Column(name = "outstanding_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal outstandingBalance = BigDecimal.ZERO;

    private String notes;

    protected Customer() {
    }

    public Customer(Shop shop, String name, String phone, Language preferredLanguage, String notes) {
        this.shop = shop;
        this.name = name;
        this.phone = phone;
        this.preferredLanguage = preferredLanguage;
        this.notes = notes;
    }

    public void applyCredit(BigDecimal amount) {
        outstandingBalance = outstandingBalance.add(amount);
    }

    public void applyPayment(BigDecimal amount) {
        outstandingBalance = outstandingBalance.subtract(amount).max(BigDecimal.ZERO);
    }

    public void setOutstandingBalance(BigDecimal balance) {
        this.outstandingBalance = balance;
    }

    public UUID getId() {
        return id;
    }

    public Shop getShop() {
        return shop;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public Language getPreferredLanguage() {
        return preferredLanguage;
    }

    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }

    public String getNotes() {
        return notes;
    }
}
