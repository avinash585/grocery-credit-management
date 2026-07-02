package com.grammart.ledger;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public final class LedgerDtos {
    private LedgerDtos() {
    }

    public record CreditRequest(@NotNull UUID customerId, @NotNull @DecimalMin("0.01") BigDecimal amount, String note) {
    }

    public record PaymentRequest(@NotNull UUID customerId, @NotNull @DecimalMin("0.01") BigDecimal amount, String note) {
    }

    public record LedgerResponse(UUID customerId, BigDecimal outstandingBalance) {
    }
}

