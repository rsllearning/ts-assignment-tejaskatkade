/**
 * Base custom error class for Organization Management System.
 */
export abstract class OrganizationError extends Error {
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Restore prototype chain in TypeScript transpilation
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when trying to add an employee with an ID that already exists.
 */
export class DuplicateEmployeeIdError extends OrganizationError {
  public readonly errorCode: string = 'DUPLICATE_EMPLOYEE_ID';

  constructor(id: string) {
    super(`Employee with ID '${id}' already exists in the organization.`);
  }
}

/**
 * Thrown when an employee ID cannot be found.
 */
export class EmployeeNotFoundError extends OrganizationError {
  public readonly errorCode: string = 'EMPLOYEE_NOT_FOUND';

  constructor(id: string) {
    super(`Employee with ID '${id}' was not found in the organization.`);
  }
}

/**
 * Thrown when attempting to add more than one CEO to the organization.
 */
export class MultipleCeoError extends OrganizationError {
  public readonly errorCode: string = 'MULTIPLE_CEO_FORBIDDEN';

  constructor(existingCeoId: string) {
    super(
      `Organization already has a CEO (ID: '${existingCeoId}'). Only one CEO is permitted.`
    );
  }
}

/**
 * Thrown when a reporting relationship violates the defined organizational hierarchy.
 */
export class InvalidHierarchyError extends OrganizationError {
  public readonly errorCode: string = 'INVALID_HIERARCHY';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when attempting to delete an employee who currently has active reportees.
 */
export class EmployeeHasReporteesError extends OrganizationError {
  public readonly errorCode: string = 'EMPLOYEE_HAS_REPORTEES';
  public readonly reporteeIds: string[];

  constructor(employeeId: string, reporteeIds: string[]) {
    super(
      `Cannot delete employee '${employeeId}' because they have ${reporteeIds.length} active reportee(s): [${reporteeIds.join(
        ', '
      )}]. Reassign them to another valid supervisor first.`
    );
    this.reporteeIds = reporteeIds;
  }
}

/**
 * Thrown when input validation fails (e.g., empty fields, bad date format, invalid parameters).
 */
export class ValidationError extends OrganizationError {
  public readonly errorCode: string = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}
