package com.inspire.backend.production;

import java.time.LocalDateTime;
import java.util.List;

public class ProductionRun {
    private String id;
    private String lineId;
    private String lineName;
    private String product;
    private int targetQuantity;
    private int currentQuantity;
    private String status; // QUEUED, IN_PROGRESS, COMPLETED, FAILED
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<String> machineIds;
    private QualityMetrics qualityMetrics;

    public ProductionRun(String id, String lineId, String lineName, String product,
                         int targetQuantity, List<String> machineIds) {
        this.id = id;
        this.lineId = lineId;
        this.lineName = lineName;
        this.product = product;
        this.targetQuantity = targetQuantity;
        this.currentQuantity = 0;
        this.status = "QUEUED";
        this.machineIds = machineIds;
        this.qualityMetrics = new QualityMetrics();
    }

    public void start() {
        this.status = "IN_PROGRESS";
        this.startedAt = LocalDateTime.now();
    }

    public void updateProgress(int produced, int passed, int failed) {
        this.currentQuantity += produced;
        this.qualityMetrics.addInspection(passed, failed);
        if (this.currentQuantity >= this.targetQuantity) {
            complete();
        }
    }

    public void complete() {
        this.status = "COMPLETED";
        this.completedAt = LocalDateTime.now();
    }

    public void fail() {
        this.status = "FAILED";
        this.completedAt = LocalDateTime.now();
    }

    public double getProgressPercent() {
        if (targetQuantity == 0) return 0;
        return Math.min(100.0, (currentQuantity * 100.0) / targetQuantity);
    }

    // Getters
    public String getId() { return id; }
    public String getLineId() { return lineId; }
    public String getLineName() { return lineName; }
    public String getProduct() { return product; }
    public int getTargetQuantity() { return targetQuantity; }
    public int getCurrentQuantity() { return currentQuantity; }
    public String getStatus() { return status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public List<String> getMachineIds() { return machineIds; }
    public QualityMetrics getQualityMetrics() { return qualityMetrics; }
}
