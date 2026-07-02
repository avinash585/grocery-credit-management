package com.grammart.catalog;

import com.grammart.catalog.ProductDtos.ProductResponse;
import com.grammart.security.AppUser;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    List<ProductResponse> search(@AuthenticationPrincipal AppUser user, @RequestParam(defaultValue = "") String query) {
        return products.searchEnabled(user.getShop().getId(), query).stream().map(ProductResponse::from).toList();
    }
}

