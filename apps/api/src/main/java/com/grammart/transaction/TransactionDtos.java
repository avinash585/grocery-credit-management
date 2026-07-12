package com.grammart.transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTOs for Transaction Management API.
 */
public class TransactionDtos {

    /**
     * Request to reverse a transaction.
     */
    public record ReverseBillRequest(
            UUID billId,
            ReversalReason reason,
            String customReason
    ) {}

    /**
     * Request to undo last transaction.
     */
    public record UndoLastTransactionRequest(
            UUID customerId,
            ReversalReason reason,
            String customReason
    ) {}

    /**
     * Request to transfer transaction to another customer.
     */
    public record TransferTransactionRequest(
            UUID billId,
            UUID targetCustomerId,
            ReversalReason reason,
            String customReason
    ) {}

    /**
     * Request to edit transaction item.
     */
    public record EditTransactionItemRequest(
            UUID billId,
            UUID itemId,
            BigDecimal newQuantity,
            BigDecimal newPrice,
            ReversalReason reason,
            String customReason
    ) {}

    /**
     * Request to remove item from transaction.
     */
    public record RemoveItemRequest(
            UUID billId,
            UUID itemId,
            ReversalReason reason,
            String customReason
    ) {}

    /**
     * Response for reversal operations.
     */
    public record ReversalResponse(
            boolean success,
            String message,
            UUID transactionId,
            BigDecimal reversedAmount,
            BigDecimal newBalance,
            UUID auditId
    ) {}

    /**
     * Response for transfer operations.
     */
    public record TransferResponse(
            boolean success,
            String message,
            UUID transactionId,
            UUID sourceCustomerId,
            UUID targetCustomerId,
            BigDecimal transferAmount,
            BigDecimal sourceNewBalance,
            BigDecimal targetNewBalance,
            UUID auditId
    ) {}

    /**
     * Timeline event DTO for API response.
     */
    public record TimelineEventDto(
            UUID id,
            TimelineEventType eventType,
            String eventIcon,
            String eventTitle,
            String eventDescription,
            BigDecimal amount,
            BigDecimal balanceAfter,
            String adminUsername,
            boolean isReversal,
            ReversalReason reversalReason,
            UUID relatedTransactionId,
            Instant timestamp
    ) {}

    /**
     * Audit record DTO for API response.
     */
    public record AuditRecordDto(
            UUID id,
            UUID transactionId,
            String transactionType,
            AuditAction action,
            ReversalReason reversalReason,
            String customReason,
            String adminUsername,
            String ipAddress,
            BigDecimal amountAffected,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String oldValue,
            String newValue,
            String notes,
            Instant timestamp
    ) {}

    /**
     * Timeline filter request.
     */
    public record TimelineFilterRequest(
            UUID customerId,
            TimelineEventType eventType,
            Instant startDate,
            Instant endDate,
            int page,
            int size
    ) {}

    /**
     * Reversal statistics DTO.
     */
    public record ReversalStatsDto(
            long totalReversals,
            Map<ReversalReason, Long> reasonCounts,
            BigDecimal totalReversedAmount
    ) {}

    /**
     * Transaction history request.
     */
    public record TransactionHistoryRequest(
            UUID customerId,
            String filterType, // "ALL", "PURCHASES", "PAYMENTS", "EDITS", "REVERSALS"
            Instant startDate,
            Instant endDate,
            int page,
            int size
    ) {}

    /**
     * AI command for transaction management.
     */
    public record TransactionCommandRequest(
            String command,
            UUID customerId,
            UUID transactionId,
            String language
    ) {}

    /**
     * Confirmation request for large transactions.
     */
    public record LargeTransactionConfirmation(
            UUID transactionId,
            BigDecimal amount,
            boolean confirmed,
            String confirmationCode
    ) {}
}

// Result classes for service layer
record TransactionReversalResult(
        boolean success,
        String message,
        UUID transactionId,
        BigDecimal reversedAmount,
        BigDecimal newBalance,
        UUID auditId
) {}

record TransactionTransferResult(
        boolean success,
        String message,
        UUID transactionId,
        UUID sourceCustomerId,
        UUID targetCustomerId,
        BigDecimal transferAmount,
        BigDecimal sourceNewBalance,
        BigDecimal targetNewBalance,
        UUID auditId
) {}

record ReversalStatistics(
        long totalReversals,
        Map<ReversalReason, Long> reasonCounts,
        BigDecimal totalReversedAmount
) {}
