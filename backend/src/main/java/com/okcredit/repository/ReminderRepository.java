package com.okcredit.repository;

import com.okcredit.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByCustomerId(Long customerId);

    @Query("SELECT r FROM Reminder r WHERE r.shop.id = :shopId AND r.status = 'PENDING' AND r.scheduledDate <= :date")
    List<Reminder> findPendingReminders(@Param("shopId") Long shopId, @Param("date") LocalDateTime date);
}