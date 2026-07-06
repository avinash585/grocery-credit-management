package com.grammart.voice;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shop_aliases", uniqueConstraints = {
    @UniqueConstraint(name = "uq_shop_alias", columnNames = {"shop_id", "category", "alias_value"})
})
public class ShopAlias {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shop_id", nullable = false)
    private String shopId;

    @Column(name = "category", nullable = false)
    private String category; // 'CUSTOMER' or 'PRODUCT'

    @Column(name = "canonical_id", nullable = false)
    private String canonicalId;

    @Column(name = "alias_value", nullable = false)
    private String aliasValue;

    @Column(name = "is_global", nullable = false)
    private boolean isGlobal = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public ShopAlias() {}

    public ShopAlias(String shopId, String category, String canonicalId, String aliasValue, boolean isGlobal) {
        this.shopId = shopId;
        this.category = category;
        this.canonicalId = canonicalId;
        this.aliasValue = aliasValue;
        this.isGlobal = isGlobal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShopId() { return shopId; }
    public void setShopId(String shopId) { this.shopId = shopId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCanonicalId() { return canonicalId; }
    public void setCanonicalId(String canonicalId) { this.canonicalId = canonicalId; }
    public String getAliasValue() { return aliasValue; }
    public void setAliasValue(String aliasValue) { this.aliasValue = aliasValue; }
    public boolean isGlobal() { return isGlobal; }
    public void setGlobal(boolean global) { isGlobal = global; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
