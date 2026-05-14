package com.okcredit.repository;

import com.okcredit.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    List<Transaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.shop.id = :shopId AND t.type = 'CREDIT_GIVEN' " +
           "AND t.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCreditGiven(@Param("shopId") Long shopId, @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.shop.id = :shopId AND t.type = 'PAYMENT_RECEIVED' " +
           "AND t.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalPaymentReceived(@Param("shopId") Long shopId, @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.shop.id = :shopId AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transaction> getTransactionsByDateRange(@Param("shopId") Long shopId, @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.shop.id = :shopId ORDER BY t.createdAt DESC")
    Page<Transaction> findRecentTransactions(@Param("shopId") Long shopId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.shop.id = :shopId AND t.type = 'CREDIT_GIVEN'")
    BigDecimal getTotalCreditGivenAllTime(@Param("shopId") Long shopId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.shop.id = :shopId AND t.type = 'PAYMENT_RECEIVED'")
    BigDecimal getTotalPaymentReceivedAllTime(@Param("shopId") Long shopId);
}