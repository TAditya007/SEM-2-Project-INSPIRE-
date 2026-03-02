package com.inspire.backend.production;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/production")
public class ProductionController {

    @Autowired
    private ProductionService service;

    @GetMapping("/runs/active")
    public List<ProductionRun> activeRuns() {
        return service.getActiveRuns();
    }

    @GetMapping("/runs/queued")
    public List<ProductionRun> queuedRuns() {
        return service.getQueuedRuns();
    }

    @GetMapping("/runs/completed")
    public List<ProductionRun> completedRuns() {
        return service.getCompletedRuns();
    }

    @GetMapping("/runs/{id}")
    public ProductionRun getRun(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping("/runs/start")
    public ProductionRun startRun(@RequestBody ProductionStartRequest req) {
        return service.startRun(req);
    }

    @PostMapping("/runs/{id}/progress")
    public ProductionRun updateProgress(@PathVariable String id, @RequestBody ProgressUpdateRequest req) {
        return service.updateProgress(id, req);
    }

    @PostMapping("/runs/{id}/stop")
    public ProductionRun stopRun(@PathVariable String id) {
        return service.stopRun(id);
    }

    @GetMapping("/lines")
    public List<ProductionService.ProductionLineInfo> getLines() {
        return service.getLines();
    }
}
