package com.inspire.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // Scans com.inspire.backend.* automatically
public class InspireBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(InspireBackendApplication.class, args);
    }
}
