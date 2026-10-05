# Organization Management System

## Overview

The Organization Management System models an organizational structure with strict role-based hierarchies:
**CEO → Director → Manager → Lead → Engineer**.

The solution enforces strict TypeScript typing (`noImplicitAny: true`, `noImplicitReturns: true`, `strict: true`), domain modeling with classes, polymorphism, custom error classes, and automated bidirectional relationship management.

---

## Design Architecture & OOP Concepts

The application is architected around foundational OOP principles:

### 1. Abstraction
- The `Employee` abstract class abstracts common employee attributes (`id`, `name`, `dateOfBirth`, `reportsTo`, `reportees`) while defining abstract methods (`getAllowedReportsToDesignation()`, `getAllowedReporteeDesignation()`, `canHaveReportees()`).
- High-level business consumers interact with the `IEmployee` interface and `OrganizationService` without needing to know internal data structures.

### 2. Encapsulation
- All employee state properties (`_id`, `_name`, `_dateOfBirth`, `_reportsTo`, `_reportees`) are `private` or `protected`.
- State mutation is strictly controlled via validated setters (`setName`, `setDateOfBirth`, `setReportsTo`, `addReportee`, `removeReportee`).
- Direct array mutation is prevented by returning immutable `readonly string[]` arrays for reportees.

### 3. Inheritance
- Concrete employee classes (`CEO`, `Director`, `Manager`, `Lead`, `Engineer`) inherit from the base `Employee` class, reusing common identity, validation, and serialization logic.

### 4. Polymorphism
- Each subclass overrides hierarchy behavior:
  - `Engineer` enforces `canHaveReportees() => false` and throws a `ValidationError` on `addReportee()`.
  - `CEO` enforces `reportsTo => null` and rejects any attempt to assign a manager.
  - `Lead`, `Manager`, and `Director` enforce specific subordinate and supervisor designations.

### 5. Factory Method Pattern
- `EmployeeFactory.createEmployee()` encapsulates the instantiation logic, mapping designations to their corresponding subclass model and verifying precondition rules.

---

## Designation Hierarchy & Reporting Rules

| Designation | Allowed `reportsTo` | Allowed `reportees` | Max in Organization | Reportees Allowed? |
| :--- | :--- | :--- | :--- | :--- |
| **CEO** | `null` (Reports to no one) | `Director` | Exactly 1 | Yes |
| **Director** | `CEO` | `Manager` | Unlimited | Yes |
| **Manager** | `Director` | `Lead` | Unlimited | Yes |
| **Lead** | `Manager` | `Engineer` | Unlimited | Yes |
| **Engineer** | `Lead` | *None* | Unlimited | No |

---

## Features & CRUD Operations

### 1. Create (Add Employee)
- Adds a new employee into the organization.
- Validates unique ID, date of birth format, single CEO rule, and strict hierarchy rules.
- **Bidirectional Consistency**: Automatically updates the supervisor's `reportees` array.

### 2. Read (Query Employees)
- `getAllEmployees()`: Returns all employees currently in the organization.
- `getEmployeeById(id)`: Returns a specific employee or throws `EmployeeNotFoundError`.
- `getDirectReportees(id)`: Returns all direct subordinate employee objects.
- `getReportingChain(id)`: Computes the full management chain from the employee up to the CEO.
- `HierarchyService.buildHierarchyTree()`: Builds a hierarchical tree and formats it into an ASCII organizational chart.

### 3. Update (Modify Employee)
- `updateEmployee(id, updateDTO)`:
  - Updates profile information (`name`, `dateOfBirth`, `email`, `department`).
  - Allows supervisor reassignment (`reportsTo`). Automatically removes the employee from the old supervisor's `reportees` and registers them with the new supervisor.
  - Validates all new values and prevents invalid hierarchy assignments.

### 4. Delete (Remove Employee)
- `deleteEmployee(id, options)`:
  - **Leaf Node Deletion**: If an employee has no reportees (e.g. an Engineer), they are removed and unlinked from their supervisor's reportees list.
  - **Supervisor Deletion Guard**: If an employee has active reportees, deletion is **rejected** with `EmployeeHasReporteesError` unless a valid `reassignReporteesTo` supervisor is provided.
  - **Reassignment Handling**: When `reassignReporteesTo` is specified, all subordinates are automatically reassigned to the replacement supervisor of the same designation before deleting the employee.

---

## Validations & Edge Cases

| Scenario / Edge Case | Handled Behavior | Custom Error / Output |
| :--- | :--- | :--- |
| **Duplicate Employee ID** | Rejected immediately | `DuplicateEmployeeIdError` (`DUPLICATE_EMPLOYEE_ID`) |
| **Multiple CEOs** | Attempting to create a second CEO is rejected | `MultipleCeoError` (`MULTIPLE_CEO_FORBIDDEN`) |
| **Invalid Reporting Hierarchy** | E.g. Engineer reporting directly to CEO or Manager | `InvalidHierarchyError` (`INVALID_HIERARCHY`) |
| **CEO Reporting to Someone** | CEO cannot have a `reportsTo` ID | `ValidationError` (`VALIDATION_ERROR`) |
| **Non-Existent Supervisor** | Creating/updating an employee with a missing supervisor | `EmployeeNotFoundError` (`EMPLOYEE_NOT_FOUND`) |
| **Non-Existent Employee Update/Delete** | Querying, updating, or deleting a non-existent ID | `EmployeeNotFoundError` (`EMPLOYEE_NOT_FOUND`) |
| **Deleting Employee with Reportees** | Blocked unless reassignment target is provided | `EmployeeHasReporteesError` (`EMPLOYEE_HAS_REPORTEES`) |
| **Reassigning to Incompatible Role** | Cannot reassign reportees to a different designation | `InvalidHierarchyError` (`INVALID_HIERARCHY`) |
| **Engineer Having Reportees** | Calling `addReportee()` on Engineer throws error | `ValidationError` (`VALIDATION_ERROR`) |
| **Invalid Date Format** | Formats other than `mm/dd/yyyy` are rejected | `ValidationError` (`VALIDATION_ERROR`) |
| **Invalid Calendar Dates** | E.g., `02/30/2020` or `02/29/2023` (non-leap year) | `ValidationError` (`VALIDATION_ERROR`) |
| **Future Date of Birth** | Birth dates in the future are rejected | `ValidationError` (`VALIDATION_ERROR`) |
| **Empty Required Fields** | Empty string or whitespace-only names/IDs are rejected | `ValidationError` (`VALIDATION_ERROR`) |

---

## Project Structure

```
Typescript_assignment/
├── src/
│   ├── types/
│   │   ├── designation.enum.ts         # Designation enum and type guards
│   │   ├── employee.interface.ts       # IEmployee, DTOs, and serialization interfaces
│   │   └── hierarchy.types.ts          # Hierarchy rules and allowed subordinates mappings
│   ├── errors/
│   │   └── organization.error.ts       # Custom domain exception classes
│   ├── utils/
│   │   ├── date.validator.ts           # mm/dd/yyyy calendar & age validation logic
│   │   └── string.validator.ts         # Non-empty and identifier validation
│   ├── models/
│   │   ├── employee.base.ts            # Abstract Employee base class
│   │   ├── ceo.model.ts                # CEO class
│   │   ├── director.model.ts           # Director class
│   │   ├── manager.model.ts            # Manager class
│   │   ├── lead.model.ts               # Lead class
│   │   ├── engineer.model.ts           # Engineer class
│   │   └── employee.factory.ts         # EmployeeFactory (Factory Pattern)
│   ├── services/
│   │   ├── organization.service.ts     # Business logic, state, and CRUD operations
│   │   └── hierarchy.service.ts        # Hierarchy tree builder and ASCII printer
│   └── index.ts                        # Entry point & full demonstration runner
├── tests/
│   ├── validators.test.ts              # Unit tests for DateValidator and StringValidator
│   ├── models.test.ts                  # Unit tests for Employee models and Factory
│   └── organization.service.test.ts    # Comprehensive unit tests for CRUD & edge cases
├── dist/                               # Compiled JavaScript build output
├── jest.config.js                      # Jest test runner configuration
├── tsconfig.json                       # TypeScript compiler options (strict, noImplicitAny)
├── package.json                        # Project metadata and npm scripts
└── README.md                           # Documentation
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: `v18.x` or higher (Tested on `v22.14.0`)
- **npm**: `v9.x` or higher

### Steps

1. Clone or navigate to the repository directory:
   ```bash
   cd Typescript_assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Execution Commands

### 1. Run the Live Demonstration
Executes the comprehensive demonstration script showing mock data, all CRUD operations, ASCII org chart, and all edge case validations:
```bash
npm start
```
*(Alternative alias: `npm run demo`)*

### 2. Run Automated Unit Tests
Executes the complete Jest test suite covering models, validators, service CRUD, and edge cases:
```bash
npm test
```

### 3. Compile TypeScript to JavaScript
Compiles the TypeScript source code into the `dist/` directory with type declarations:
```bash
npm run build
```

### 4. Run the Production Compiled Build
Runs the compiled JavaScript application directly with Node:
```bash
node dist/index.js
```

---

## Test Coverage

The project contains **48 automated unit tests** covering:
- **DateValidator**: Valid `mm/dd/yyyy` dates, leap years, non-leap years, 30-day months, invalid formats, future dates, unrealistic ages.
- **StringValidator**: Whitespace trimming, required field enforcement, ID format validation, email validation.
- **Models & Factory**: Subclass inheritance, polymorphism, encapsulation, getters/setters, engineer reportee prevention, factory instantiation.
- **OrganizationService**:
  - Full CRUD operations (Create, Read, Update, Delete).
  - Single CEO constraint.
  - Strict hierarchy enforcement for all 5 designations.
  - Circular / invalid reporting prevention.
  - Bidirectional reportee tracking.
  - Deletion guards with and without supervisor reassignment.
  - ASCII organization tree rendering.

---

## Design Approach & Assumptions

1. **Strict Hierarchy Rule**:
   - Hierarchy is strictly sequential: `Engineer -> Lead -> Manager -> Director -> CEO`.
   - Skipping levels (e.g. an Engineer reporting directly to a Director or Manager) is disallowed to maintain organizational integrity.
2. **Single CEO Constraint**:
   - An organization has exactly one CEO. Attempting to add a second CEO throws `MultipleCeoError`.
   - The CEO cannot report to anyone (`reportsTo` must be `null`).
3. **Date Format**:
   - `dateOfBirth` strictly requires `mm/dd/yyyy` format (e.g. `08/19/1967`). Real calendar validation (leap year, days per month) is enforced.
4. **Reportee Deletion Strategy**:
   - Deleting a supervisor who has active reportees without providing a replacement is rejected to prevent orphaned employees.
   - Supplying `reassignReporteesTo` will atomically reassign all subordinates to another supervisor of the same designation and update all references.
5. **Bidirectional Relationship Integrity**:
   - Whenever an employee is added, reassigned, or deleted, both their `reportsTo` property and their supervisor's `reportees` array are automatically synchronized.

---

## 📹 Video Demonstration

- **Google Drive Link**: [Screen Recording](https://drive.google.com/file/d/1U-NMlLtLYTzVoSAU7j_198tTAgwnrZRw/view?usp=drive_link)
- **Git Branch Name**: `organization_management_sys`
