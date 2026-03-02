package com.inspire.backend.staff;

import java.time.LocalDateTime;

public class Meeting {
    private String id;
    private String staffId;
    private String title;
    private String notes;
    private LocalDateTime scheduledAt;

    public Meeting(String id, String staffId, String title, String notes, LocalDateTime scheduledAt) {
        this.id = id;
        this.staffId = staffId;
        this.title = title;
        this.notes = notes;
        this.scheduledAt = scheduledAt;
    }

    public String getId() { return id; }
    public String getStaffId() { return staffId; }
    public String getTitle() { return title; }
    public String getNotes() { return notes; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
}
