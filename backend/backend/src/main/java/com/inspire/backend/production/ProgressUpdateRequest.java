package com.inspire.backend.production;

public class ProgressUpdateRequest {
    private int produced;
    private int passed;
    private int failed;

    public int getProduced() { return produced; }
    public int getPassed() { return passed; }
    public int getFailed() { return failed; }

    public void setProduced(int produced) { this.produced = produced; }
    public void setPassed(int passed) { this.passed = passed; }
    public void setFailed(int failed) { this.failed = failed; }
}
