package com.grammart.sync;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyncOperationRepository extends JpaRepository<SyncOperation, UUID> {
    Optional<SyncOperation> findByShopIdAndClientOperationId(UUID shopId, String clientOperationId);
}

