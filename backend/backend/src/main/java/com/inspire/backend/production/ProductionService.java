package com.inspire.backend.production;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductionService {

    // Fast lookup by run ID
    private final HashMap<String, ProductionRun> runsById = new HashMap<>();
    
    // Production queue (FIFO)
    private final Queue<ProductionRun> productionQueue = new LinkedList<>();
    
    // Active runs
    private final List<ProductionRun> activeRuns = new ArrayList<>();
    
    // Completed runs (history)
    private final List<ProductionRun> completedRuns = new ArrayList<>();

    // Mock line data
    private final HashMap<String, ProductionLineInfo> linesById = new HashMap<>();

    private int nextRunNum = 1;

    public ProductionService() {
        seedLines();
        seedSampleRuns();
    }

    private void seedLines() {
        linesById.put("LINE-001", new ProductionLineInfo("LINE-001", "Sedan Line", "Sedan",
                Arrays.asList("M-001", "M-002", "M-003", "M-004")));
        linesById.put("LINE-002", new ProductionLineInfo("LINE-002", "SUV Line", "SUV",
                Arrays.asList("M-005", "M-006", "M-007", "M-008")));
    }

    private void seedSampleRuns() {
        // Active run
        ProductionRun run1 = new ProductionRun("RUN-001", "LINE-001", "Sedan Line", "Sedan",
                100, Arrays.asList("M-001", "M-002", "M-003", "M-004"));
        run1.start();
        run1.updateProgress(45, 43, 2);
        runsById.put(run1.getId(), run1);
        activeRuns.add(run1);

        // Completed run
        ProductionRun run2 = new ProductionRun("RUN-002", "LINE-002", "SUV Line", "SUV",
                50, Arrays.asList("M-005", "M-006", "M-007", "M-008"));
        run2.start();
        run2.updateProgress(50, 48, 2);
        run2.complete();
        runsById.put(run2.getId(), run2);
        completedRuns.add(run2);
    }

    public List<ProductionRun> getActiveRuns() {
        return new ArrayList<>(activeRuns);
    }

    public List<ProductionRun> getQueuedRuns() {
        return new ArrayList<>(productionQueue);
    }

    public List<ProductionRun> getCompletedRuns() {
        return completedRuns.stream()
                .sorted((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()))
                .collect(Collectors.toList());
    }

    public ProductionRun getById(String id) {
        return runsById.get(id);
    }

    public ProductionRun startRun(ProductionStartRequest req) {
        ProductionLineInfo line = linesById.get(req.getLineId());
        if (line == null) {
            throw new IllegalArgumentException("Line not found");
        }

        String id = String.format("RUN-%03d", nextRunNum++);
        ProductionRun run = new ProductionRun(id, line.id, line.name, line.product,
                req.getTargetQuantity(), line.machineIds);

        runsById.put(id, run);
        
        // Add to queue if there are already active runs, else start immediately
        if (activeRuns.isEmpty()) {
            run.start();
            activeRuns.add(run);
        } else {
            productionQueue.offer(run);
        }

        return run;
    }

    public ProductionRun updateProgress(String id, ProgressUpdateRequest req) {
        ProductionRun run = runsById.get(id);
        if (run == null || !run.getStatus().equals("IN_PROGRESS")) {
            return null;
        }

        run.updateProgress(req.getProduced(), req.getPassed(), req.getFailed());

        if (run.getStatus().equals("COMPLETED")) {
            activeRuns.remove(run);
            completedRuns.add(run);
            processQueue();
        }

        return run;
    }

    public ProductionRun stopRun(String id) {
        ProductionRun run = runsById.get(id);
        if (run == null) return null;

        if (run.getStatus().equals("QUEUED")) {
            productionQueue.remove(run);
        } else if (run.getStatus().equals("IN_PROGRESS")) {
            activeRuns.remove(run);
            processQueue();
        }

        run.fail();
        completedRuns.add(run);
        return run;
    }

    private void processQueue() {
        // Start next queued run if any
        ProductionRun next = productionQueue.poll();
        if (next != null) {
            next.start();
            activeRuns.add(next);
        }
    }

    public List<ProductionLineInfo> getLines() {
        return new ArrayList<>(linesById.values());
    }

    // Helper class
    public static class ProductionLineInfo {
        public String id;
        public String name;
        public String product;
        public List<String> machineIds;

        public ProductionLineInfo(String id, String name, String product, List<String> machineIds) {
            this.id = id;
            this.name = name;
            this.product = product;
            this.machineIds = machineIds;
        }
    }
}
