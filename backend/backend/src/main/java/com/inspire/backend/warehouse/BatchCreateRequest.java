package com.inspire.backend.warehouse;

import java.time.LocalDate;

public class BatchCreateRequest {
    private String productId;
    private String productName;
    private int quantity;
    private String location;
    private LocalDate manufacturedDate;
    private LocalDate expiryDate;

    // Getters & Setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDate getManufacturedDate() { return manufacturedDate; }
    public void setManufacturedDate(LocalDate manufacturedDate) { 
        this.manufacturedDate = manufacturedDate; 
    }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
