package com.inspire.backend.production;

public class ProductionStartRequest {
    private String lineId;
    private int targetQuantity;

    public String getLineId() { return lineId; }
    public int getTargetQuantity() { return targetQuantity; }

    public void setLineId(String lineId) { this.lineId = lineId; }
    public void setTargetQuantity(int targetQuantity) { this.targetQuantity = targetQuantity; }
}
