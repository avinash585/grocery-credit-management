package com.grammart.shop;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopRepository extends JpaRepository<Shop, UUID> {
}

