package com.grammart.catalog;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query("""
            select p from Product p
            where (p.shop.id = :shopId or p.shop is null)
              and (:enabled is null or p.enabled = :enabled)
              and (:query = '' or
                   lower(p.nameEn) like lower(concat('%', :query, '%')) or
                   lower(p.nameTa) like lower(concat('%', :query, '%')) or
                   lower(p.nameHi) like lower(concat('%', :query, '%')) or
                   lower(p.nameTe) like lower(concat('%', :query, '%')) or
                   lower(p.nameKn) like lower(concat('%', :query, '%')) or
                   lower(p.nameMl) like lower(concat('%', :query, '%')) or
                   lower(p.brand) like lower(concat('%', :query, '%')) or
                   lower(p.sku) like lower(concat('%', :query, '%')) or
                   lower(p.barcode) like lower(concat('%', :query, '%')) or
                   lower(p.aliases) like lower(concat('%', :query, '%'))
                  )
            order by p.nameEn
            """)
    List<Product> searchCatalog(@Param("shopId") UUID shopId, @Param("query") String query, @Param("enabled") Boolean enabled);
}

