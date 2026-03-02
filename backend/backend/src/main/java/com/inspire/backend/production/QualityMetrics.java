package com.inspire.backend.production;

public class QualityMetrics {
    private int totalInspected;
    private int passed;
    private int failed;

    public QualityMetrics() {
        this.totalInspected = 0;
        this.passed = 0;
        this.failed = 0;
    }

    public void addInspection(int passCount, int failCount) {
        this.passed += passCount;
        this.failed += failCount;
        this.totalInspected += (passCount + failCount);
    }

    public double getPassRate() {
        if (totalInspected == 0) return 100.0;
        return (passed * 100.0) / totalInspected;
    }

    public int getTotalInspected() { return totalInspected; }
    public int getPassed() { return passed; }
    public int getFailed() { return failed; }
}

