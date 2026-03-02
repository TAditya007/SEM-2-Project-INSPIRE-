package com.inspire.backend.staff;

public class MeetingCreateRequest {
    private String title;
    private String notes;

    public String getTitle() { return title; }
    public String getNotes() { return notes; }

    public void setTitle(String title) { this.title = title; }
    public void setNotes(String notes) { this.notes = notes; }
}
