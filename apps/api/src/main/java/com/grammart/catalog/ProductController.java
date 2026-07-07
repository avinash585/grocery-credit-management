package com.grammart.catalog;

import com.grammart.catalog.ProductDtos.ProductResponse;
import com.grammart.security.AppUser;
import com.grammart.shop.Shop;
import com.grammart.shop.ShopRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductRepository products;
    private final ShopRepository shops;

    public ProductController(ProductRepository products, ShopRepository shops) {
        this.products = products;
        this.shops = shops;
    }

    @GetMapping
    List<ProductResponse> search(
            @AuthenticationPrincipal AppUser user,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) Boolean enabled
    ) {
        return products.searchCatalog(user.getShop().getId(), query, enabled)
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ProductResponse create(@AuthenticationPrincipal AppUser user, @RequestBody Product input) {
        Shop shop = shops.findById(user.getShop().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found"));
        
        Product p = new Product();
        p.setShop(shop);
        p.setSku(input.getSku() != null ? input.getSku() : "CUSTOM-" + System.currentTimeMillis());
        p.setBarcode(input.getBarcode());
        p.setCategory(input.getCategory() != null ? input.getCategory() : "Staples");
        p.setBrand(input.getBrand() != null ? input.getBrand() : "Generic");
        p.setUnit(input.getUnit() != null ? input.getUnit() : "kg");
        p.setSellingPrice(input.getSellingPrice() != null ? input.getSellingPrice() : BigDecimal.ZERO);
        p.setPurchasePrice(input.getPurchasePrice() != null ? input.getPurchasePrice() : BigDecimal.ZERO);
        p.setMrp(input.getMrp() != null ? input.getMrp() : BigDecimal.ZERO);
        p.setGstPercentage(input.getGstPercentage() != null ? input.getGstPercentage() : BigDecimal.ZERO);
        p.setStockQuantity(input.getStockQuantity() != null ? input.getStockQuantity() : BigDecimal.ZERO);
        p.setEnabled(true);
        p.setNameEn(input.getNameEn());
        p.setNameTa(input.getNameTa());
        p.setNameHi(input.getNameHi());
        p.setNameTe(input.getNameTe());
        p.setNameKn(input.getNameKn());
        p.setNameMl(input.getNameMl());
        p.setAliases(input.getAliases());
        p.setImageUrl(input.getImageUrl());
        
        return ProductResponse.from(products.save(p));
    }

    @PutMapping("/{id}")
    ProductResponse update(
            @AuthenticationPrincipal AppUser user,
            @PathVariable UUID id,
            @RequestBody Product input
    ) {
        Product p = products.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        
        if (p.getShop() != null && !p.getShop().getId().equals(user.getShop().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        if (p.getShop() == null) {
            Shop shop = shops.findById(user.getShop().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found"));
            Product clone = new Product();
            clone.setShop(shop);
            clone.setSku(p.getSku());
            clone.setBarcode(p.getBarcode());
            clone.setCategory(p.getCategory());
            clone.setBrand(p.getBrand());
            clone.setUnit(p.getUnit());
            clone.setImageUrl(p.getImageUrl());
            clone.setNameEn(p.getNameEn());
            clone.setNameTa(p.getNameTa());
            clone.setNameHi(p.getNameHi());
            clone.setNameTe(p.getNameTe());
            clone.setNameKn(p.getNameKn());
            clone.setNameMl(p.getNameMl());
            p = clone;
        }

        if (input.getSellingPrice() != null) p.setSellingPrice(input.getSellingPrice());
        if (input.getPurchasePrice() != null) p.setPurchasePrice(input.getPurchasePrice());
        if (input.getMrp() != null) p.setMrp(input.getMrp());
        if (input.getGstPercentage() != null) p.setGstPercentage(input.getGstPercentage());
        if (input.getStockQuantity() != null) p.setStockQuantity(input.getStockQuantity());
        if (input.getBarcode() != null) p.setBarcode(input.getBarcode());
        if (input.getAliases() != null) p.setAliases(input.getAliases());
        if (input.getNameTa() != null) p.setNameTa(input.getNameTa());
        if (input.getNameHi() != null) p.setNameHi(input.getNameHi());
        
        return ProductResponse.from(products.save(p));
    }

    @PutMapping("/{id}/status")
    ProductResponse toggleStatus(
            @AuthenticationPrincipal AppUser user,
            @PathVariable UUID id,
            @RequestParam boolean enabled
    ) {
        Product p = products.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        
        if (p.getShop() != null && !p.getShop().getId().equals(user.getShop().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        if (p.getShop() == null) {
            Shop shop = shops.findById(user.getShop().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found"));
            Product clone = new Product();
            clone.setShop(shop);
            clone.setSku(p.getSku());
            clone.setBarcode(p.getBarcode());
            clone.setCategory(p.getCategory());
            clone.setBrand(p.getBrand());
            clone.setUnit(p.getUnit());
            clone.setImageUrl(p.getImageUrl());
            clone.setNameEn(p.getNameEn());
            clone.setNameTa(p.getNameTa());
            clone.setNameHi(p.getNameHi());
            clone.setNameTe(p.getNameTe());
            clone.setNameKn(p.getNameKn());
            clone.setNameMl(p.getNameMl());
            clone.setSellingPrice(p.getSellingPrice());
            clone.setStockQuantity(p.getStockQuantity());
            clone.setPurchasePrice(p.getPurchasePrice());
            clone.setMrp(p.getMrp());
            clone.setGstPercentage(p.getGstPercentage());
            p = clone;
        }

        p.setEnabled(enabled);
        return ProductResponse.from(products.save(p));
    }
}

