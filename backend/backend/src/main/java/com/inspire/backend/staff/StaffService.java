package com.inspire.backend.staff;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class StaffService {

    // Fast lookup by ID
    private final HashMap<String, Staff> staffById = new HashMap<>();
    // Ordered collection for listing + sorting
    private final List<Staff> staffOrdered = new ArrayList<>();
    // Meeting history per staff (LinkedList for easy append)
    private final HashMap<String, LinkedList<Meeting>> meetingsByStaff = new HashMap<>();

    private int nextStaffNum = 1;
    private int nextMeetingNum = 1;

    public StaffService() {
        seedSampleStaff();
    }

    private void seedSampleStaff() {
        addInitialStaff("STF-001", "Aarav Mehta", "Line Supervisor", "Body Shop", "ACTIVE", 55000);
        addInitialStaff("STF-002", "Saanvi Reddy", "Quality Engineer", "QC", "ACTIVE", 62000);
        addInitialStaff("STF-003", "Rahul Sharma", "Maintenance Tech", "Maintenance", "ACTIVE", 48000);
        addInitialStaff("STF-004", "Priya Patel", "Production Planner", "Planning", "ACTIVE", 68000);
        addInitialStaff("STF-005", "Karan Singh", "Assembly Operator", "Assembly", "ACTIVE", 42000);

        // Seed a couple of meetings
        scheduleMeeting("STF-002", new MeetingCreateRequest() {{
            setTitle("Quality review – Sedan line");
            setNotes("Discuss defects on weld points and paint finish.");
        }});
        scheduleMeeting("STF-002", new MeetingCreateRequest() {{
            setTitle("Supplier audit prep");
            setNotes("Checklist for upcoming ISO audit.");
        }});
    }

    private void addInitialStaff(String id, String name, String role, String dept, String status, double salary) {
        Staff s = new Staff(id, name, role, dept, status, salary, LocalDateTime.now().minusMonths(6));
        staffById.put(id, s);
        staffOrdered.add(s);
    }

    // Linear search O(n) by name/department/status
    public List<Staff> searchStaff(String query, String department) {
        if ((query == null || query.isBlank()) && (department == null || department.isBlank())) {
            return new ArrayList<>(staffOrdered);
        }

        String q = query == null ? "" : query.toLowerCase();
        String dep = department == null ? "" : department.toLowerCase();

        List<Staff> results = new ArrayList<>();
        for (Staff s : staffOrdered) {
            boolean matches = true;
            if (!q.isBlank()) {
                matches = s.getName().toLowerCase().contains(q)
                        || s.getRole().toLowerCase().contains(q)
                        || s.getStatus().toLowerCase().contains(q)
                        || s.getId().toLowerCase().contains(q);
            }
            if (matches && !dep.isBlank()) {
                matches = s.getDepartment().toLowerCase().contains(dep);
            }
            if (matches) {
                results.add(s);
            }
        }
        return results;
    }

    // QuickSort by salary (descending)
    public void sortBySalaryDesc(List<Staff> list) {
        quickSort(list, 0, list.size() - 1);
    }

    private void quickSort(List<Staff> list, int low, int high) {
        if (low < high) {
            int pi = partition(list, low, high);
            quickSort(list, low, pi - 1);
            quickSort(list, pi + 1, high);
        }
    }

    private int partition(List<Staff> list, int low, int high) {
        double pivot = list.get(high).getSalary();
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (list.get(j).getSalary() >= pivot) {
                i++;
                Collections.swap(list, i, j);
            }
        }
        Collections.swap(list, i + 1, high);
        return i + 1;
    }

    public List<Staff> getStaff(String query, String department, String sortBy) {
        List<Staff> result = searchStaff(query, department);
        if ("salary".equals(sortBy)) {
            sortBySalaryDesc(result);
        } else if ("name".equals(sortBy)) {
            result.sort(Comparator.comparing(Staff::getName));
        }
        return result;
    }

    public Staff getById(String id) {
        return staffById.get(id);
    }

    public Staff addStaff(StaffCreateRequest req) {
        String id = String.format("STF-%03d", nextStaffNum++);
        Staff s = new Staff(
                id,
                req.getName(),
                req.getRole(),
                req.getDepartment(),
                req.getStatus(),
                req.getSalary(),
                LocalDateTime.now()
        );
        staffById.put(id, s);
        staffOrdered.add(s);
        return s;
    }

    public boolean deleteStaff(String id) {
        Staff removed = staffById.remove(id);
        if (removed != null) {
            staffOrdered.removeIf(s -> s.getId().equals(id));
            meetingsByStaff.remove(id);
            return true;
        }
        return false;
    }

    public Staff changeDepartment(String id, DepartmentChangeRequest req) {
        Staff s = staffById.get(id);
        if (s != null && req.getDepartment() != null && !req.getDepartment().isBlank()) {
            s.setDepartment(req.getDepartment());
        }
        return s;
    }

    public Staff hikeSalary(String id, SalaryHikeRequest req) {
        Staff s = staffById.get(id);
        if (s != null) {
            double percent = req.getPercent();
            double factor = 1.0 + (percent / 100.0);
            s.setSalary(Math.round(s.getSalary() * factor));
        }
        return s;
    }

    public Meeting scheduleMeeting(String staffId, MeetingCreateRequest req) {
        Staff s = staffById.get(staffId);
        if (s == null) return null;

        String id = String.format("MTG-%03d", nextMeetingNum++);
        Meeting mtg = new Meeting(id, staffId, req.getTitle(), req.getNotes(), LocalDateTime.now().plusHours(1));

        LinkedList<Meeting> list = meetingsByStaff.computeIfAbsent(staffId, k -> new LinkedList<>());
        list.addFirst(mtg); // newest first
        // keep last 20 only
        if (list.size() > 20) {
            list.removeLast();
        }
        return mtg;
    }

    public List<Meeting> getMeetings(String staffId) {
        LinkedList<Meeting> list = meetingsByStaff.get(staffId);
        if (list == null) return Collections.emptyList();
        return new ArrayList<>(list);
    }
}
