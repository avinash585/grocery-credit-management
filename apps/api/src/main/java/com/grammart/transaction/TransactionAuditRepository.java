package com.grammart.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TransactionAuditRepository extends JpaRepository<TransactionAudit, UUID> {
    
    // Find all audits for a specific transaction
    @Query("SELECT a FROM TransactionAudit a WHERE a.transactionId = :transactionId ORDER BY a.createdAt DESC")
    List<TransactionAudit> findByTransactionIdOrderByCreatedAtDesc(@Param("transactionId") UUID transactionId);
    
    // Find all audits for a customer
    @Query("SELECT a FROM TransactionAudit a WHERE a.customer.id = :customerId ORDER BY a.createdAt DESC")
    Page<TransactionAudit> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") UUID customerId, Pageable pageable);
    
    // Find audits by action type
    @Query("SELECT a FROM TransactionAudit a WHERE a.shop.id = :shopId AND a.action = :action ORDER BY a.createdAt DESC")
    List<TransactionAudit> findByShopIdAndAction(@Param("shopId") String shopId, @Param("action") AuditAction action);
    
    // Find recent reversals
    @Query("SELECT a FROM TransactionAudit a WHERE a.shop.id = :shopId AND a.reversalReason IS NOT NULL ORDER BY a.createdAt DESC")
    Page<TransactionAudit> findRecentReversals(@Param("shopId") String shopId, Pageable pageable);
    
    // Find audits by admin
    @Query("SELECT a FROM TransactionAudit a WHERE a.shop.id = :shopId AND a.adminUsername = :adminUsername ORDER BY a.createdAt DESC")
    Page<TransactionAudit> findByAdmin(@Param("shopId") String shopId, @Param("adminUsername") String adminUsername, Pageable pageable);
    
    // Find audits in date range
    @Query("SELECT a FROM TransactionAudit a WHERE a.shop.id = :shopId AND a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<TransactionAudit> findByDateRange(@Param("shopId") String shopId, @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    // Check if transaction has been reversed
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM TransactionAudit a WHERE a.transactionId = :transactionId AND a.action IN ('BILL_REVERSED', 'PAYMENT_REVERSED')")
    boolean isTransactionReversed(@Param("transactionId") UUID transactionId);
}
