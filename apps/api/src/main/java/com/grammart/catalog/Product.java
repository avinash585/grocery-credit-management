package com.grammart.catalog;

import com.grammart.common.BaseEntity;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_shop_enabled", columnList = "shop_id,enabled"),
        @Index(name = "idx_products_sku", columnList = "sku")
})
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(nullable = false, length = 64)
    private String sku;

    private String barcode;

    @Column(nullable = false)
    private String category;

    private String brand;

    @Column(nullable = false, length = 32)
    private String unit;

    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "stock_quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockQuantity = BigDecimal.ZERO;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "name_ta")
    private String nameTa;

    @Column(name = "name_hi")
    private String nameHi;

    @Column(name = "name_te")
    private String nameTe;

    @Column(name = "name_kn")
    private String nameKn;

    @Column(name = "name_ml")
    private String nameMl;

    @Column(columnDefinition = "json")
    private String aliases;

    protected Product() {
    }

    public UUID getId() {
        return id;
    }

    public String getSku() {
        return sku;
    }

    public String getNameEn() {
        return nameEn;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public String getUnit() {
        return unit;
    }

    public boolean isEnabled() {
        return enabled;
    }
}
