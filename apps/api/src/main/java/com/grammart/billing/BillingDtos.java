package com.grammart.billing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class BillingDtos {
    private BillingDtos() {
    }

    public record BillItemRequest(@NotNull UUID productId, @NotNull @DecimalMin("0.001") BigDecimal quantity) {
    }

    public record CreateBillRequest(@NotNull UUID customerId, boolean creditBill, @NotEmpty List<@Valid BillItemRequest> items) {
    }

    public record BillItemResponse(String productName, BigDecimal quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
    }

    public record BillResponse(UUID id, UUID customerId, BillStatus status, BigDecimal totalAmount, boolean creditBill, List<BillItemResponse> items) {
        static BillResponse from(Bill bill) {
            return new BillResponse(
                    bill.getId(),
                    bill.getCustomer().getId(),
                    bill.getStatus(),
                    bill.getTotalAmount(),
                    bill.isCreditBill(),
                    bill.getItems().stream()
                            .map(item -> new BillItemResponse(item.getProduct().getNameEn(), item.getQuantity(), item.getUnitPrice(), item.getLineTotal()))
                            .toList()
            );
        }
    }
}

