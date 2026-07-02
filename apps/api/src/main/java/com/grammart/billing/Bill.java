package com.grammart.billing;

import com.grammart.common.BaseEntity;
import com.grammart.customer.Customer;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bills", indexes = {
        @Index(name = "idx_bills_shop_created", columnList = "shop_id,created_at"),
        @Index(name = "idx_bills_customer", columnList = "customer_id")
})
public class Bill extends BaseEntity {
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
    private BillStatus status = BillStatus.DRAFT;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "credit_bill", nullable = false)
    private boolean creditBill;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> items = new ArrayList<>();

    protected Bill() {
    }

    public Bill(Shop shop, Customer customer, boolean creditBill) {
        this.shop = shop;
        this.customer = customer;
        this.creditBill = creditBill;
    }

    public void addItem(BillItem item) {
        item.attachTo(this);
        items.add(item);
        recalculate();
    }

    public void confirm() {
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm an empty bill");
        }
        status = BillStatus.CONFIRMED;
    }

    private void recalculate() {
        subtotal = items.stream().map(BillItem::getLineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        totalAmount = subtotal.add(taxAmount);
    }

    public UUID getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public BillStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public boolean isCreditBill() {
        return creditBill;
    }

    public List<BillItem> getItems() {
        return List.copyOf(items);
    }
}

