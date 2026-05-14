package com.okcredit.service;

import com.okcredit.entity.Notification;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationSseService {
    private final Map<Long, List<SseEmitter>> userEmitters = new java.util.concurrent.ConcurrentHashMap<>();

    public SseEmitter createEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(e -> removeEmitter(userId, emitter));
        try { emitter.send(SseEmitter.event().name("connected").data("{\"status\":\"connected\"}")); }
        catch (IOException e) { removeEmitter(userId, emitter); }
        return emitter;
    }

    public void sendNotification(Long userId, Notification notification) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters == null) return;
        String json = String.format("{\"id\":%d,\"title\":\"%s\",\"message\":\"%s\",\"type\":\"%s\",\"createdAt\":\"%s\"}", notification.getId(), escape(notification.getTitle()), escape(notification.getMessage() != null ? notification.getMessage() : ""), notification.getType() != null ? notification.getType() : "", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : "");
        for (SseEmitter emitter : emitters) {
            try { emitter.send(SseEmitter.event().name("notification").data(json)); }
            catch (IOException e) { removeEmitter(userId, emitter); }
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) { emitters.remove(emitter); if (emitters.isEmpty()) userEmitters.remove(userId); }
    }

    private String escape(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r"); }
}