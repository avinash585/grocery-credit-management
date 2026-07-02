package com.grammart.sync;

import com.grammart.security.AppUser;
import com.grammart.sync.SyncDtos.SyncOperationResult;
import com.grammart.sync.SyncDtos.SyncPushRequest;
import com.grammart.sync.SyncDtos.SyncPushResponse;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class SyncService {
    private final SyncOperationRepository operations;

    public SyncService(SyncOperationRepository operations) {
        this.operations = operations;
    }

    @Transactional
    public SyncPushResponse push(AppUser user, SyncPushRequest request) {
        var results = request.operations().stream().map(operation -> {
            boolean exists = operations.findByShopIdAndClientOperationId(user.getShop().getId(), operation.clientOperationId()).isPresent();
            if (exists) {
                return new SyncOperationResult(operation.clientOperationId(), "DUPLICATE_IGNORED");
            }
            operations.save(new SyncOperation(user.getShop(), user, operation.clientOperationId(), operation.type(), operation.payload()));
            return new SyncOperationResult(operation.clientOperationId(), "ACCEPTED");
        }).toList();
        return new SyncPushResponse(results);
    }
}

