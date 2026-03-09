INSPIRE Backend – Smart Factory DSA (Spring Boot Project)
INSPIRE backend is a Java + Spring Boot REST API for an automotive smart factory.
All business logic is implemented using classic Data Structures & Algorithms (DSA) so that each feature doubles as a DSA example: searching, sorting, lists, stacks, queues, priority queues, and hashing.

This backend was developed for the Data Structures & Algorithms (DSA) course to demonstrate mastery of CO1–CO4: algorithm analysis, classical searching and sorting, ADTs (lists/stacks/queues/heaps), and hash‑based structures.

Features
Dashboard summary

Aggregated counts for machines, production runs, and inventory

Today’s completed runs and low‑stock/expiring items

Single endpoint for the frontend overview cards

Management (machines, lines, maintenance)

Machine registry with search and sort options

Linear and binary search by ID/name/status/department

QuickSort and MergeSort for efficiency and name ordering

Production line builder with undo stack

Maintenance queue (FIFO) and urgent maintenance priority queue

Production (runs and queueing)

Production lines with associated machine sequences

Start/queue/stop production runs

Active runs list and completed runs history

Quality metrics with pass‑rate calculations

Queue‑based scheduling of runs (only one active at a time)

Alerts (derived monitoring)

Alerts generated from machines, production, and warehouse

Filters for type, severity, and acknowledgement

Recent alerts endpoint for dashboard preview

Acknowledgement state stored in a concurrent hash map

Staff (employees and meetings)

Staff directory with search/filter and sorting

Salary‑based QuickSort and name sorting

Department change and salary hike operations

Per‑staff meeting history kept as a bounded linked list

Warehouse (batches and inventory)

Batches indexed by product, location, and expiry date

Add/move/update/delete batch operations

Inventory summary per product with low‑stock detection

Expiring/expired batches using a date‑ordered tree map

Tech Stack
Java (JDK 17+)

Core collections (ArrayList, LinkedList, HashMap, TreeMap, PriorityQueue, Stack)
​

Classic algorithm implementations in plain Java methods

Spring Boot

REST controllers with @RestController, @RequestMapping, @GetMapping, @PostMapping, etc.

Dependency injection via constructors / @Autowired

CORS configuration to allow http://127.0.0.1:5500 (frontend origin)
​

In‑memory storage

No database; all data lives in memory to make the DSA structures and complexity explicit

The backend listens on http://localhost:8080/api/... and is consumed by the INSPIRE frontend.

Course Outcomes Mapping (DSA CO1–CO4)
CO1 – Algorithm Analysis (Big‑O, running time, recurrences)

Linear scans over lists: searching machines, staff, batches, alerts

Binary search over sorted machines by ID

Hash map O(1) lookups for machines, runs, staff, batches, inventory

Tree map O(log n) range queries for expiry dates

QuickSort and MergeSort implementations with recursive structure

CO2 – Classical Searching and Sorting Algorithms in Java

Searching

Linear search on multiple fields in ManagementService and StaffService

Binary search by machine ID in ManagementService

Sorting

QuickSort by machine efficiency in ManagementService

MergeSort by machine name in ManagementService

QuickSort by salary in StaffService

Comparator‑based sorting for completed runs and expiry dates

CO3 – Abstract Data Types (Lists, Stacks, Queues, Deques)

Lists

ArrayList for ordered collections of machines, runs, staff, lines

LinkedList for production line machine sequence and meeting history

Stacks

Stack<ProductionLine> for undoing the last created line

Queues

Queue<MaintenanceTicket> (linked list) for FIFO maintenance jobs

Queue<ProductionRun> for queued production runs

Deque / Bounded List

LinkedList<Meeting> with addFirst/removeLast to keep only the latest 20 meetings

CO4 – Priority Queues and Hash‑Based Structures

Priority Queue / Heap

PriorityQueue<MaintenanceTicket> to always process highest‑priority maintenance first

Hashing

HashMap for:

machinesById

runsById

linesById

staffById

batchesById

batchesByProduct

batchesByLocation

inventoryByProduct

ConcurrentHashMap for acknowledged alerts

Ordered Maps

TreeMap<LocalDate, List<Batch>> to index batches by expiry date and support range queries

Module‑wise DSA Overview
Dashboard (com.inspire.backend.dashboard)
Classes: DashboardController, DashboardService, DashboardSummary

Aggregates values from other services:

Total/running/idle/maintenance machines

Active/queued/completed‑today runs

Total products, available stock, low‑stock items, expiring batches

Uses simple linear scans and streams; ideal for demonstrating total time complexity when combining operations from multiple modules.

Management (com.inspire.backend.management)
Classes: ManagementController, ManagementService, Machine, MachineCreateRequest, MaintenanceTicket, ProductionLine, ProductionLineCreateRequest

Key DSA patterns:

HashMap<String, Machine> machinesById for O(1) machine lookup

List<Machine> machinesOrdered for search and sort

Queue<MaintenanceTicket> maintenanceQueue for FIFO processing

PriorityQueue<MaintenanceTicket> urgentQueue for heap‑based priority

Stack<ProductionLine> lineHistory for undo operations

LinkedList<String> machineSequence inside ProductionLine for ordered workflow

Algorithms:

searchMachinesLinear(String query) – linear search over multiple fields

binarySearchById(String id) – binary search on a sorted copy of machines

quickSortByEfficiency(List<Machine>, int, int) – in‑place QuickSort

mergeSortByName(List<Machine>, int, int) and merge(...) – MergeSort by name

CRUD methods for machines and lines update both hash maps and lists

Production (com.inspire.backend.production)
Classes: ProductionController, ProductionService, ProductionRun, ProductionStartRequest, ProgressUpdateRequest, QualityMetrics

Key DSA patterns:

HashMap<String, ProductionRun> runsById for O(1) run lookup

Queue<ProductionRun> productionQueue for queued runs

List<ProductionRun> activeRuns, completedRuns for current and history

HashMap<String, ProductionLineInfo> linesById for line details

Logic & Algorithms:

startRun(...) – enqueues or starts immediately based on activeRuns

updateProgress(...) – updates progress and triggers completion + queue processing

processQueue() – polls from queue and starts next run

getCompletedRuns() – returns runs sorted by completedAt descending

QualityMetrics maintains total inspected, passed, failed, and computes pass rate

Alerts (com.inspire.backend.alerts)
Classes: AlertsController, AlertsService, Alert

Key DSA patterns:

ConcurrentHashMap<String, Boolean> acknowledgedById for O(1) acknowledge state

Use of lists from ManagementService, ProductionService, WarehouseService for derived alerts

Algorithms:

Linear scans to:

Generate machine alerts (maintenance/not running)

Generate production alerts (low pass rate, failed runs)

Generate warehouse alerts (low stock, expiring batches)

Sorting of all alerts by createdAt (newest first)

Stream filters by type, severity, and acknowledgement flag

Staff (com.inspire.backend.staff)
Classes: StaffController, StaffService, Staff, StaffCreateRequest, DepartmentChangeRequest, SalaryHikeRequest, Meeting, MeetingCreateRequest

Key DSA patterns:

HashMap<String, Staff> staffById for fast staff lookup

List<Staff> staffOrdered for search and sort operations

HashMap<String, LinkedList<Meeting>> meetingsByStaff for meeting histories

Algorithms:

searchStaff(String query, String department) – linear search by name, role, status, id, and department

sortBySalaryDesc(List<Staff>) – QuickSort wrapper for salary‑based order

Name sorting with Comparator.comparing(Staff::getName)

Bounded meeting history:

addFirst for newest meeting

removeLast when more than 20 entries exist

Warehouse (com.inspire.backend.warehouse)
Classes: WarehouseController, WarehouseService, Batch, BatchCreateRequest, BatchMoveRequest, InventoryItem

Key DSA patterns:

HashMap<String, Batch> batchesById – batch ID index

HashMap<String, LinkedList<Batch>> batchesByProduct – chains per product

HashMap<String, LinkedList<Batch>> batchesByLocation – chains per location

HashMap<String, InventoryItem> inventoryByProduct – product‑level summary

TreeMap<LocalDate, List<Batch>> batchesByExpiry – expiry‑ordered index

Algorithms:

addBatch(...) – inserts into all indices and updates inventory in O(1) average time

getExpiringBatches(int days) – TreeMap headMap for date range + filter + sort by expiry

getExpiredBatches() – stream filter + sort by expiry

moveBatch(...), updateBatchQuantity(...), deleteBatch(...) – maintain hash structures and inventory totals

getLowStockItems() – filters InventoryItem using isLowStock()

searchBatches(...) – multi‑field linear search over batch ID, product name, location, and status



Project Structure (Backend)
text
backend/
├─ src/
│  └─ main/
│     └─ java/
│        └─ com/inspire/backend/
│           ├─ dashboard/
│           │  ├─ DashboardController.java
│           │  └─ DashboardService.java
│           ├─ management/
│           │  ├─ ManagementController.java
│           │  ├─ ManagementService.java
│           │  ├─ Machine.java
│           │  ├─ MaintenanceTicket.java
│           │  ├─ ProductionLine.java
│           │  └─ DTO classes...
│           ├─ production/
│           │  ├─ ProductionController.java
│           │  ├─ ProductionService.java
│           │  ├─ ProductionRun.java
│           │  └─ QualityMetrics and DTOs...
│           ├─ alerts/
│           │  ├─ AlertsController.java
│           │  └─ AlertsService.java
│           ├─ staff/
│           │  ├─ StaffController.java
│           │  ├─ StaffService.java
│           │  ├─ Staff.java
│           │  ├─ Meeting.java
│           │  └─ DTO classes...
│           └─ warehouse/
│              ├─ WarehouseController.java
│              ├─ WarehouseService.java
│              ├─ Batch.java
│              ├─ InventoryItem.java
│              └─ Batch DTO classes...
└─ README.md


How to Run (Backend)
Open the backend/ folder in your IDE (IntelliJ/Eclipse).

Build and run the Spring Boot application (main @SpringBootApplication class).

The server starts at http://localhost:8080.

Example endpoints to test:

GET /api/dashboard/summary

GET /api/management/machines?sort=efficiency

GET /api/production/runs/active

GET /api/warehouse/inventory

GET /api/staff?q=engineer

GET /api/alerts?severity=CRITICAL