package com.inspire.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "OK",
                "service", "INSPIRE backend",
                "timestamp", System.currentTimeMillis()
        );
    }
}
