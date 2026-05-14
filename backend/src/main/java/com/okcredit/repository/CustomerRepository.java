package com.okcredit.repository;

import com.okcredit.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findByShopIdAndActiveTrue(Long shopId, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.shop.id = :shopId AND c.active = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "c.phone LIKE CONCAT('%', :search, '%'))")
    Page<Customer> searchCustomers(@Param("shopId") Long shopId, @Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.shop.id = :shopId AND c.runningBalance > 0 AND c.active = true")
    List<Customer> findCustomersWithOutstandingBalance(@Param("shopId") Long shopId);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.shop.id = :shopId AND c.active = true")
    Long countActiveCustomers(@Param("shopId") Long shopId);

    @Query("SELECT COALESCE(SUM(c.runningBalance), 0) FROM Customer c WHERE c.shop.id = :shopId AND c.active = true")
    BigDecimal getTotalReceivable(@Param("shopId") Long shopId);

    Optional<Customer> findByIdAndShopId(Long id, Long shopId);

    List<Customer> findByPhone(String phone);

    Optional<Customer> findByEmail(String email);

    List<Customer> findByUserId(Long userId);
}