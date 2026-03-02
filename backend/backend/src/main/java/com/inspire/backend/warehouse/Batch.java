package com.inspire.backend.warehouse;

import java.time.LocalDate;

public class Batch {
    private String id;
    private String productId;
    private String productName;
    private int quantity;
    private String location;
    private LocalDate manufacturedDate;
    private LocalDate expiryDate;
    private String status; // AVAILABLE, RESERVED, DISPATCHED, EXPIRED

    public Batch(String id, String productId, String productName, int quantity,
                 String location, LocalDate manufacturedDate, LocalDate expiryDate) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.location = location;
        this.manufacturedDate = manufacturedDate;
        this.expiryDate = expiryDate;
        this.status = "AVAILABLE";
    }

    public boolean isExpired() {
        return expiryDate != null && LocalDate.now().isAfter(expiryDate);
    }

    public boolean isExpiringSoon(int days) {
        return expiryDate != null && 
               LocalDate.now().plusDays(days).isAfter(expiryDate) &&
               !isExpired();
    }

    public int getDaysUntilExpiry() {
        if (expiryDate == null) return Integer.MAX_VALUE;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    // Getters & Setters
    public String getId() { return id; }
    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDate getManufacturedDate() { return manufacturedDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
