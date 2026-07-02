package com.grammart.sync;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class SyncDtos {
    private SyncDtos() {
    }

    public record SyncOperationRequest(@NotBlank String clientOperationId, @NotBlank String type, @NotNull String payload) {
    }

    public record SyncPushRequest(@NotNull List<SyncOperationRequest> operations) {
    }

    public record SyncOperationResult(String clientOperationId, String status) {
    }

    public record SyncPushResponse(List<SyncOperationResult> results) {
    }
}

