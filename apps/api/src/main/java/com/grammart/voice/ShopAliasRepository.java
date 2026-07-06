package com.grammart.voice;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShopAliasRepository extends JpaRepository<ShopAlias, Long> {
    List<ShopAlias> findByShopId(String shopId);
    List<ShopAlias> findByShopIdAndCategory(String shopId, String category);
    Optional<ShopAlias> findByShopIdAndCategoryAndAliasValue(String shopId, String category, String aliasValue);
    List<ShopAlias> findByIsGlobalTrue();
}
