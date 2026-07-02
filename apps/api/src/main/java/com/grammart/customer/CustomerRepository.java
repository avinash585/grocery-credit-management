package com.grammart.customer;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findTop20ByShopIdAndNameContainingIgnoreCaseAndDeletedAtIsNull(UUID shopId, String name);
    Optional<Customer> findByIdAndShopIdAndDeletedAtIsNull(UUID id, UUID shopId);
}
