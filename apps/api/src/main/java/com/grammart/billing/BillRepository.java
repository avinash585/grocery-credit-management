package com.grammart.billing;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, UUID> {
    List<Bill> findTop20ByShopIdAndCreatedAtBetweenOrderByCreatedAtDesc(UUID shopId, Instant from, Instant to);
}

