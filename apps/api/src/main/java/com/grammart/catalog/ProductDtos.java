package com.grammart.catalog;

import java.math.BigDecimal;
import java.util.UUID;

public final class ProductDtos {
    private ProductDtos() {
    }

    public record ProductResponse(
        UUID id, 
        String sku, 
        String name, 
        BigDecimal sellingPrice,
        String nameTa,
        String nameHi,
        String nameTe,
        String nameKn,
        String nameMl,
        String barcode,
        String category,
        String brand,
        String unit,
        BigDecimal purchasePrice,
        BigDecimal mrp,
        BigDecimal gstPercentage,
        BigDecimal stockQuantity,
        boolean enabled,
        String imageUrl,
        String aliases,
        BigDecimal defaultSellingPrice
    ) {
        static ProductResponse from(Product product) {
            return new ProductResponse(
                product.getId(), 
                product.getSku(), 
                product.getNameEn(), 
                product.getSellingPrice(),
                product.getNameTa(),
                product.getNameHi(),
                product.getNameTe(),
                product.getNameKn(),
                product.getNameMl(),
                product.getBarcode(),
                product.getCategory(),
                product.getBrand(),
                product.getUnit(),
                product.getPurchasePrice(),
                product.getMrp(),
                product.getGstPercentage(),
                product.getStockQuantity(),
                product.isEnabled(),
                product.getImageUrl(),
                product.getAliases(),
                product.getDefaultSellingPrice()
            );
        }
    }
}

