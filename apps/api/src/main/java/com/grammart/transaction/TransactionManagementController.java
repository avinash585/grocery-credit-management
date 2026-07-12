package com.grammart.transaction;

import com.grammart.transaction.TransactionDtos.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST API for Enterprise Transaction Management.
 * 
 * Endpoints:
 * - POST /api/transactions/reverse - Reverse complete transaction
 * - POST /api/transactions/undo-last - Undo last transaction
 * - POST /api/transactions/transfer - Transfer to another customer
 * - POST /api/transactions/items/remove - Remove item from transaction
 * - POST /api/transactions/items/edit - Edit item quantity/price
 * - GET /api/transactions/{id}/audit - Get audit history
 * - GET /api/customers/{id}/timeline - Get customer timeline
 * - GET /api/transactions/reversals/stats - Get reversal statistics
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionManagementController {
    private static final Logger log = LoggerFactory.getLogger(TransactionManagementController.class);

    private final TransactionManagementService transactionService;

    public TransactionManagementController(TransactionManagementService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Reverse a complete bill transaction.
     * POST /api/transactions/reverse
     */
    @PostMapping("/reverse")
    public ResponseEntity<ReversalResponse> reverseBill(
            @RequestBody ReverseBillRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        log.info("Reverse bill request: {}", request.billId());

        String adminUsername = authentication != null ? authentication.getName() : "system";
        String ipAddress = httpRequest.getRemoteAddr();

        TransactionReversalResult result = transactionService.reverseBill(
                request.billId(),
                request.reason(),
                request.customReason(),
                adminUsername,
                ipAddress
        );

        ReversalResponse response = new ReversalResponse(
                result.success(),
                result.message(),
                result.transactionId(),
                result.reversedAmount(),
                result.newBalance(),
                result.auditId()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Undo the last transaction for a customer.
     * POST /api/transactions/undo-last
     */
    @PostMapping("/undo-last")
    public ResponseEntity<ReversalResponse> undoLastTransaction(
            @RequestBody UndoLastTransactionRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        log.info("Undo last transaction for customer: {}", request.customerId());

        String adminUsername = authentication != null ? authentication.getName() : "system";
        String ipAddress = httpRequest.getRemoteAddr();

        TransactionReversalResult result = transactionService.undoLastTransaction(
                request.customerId(),
                request.reason(),
                request.customReason(),
                adminUsername,
                ipAddress
        );

        ReversalResponse response = new ReversalResponse(
                result.success(),
                result.message(),
                result.transactionId(),
                result.reversedAmount(),
                result.newBalance(),
                result.auditId()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Transfer transaction from one customer to another.
     * POST /api/transactions/transfer
     */
    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transferTransaction(
            @RequestBody TransferTransactionRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        log.info("Transfer transaction: {} to customer: {}", request.billId(), request.targetCustomerId());

        String adminUsername = authentication != null ? authentication.getName() : "system";
        String ipAddress = httpRequest.getRemoteAddr();

        TransactionTransferResult result = transactionService.transferTransaction(
                request.billId(),
                request.targetCustomerId(),
                request.reason(),
                request.customReason(),
                adminUsername,
                ipAddress
        );

        TransferResponse response = new TransferResponse(
                result.success(),
                result.message(),
                result.transactionId(),
                result.sourceCustomerId(),
                result.targetCustomerId(),
                result.transferAmount(),
                result.sourceNewBalance(),
                result.targetNewBalance(),
                result.auditId()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit history for a transaction.
     * GET /api/transactions/{id}/audit
     */
    @GetMapping("/{id}/audit")
    public ResponseEntity<List<AuditRecordDto>> getAuditHistory(@PathVariable UUID id) {
        log.info("Get audit history for transaction: {}", id);

        List<TransactionAudit> audits = transactionService.getTransactionAuditHistory(id);

        List<AuditRecordDto> response = audits.stream()
                .map(audit -> new AuditRecordDto(
                        audit.getId(),
                        audit.getTransactionId(),
                        audit.getTransactionType(),
                        audit.getAction(),
                        audit.getReversalReason(),
                        audit.getCustomReason(),
                        audit.getAdminUsername(),
                        audit.getIpAddress(),
                        audit.getAmountAffected(),
                        audit.getBalanceBefore(),
                        audit.getBalanceAfter(),
                        audit.getOldValue(),
                        audit.getNewValue(),
                        audit.getNotes(),
                        audit.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get customer transaction timeline.
     * GET /api/customers/{id}/timeline
     */
    @GetMapping("/customers/{id}/timeline")
    public ResponseEntity<Page<TimelineEventDto>> getCustomerTimeline(
            @PathVariable UUID id,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        log.info("Get timeline for customer: {}", id);

        TimelineEventType typeFilter = eventType != null ? TimelineEventType.valueOf(eventType) : null;
        Instant startInstant = startDate != null ? Instant.ofEpochMilli(startDate) : null;
        Instant endInstant = endDate != null ? Instant.ofEpochMilli(endDate) : null;

        Page<TransactionTimeline> timeline = transactionService.getCustomerTimeline(
                id,
                typeFilter,
                startInstant,
                endInstant,
                PageRequest.of(page, size)
        );

        Page<TimelineEventDto> response = timeline.map(event -> new TimelineEventDto(
                event.getId(),
                event.getEventType(),
                event.getEventIcon(),
                event.getEventTitle(),
                event.getEventDescription(),
                event.getAmount(),
                event.getBalanceAfter(),
                event.getAdminUsername(),
                event.isReversal(),
                event.getReversalReason(),
                event.getRelatedTransactionId(),
                event.getCreatedAt()
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Get reversal statistics.
     * GET /api/transactions/reversals/stats
     */
    @GetMapping("/reversals/stats")
    public ResponseEntity<ReversalStatsDto> getReversalStats(
            @RequestParam String shopId,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate
    ) {
        log.info("Get reversal stats for shop: {}", shopId);

        Instant startInstant = startDate != null ? Instant.ofEpochMilli(startDate) : Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
        Instant endInstant = endDate != null ? Instant.ofEpochMilli(endDate) : Instant.now();

        ReversalStatistics stats = transactionService.getReversalStatistics(UUID.fromString(shopId), startInstant, endInstant);

        ReversalStatsDto response = new ReversalStatsDto(
                stats.totalReversals(),
                stats.reasonCounts(),
                stats.totalReversedAmount()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Check if transaction has been reversed.
     * GET /api/transactions/{id}/is-reversed
     */
    @GetMapping("/{id}/is-reversed")
    public ResponseEntity<Boolean> isTransactionReversed(@PathVariable UUID id) {
        boolean reversed = transactionService.isTransactionReversed(id);
        return ResponseEntity.ok(reversed);
    }
}
