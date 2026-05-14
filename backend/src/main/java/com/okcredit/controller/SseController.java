package com.okcredit.controller;

import com.okcredit.security.JwtTokenProvider;
import com.okcredit.service.NotificationSseService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
public class SseController {
    private final NotificationSseService notificationSseService;
    private final JwtTokenProvider jwtTokenProvider;
    public SseController(NotificationSseService notificationSseService, JwtTokenProvider jwtTokenProvider) {
        this.notificationSseService = notificationSseService;
        this.jwtTokenProvider = jwtTokenProvider;
    }
    @GetMapping(value = "/notifications", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam String token) {
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            SseEmitter emitter = new SseEmitter(0L);
            try { emitter.send(SseEmitter.event().name("error").data("{\"message\":\"Invalid token\"}")); } catch (Exception e) {}
            emitter.complete(); return emitter;
        }
        return notificationSseService.createEmitter(jwtTokenProvider.getUserIdFromToken(token));
    }
}