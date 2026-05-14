package com.okcredit.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KeepAliveService {
    private static final Logger log = LoggerFactory.getLogger(KeepAliveService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${RENDER_EXTERNAL_URL:https://oweme-rx4r.onrender.com}")
    private String appUrl;

    // Run every 14 minutes (14 * 60 * 1000 = 840,000 ms)
    @Scheduled(fixedRate = 840000)
    public void keepAlive() {
        try {
            log.info("Keep-Alive: Pinging self at {}...", appUrl);
            String response = restTemplate.getForObject(appUrl + "/api/auth/login", String.class);
            log.info("Keep-Alive: Successful! Server will stay awake.");
        } catch (Exception e) {
            log.warn("Keep-Alive: Ping failed, but that's okay (Server might be awake anyway). Error: {}", e.getMessage());
        }
    }
}
