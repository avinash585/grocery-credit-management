package com.grammart.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TransactionTimelineRepository extends JpaRepository<TransactionTimeline, UUID> {
    
    // Get complete timeline for a customer
    @Query("SELECT t FROM TransactionTimeline t WHERE t.customer.id = :customerId ORDER BY t.createdAt DESC")
    Page<TransactionTimeline> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") UUID customerId, Pageable pageable);
    
    // Get timeline filtered by event type
    @Query("SELECT t FROM TransactionTimeline t WHERE t.customer.id = :customerId AND t.eventType = :eventType ORDER BY t.createdAt DESC")
    List<TransactionTimeline> findByCustomerIdAndEventType(@Param("customerId") UUID customerId, @Param("eventType") TimelineEventType eventType);
    
    // Get timeline for specific date
    @Query("SELECT t FROM TransactionTimeline t WHERE t.customer.id = :customerId AND t.createdAt >= :startOfDay AND t.createdAt < :endOfDay ORDER BY t.createdAt DESC")
    List<TransactionTimeline> findByCustomerIdAndDate(@Param("customerId") UUID customerId, @Param("startOfDay") Instant startOfDay, @Param("endOfDay") Instant endOfDay);
    
    // Get all reversals for a customer
    @Query("SELECT t FROM TransactionTimeline t WHERE t.customer.id = :customerId AND t.isReversal = true ORDER BY t.createdAt DESC")
    List<TransactionTimeline> findReversalsByCustomerId(@Param("customerId") UUID customerId);
    
    // Get recent timeline for shop (all customers)
    @Query("SELECT t FROM TransactionTimeline t WHERE t.shop.id = :shopId ORDER BY t.createdAt DESC")
    Page<TransactionTimeline> findRecentActivities(@Param("shopId") String shopId, Pageable pageable);
    
    // Get timeline by transaction ID
    @Query("SELECT t FROM TransactionTimeline t WHERE t.relatedTransactionId = :transactionId ORDER BY t.createdAt DESC")
    List<TransactionTimeline> findByTransactionId(@Param("transactionId") UUID transactionId);
    
    // Count events by type for customer
    @Query("SELECT t.eventType, COUNT(t) FROM TransactionTimeline t WHERE t.customer.id = :customerId GROUP BY t.eventType")
    List<Object[]> countEventsByType(@Param("customerId") UUID customerId);
}
