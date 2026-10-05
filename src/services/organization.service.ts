import { Designation } from '../types/designation.enum';
import {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  IEmployeeDetails,
} from '../types/employee.interface';
import { Employee } from '../models/employee.base';
import { CEO } from '../models/ceo.model';
import { EmployeeFactory } from '../models/employee.factory';
import {
  DuplicateEmployeeIdError,
  EmployeeNotFoundError,
  MultipleCeoError,
  InvalidHierarchyError,
  EmployeeHasReporteesError,
  ValidationError,
} from '../errors/organization.error';
import { StringValidator } from '../utils/string.validator';

/**
 * Service responsible for managing organizational state and employee lifecycle.
 * Enforces business constraints, hierarchy validation, and data integrity.
 */
export class OrganizationService {
  private readonly employees: Map<string, Employee> = new Map();
  private ceoId: string | null = null;

  /**
   * Retrieves total count of employees in the organization.
   */
  public getEmployeeCount(): number {
    return this.employees.size;
  }

  /**
   * Checks if an employee with the given ID exists.
   */
  public hasEmployee(id: string): boolean {
    return this.employees.has(id.trim());
  }

  /**
   * Retrieves the current CEO or null if no CEO has been appointed.
   */
  public getCEO(): CEO | null {
    if (!this.ceoId) {
      return null;
    }
    const ceo = this.employees.get(this.ceoId);
    return ceo instanceof CEO ? ceo : null;
  }

  // ==========================================
  // CRUD Operation: CREATE
  // ==========================================

  /**
   * Adds a new employee into the organization.
   * Performs uniqueness checks, CEO singleton validation, and hierarchy compliance.
   */
  public addEmployee(dto: CreateEmployeeDTO): Employee {
    if (!dto) {
      throw new ValidationError('Employee data must be provided.');
    }

    const id = StringValidator.validateEmployeeId(dto.id);

    // 1. Employee IDs must be unique
    if (this.employees.has(id)) {
      throw new DuplicateEmployeeIdError(id);
    }

    // 2. Only one CEO should exist in the organization
    if (dto.designation === Designation.CEO) {
      if (this.ceoId !== null) {
        throw new MultipleCeoError(this.ceoId);
      }
      if (dto.reportsTo) {
        throw new ValidationError(`CEO reports to no one. 'reportsTo' must be null or omitted.`);
      }
    } else {
      // Non-CEO employees must specify reportsTo
      if (!dto.reportsTo) {
        throw new ValidationError(
          `${dto.designation} must report to an existing supervisor. 'reportsTo' is required.`
        );
      }
    }

    // 3. reportsTo should follow the defined reporting hierarchy
    let supervisor: Employee | undefined;
    if (dto.reportsTo) {
      const supervisorId = StringValidator.validateEmployeeId(dto.reportsTo);
      supervisor = this.employees.get(supervisorId);

      if (!supervisor) {
        throw new EmployeeNotFoundError(supervisorId);
      }

      // Check if candidate reportsTo matches the required hierarchy designation
      const expectedSupervisorDesignation = this.getExpectedSupervisorDesignation(dto.designation);
      if (supervisor.designation !== expectedSupervisorDesignation) {
        throw new InvalidHierarchyError(
          `Invalid reporting hierarchy: A ${dto.designation} must report to a ${expectedSupervisorDesignation}. Employee '${supervisor.name}' (ID: ${supervisor.id}) is a ${supervisor.designation}.`
        );
      }

      // Verify supervisor can accept reportees of this designation
      if (!supervisor.canHaveReportees()) {
        throw new InvalidHierarchyError(
          `Supervisor '${supervisor.name}' (ID: ${supervisor.id}) with designation ${supervisor.designation} cannot manage reportees.`
        );
      }

      const allowedSubordinate = supervisor.getAllowedReporteeDesignation();
      if (allowedSubordinate !== dto.designation) {
        throw new InvalidHierarchyError(
          `Supervisor of designation ${supervisor.designation} can only manage ${allowedSubordinate}s, but attempted to assign a ${dto.designation}.`
        );
      }
    }

    // 4. Instantiate employee model using OOP Factory
    const employee = EmployeeFactory.createEmployee({
      ...dto,
      id,
    });

    // 5. Update supervisor's reportees list (bidirectional consistency)
    if (supervisor) {
      supervisor.addReportee(employee.id);
    }

    // 6. Record in organization store
    this.employees.set(employee.id, employee);
    if (employee.designation === Designation.CEO) {
      this.ceoId = employee.id;
    }

    return employee;
  }

  // ==========================================
  // CRUD Operation: READ
  // ==========================================

  /**
   * Retrieves all employees in the organization.
   */
  public getAllEmployees(): Employee[] {
    return Array.from(this.employees.values());
  }

  /**
   * Retrieves all employees as serializable JSON DTOs.
   */
  public getAllEmployeesDetails(): IEmployeeDetails[] {
    return this.getAllEmployees().map((emp) => emp.toJSON());
  }

  /**
   * Retrieves a specific employee by ID.
   * Throws EmployeeNotFoundError if employee does not exist.
   */
  public getEmployeeById(id: string): Employee {
    const trimmedId = StringValidator.validateEmployeeId(id);
    const employee = this.employees.get(trimmedId);
    if (!employee) {
      throw new EmployeeNotFoundError(trimmedId);
    }
    return employee;
  }

  /**
   * Retrieves direct reportees of a specific employee.
   */
  public getDirectReportees(id: string): Employee[] {
    const supervisor = this.getEmployeeById(id);
    return supervisor.reportees.map((reporteeId) => this.getEmployeeById(reporteeId));
  }

  /**
   * Retrieves employees filtered by designation.
   */
  public getEmployeesByDesignation(designation: Designation): Employee[] {
    return this.getAllEmployees().filter((emp) => emp.designation === designation);
  }

  /**
   * Retrieves the full management reporting chain starting from the given employee up to the CEO.
   */
  public getReportingChain(id: string): Employee[] {
    const chain: Employee[] = [];
    let current: Employee | null = this.getEmployeeById(id);

    while (current && current.reportsTo) {
      const supervisor = this.employees.get(current.reportsTo);
      if (supervisor) {
        chain.push(supervisor);
        current = supervisor;
      } else {
        break;
      }
    }

    return chain;
  }

  // ==========================================
  // CRUD Operation: UPDATE
  // ==========================================

  /**
   * Updates an existing employee given their ID.
   * Supports updating name, dateOfBirth, email, department, and reportsTo.
   */
  public updateEmployee(id: string, dto: UpdateEmployeeDTO): Employee {
    const employee = this.getEmployeeById(id);

    if (!dto || Object.keys(dto).length === 0) {
      throw new ValidationError('No update values provided.');
    }

    // Update basic fields if provided
    if (dto.name !== undefined) {
      employee.setName(dto.name);
    }
    if (dto.dateOfBirth !== undefined) {
      employee.setDateOfBirth(dto.dateOfBirth);
    }
    if (dto.email !== undefined) {
      employee.setEmail(dto.email);
    }
    if (dto.department !== undefined) {
      employee.setDepartment(dto.department);
    }

    // If designation change is attempted
    if (dto.designation !== undefined && dto.designation !== employee.designation) {
      return this.handleDesignationChange(employee, dto);
    }

    // Update reportsTo if specified
    if (dto.reportsTo !== undefined && dto.reportsTo !== employee.reportsTo) {
      this.reassignEmployeeSupervisor(employee, dto.reportsTo);
    }

    return employee;
  }

  // ==========================================
  // CRUD Operation: DELETE
  // ==========================================

  /**
   * Deletes an employee given their ID.
   * Handles reportees appropriately:
   * - If employee has active reportees and no reassignReporteesTo is provided, deletion is rejected.
   * - If reassignReporteesTo is provided, reportees are safely reassigned to the replacement supervisor.
   */
  public deleteEmployee(
    id: string,
    options?: { reassignReporteesTo?: string }
  ): void {
    const employee = this.getEmployeeById(id);

    // Check if the employee has active reportees
    if (employee.reportees.length > 0) {
      if (!options?.reassignReporteesTo) {
        throw new EmployeeHasReporteesError(employee.id, [...employee.reportees]);
      }

      const replacementSupervisorId = StringValidator.validateEmployeeId(
        options.reassignReporteesTo
      );

      if (replacementSupervisorId === employee.id) {
        throw new ValidationError('Cannot reassign reportees to the employee being deleted.');
      }

      const replacementSupervisor = this.getEmployeeById(replacementSupervisorId);

      // Replacement supervisor must be of the same designation to preserve hierarchy rules
      if (replacementSupervisor.designation !== employee.designation) {
        throw new InvalidHierarchyError(
          `Cannot reassign reportees of ${employee.designation} '${employee.name}' to '${replacementSupervisor.name}' because they are a ${replacementSupervisor.designation}. Replacement must be of designation ${employee.designation}.`
        );
      }

      // Reassign each subordinate to the new supervisor
      for (const subordinateId of employee.reportees) {
        const subordinate = this.getEmployeeById(subordinateId);
        subordinate.setReportsTo(replacementSupervisor.id);
        replacementSupervisor.addReportee(subordinate.id);
      }

      employee.clearReportees();
    }

    // Remove employee from current supervisor's reportees list
    if (employee.reportsTo) {
      const supervisor = this.employees.get(employee.reportsTo);
      if (supervisor) {
        supervisor.removeReportee(employee.id);
      }
    }

    // If deleting CEO, reset ceoId
    if (employee.designation === Designation.CEO) {
      this.ceoId = null;
    }

    // Remove from organization map
    this.employees.delete(employee.id);
  }

  /**
   * Clears all employees from the organization (useful for clean slate testing).
   */
  public clear(): void {
    this.employees.clear();
    this.ceoId = null;
  }

  // ==========================================
  // Internal Helpers
  // ==========================================

  /**
   * Returns the expected supervisor designation for a given role based on the hierarchy.
   */
  public getExpectedSupervisorDesignation(designation: Designation): Designation | null {
    switch (designation) {
      case Designation.CEO:
        return null;
      case Designation.Director:
        return Designation.CEO;
      case Designation.Manager:
        return Designation.Director;
      case Designation.Lead:
        return Designation.Manager;
      case Designation.Engineer:
        return Designation.Lead;
    }
  }

  /**
   * Reassigns an employee's supervisor with full validation.
   */
  private reassignEmployeeSupervisor(
    employee: Employee,
    newReportsTo: string | null
  ): void {
    if (employee.designation === Designation.CEO) {
      if (newReportsTo !== null && newReportsTo !== '') {
        throw new ValidationError(`CEO cannot report to anyone. 'reportsTo' must remain null.`);
      }
      return;
    }

    if (!newReportsTo) {
      throw new ValidationError(
        `${employee.designation} must report to an existing supervisor. 'reportsTo' cannot be null.`
      );
    }

    const newSupervisorId = StringValidator.validateEmployeeId(newReportsTo);
    if (newSupervisorId === employee.id) {
      throw new ValidationError(`Employee '${employee.id}' cannot report to themselves.`);
    }

    const newSupervisor = this.getEmployeeById(newSupervisorId);
    const expectedDesignation = this.getExpectedSupervisorDesignation(employee.designation);

    if (newSupervisor.designation !== expectedDesignation) {
      throw new InvalidHierarchyError(
        `Invalid reporting hierarchy: A ${employee.designation} must report to a ${expectedDesignation}. '${newSupervisor.name}' is a ${newSupervisor.designation}.`
      );
    }

    // Remove from old supervisor
    if (employee.reportsTo) {
      const oldSupervisor = this.employees.get(employee.reportsTo);
      if (oldSupervisor) {
        oldSupervisor.removeReportee(employee.id);
      }
    }

    // Attach to new supervisor
    newSupervisor.addReportee(employee.id);
    employee.setReportsTo(newSupervisor.id);
  }

  /**
   * Handles role promotion or transfer with validation.
   */
  private handleDesignationChange(
    employee: Employee,
    dto: UpdateEmployeeDTO
  ): Employee {
    const targetDesignation = dto.designation!;

    // If promoting to CEO, check singleton
    if (targetDesignation === Designation.CEO) {
      if (this.ceoId !== null && this.ceoId !== employee.id) {
        throw new MultipleCeoError(this.ceoId);
      }
    }

    // If changing designation and employee currently has reportees, verify compatibility
    const oldReportees = [...employee.reportees];
    if (oldReportees.length > 0) {
      throw new ValidationError(
        `Cannot change designation of '${employee.id}' while they still have active reportees: [${oldReportees.join(
          ', '
        )}]. Reassign their reportees first.`
      );
    }

    // Remove from old supervisor
    if (employee.reportsTo) {
      const oldSupervisor = this.employees.get(employee.reportsTo);
      if (oldSupervisor) {
        oldSupervisor.removeReportee(employee.id);
      }
    }

    // Recreate employee with new designation
    const updatedEmployee = EmployeeFactory.createEmployee({
      id: employee.id,
      name: dto.name ?? employee.name,
      dateOfBirth: dto.dateOfBirth ?? employee.dateOfBirth,
      designation: targetDesignation,
      reportsTo: targetDesignation === Designation.CEO ? null : (dto.reportsTo ?? employee.reportsTo),
      email: dto.email ?? employee.email,
      department: dto.department ?? employee.department,
    });

    // If not CEO, validate and link new supervisor
    if (updatedEmployee.reportsTo) {
      const newSupervisor = this.getEmployeeById(updatedEmployee.reportsTo);
      const expectedSupervisorDesignation = this.getExpectedSupervisorDesignation(targetDesignation);

      if (newSupervisor.designation !== expectedSupervisorDesignation) {
        throw new InvalidHierarchyError(
          `Invalid reporting hierarchy: A ${targetDesignation} must report to a ${expectedSupervisorDesignation}. '${newSupervisor.name}' is a ${newSupervisor.designation}.`
        );
      }

      newSupervisor.addReportee(updatedEmployee.id);
    }

    if (employee.designation === Designation.CEO && targetDesignation !== Designation.CEO) {
      this.ceoId = null;
    }
    if (targetDesignation === Designation.CEO) {
      this.ceoId = updatedEmployee.id;
    }

    this.employees.set(updatedEmployee.id, updatedEmployee);
    return updatedEmployee;
  }
}
