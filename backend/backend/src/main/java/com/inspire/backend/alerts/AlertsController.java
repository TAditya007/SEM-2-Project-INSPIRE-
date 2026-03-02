package com.inspire.backend.alerts;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/alerts")
public class AlertsController {

    private final AlertsService service;

    public AlertsController(AlertsService service) {
        this.service = service;
    }

    @GetMapping
    public List<Alert> getAlerts(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Boolean acknowledged
    ) {
        return service.getAlerts(type, severity, acknowledged);
    }

    @GetMapping("/recent")
    public List<Alert> getRecent(@RequestParam(defaultValue = "5") int limit) {
        return service.getRecentAlerts(limit);
    }

    @PostMapping("/{id}/ack")
    public void acknowledge(@PathVariable String id) {
        service.acknowledgeAlert(id);
    }
}
