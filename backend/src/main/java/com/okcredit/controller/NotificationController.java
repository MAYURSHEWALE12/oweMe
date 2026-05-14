package com.okcredit.controller;

import com.okcredit.repository.NotificationRepository;
import com.okcredit.security.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notificationRepository;
    private final SecurityUtil securityUtil;
    public NotificationController(NotificationRepository notificationRepository, SecurityUtil securityUtil) {
        this.notificationRepository = notificationRepository;
        this.securityUtil = securityUtil;
    }
    @GetMapping
    public ResponseEntity<List<com.okcredit.entity.Notification>> getNotifications() {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(securityUtil.getCurrentUser().getId()));
    }
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationRepository.countByUserIdAndIsReadFalse(securityUtil.getCurrentUser().getId())));
    }
    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<?> markAllRead() {
        notificationRepository.markAllAsRead(securityUtil.getCurrentUser().getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
}