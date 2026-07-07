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

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal mrp = BigDecimal.ZERO;

    @Column(name = "gst_percentage", precision = 5, scale = 2)
    private BigDecimal gstPercentage = BigDecimal.ZERO;

    @Column(name = "default_selling_price", precision = 12, scale = 2)
    private BigDecimal defaultSellingPrice = BigDecimal.ZERO;

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

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Shop getShop() { return shop; }
    public void setShop(Shop shop) { this.shop = shop; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }
    public BigDecimal getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(BigDecimal stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }
    public String getNameTa() { return nameTa; }
    public void setNameTa(String nameTa) { this.nameTa = nameTa; }
    public String getNameHi() { return nameHi; }
    public void setNameHi(String nameHi) { this.nameHi = nameHi; }
    public String getNameTe() { return nameTe; }
    public void setNameTe(String nameTe) { this.nameTe = nameTe; }
    public String getNameKn() { return nameKn; }
    public void setNameKn(String nameKn) { this.nameKn = nameKn; }
    public String getNameMl() { return nameMl; }
    public void setNameMl(String nameMl) { this.nameMl = nameMl; }
    public String getAliases() { return aliases; }
    public void setAliases(String aliases) { this.aliases = aliases; }
    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }
    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }
    public BigDecimal getGstPercentage() { return gstPercentage; }
    public void setGstPercentage(BigDecimal gstPercentage) { this.gstPercentage = gstPercentage; }
    public BigDecimal getDefaultSellingPrice() { return defaultSellingPrice; }
    public void setDefaultSellingPrice(BigDecimal defaultSellingPrice) { this.defaultSellingPrice = defaultSellingPrice; }
}
