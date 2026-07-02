package com.grammart.catalog;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query("""
            select p from Product p
            where p.enabled = true
              and (p.shop.id = :shopId or p.shop is null)
              and (lower(p.nameEn) like lower(concat('%', :query, '%')) or lower(p.aliases) like lower(concat('%', :query, '%')))
            order by p.nameEn
            """)
    List<Product> searchEnabled(@Param("shopId") UUID shopId, @Param("query") String query);
}

