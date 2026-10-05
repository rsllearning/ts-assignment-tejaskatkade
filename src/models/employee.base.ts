import { Designation } from '../types/designation.enum';
import { IEmployee, IEmployeeDetails } from '../types/employee.interface';
import { DateValidator } from '../utils/date.validator';
import { StringValidator } from '../utils/string.validator';
import { ValidationError } from '../errors/organization.error';

/**
 * Abstract Base Employee Class
 * Demonstrates:
 * - Abstraction: Exposes high-level contracts while hiding internal representation
 * - Encapsulation: Private members with controlled mutators and accessors
 * - Polymorphism: Subclasses implement their own hierarchy rules and validation
 */
export abstract class Employee implements IEmployee {
  private readonly _id: string;
  private _name: string;
  private _dateOfBirth: string;
  private _reportsTo: string | null;
  protected _reportees: Set<string>;
  private _email?: string;
  private _department?: string;

  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    reportsTo: string | null = null,
    email?: string,
    department?: string
  ) {
    this._id = StringValidator.validateEmployeeId(id);
    this._name = StringValidator.validateNonEmptyString(name, 'name');
    DateValidator.validateDateOfBirth(dateOfBirth);
    this._dateOfBirth = dateOfBirth.trim();
    this._reportsTo = reportsTo ? StringValidator.validateEmployeeId(reportsTo) : null;
    this._reportees = new Set<string>();

    if (email !== undefined) {
      StringValidator.validateEmail(email);
      this._email = email.trim();
    }
    if (department !== undefined) {
      this._department = StringValidator.validateNonEmptyString(department, 'department');
    }
  }

  // --- Abstract Methods to be implemented by concrete classes (Polymorphism) ---

  public abstract readonly designation: Designation;

  /**
   * The designation that this employee role is strictly permitted to report to.
   * Returns null if this role reports to no one (e.g., CEO).
   */
  public abstract getAllowedReportsToDesignation(): Designation | null;

  /**
   * The designation of employees who are permitted to report directly to this role.
   * Returns null if this role cannot manage any reportees (e.g., Engineer).
   */
  public abstract getAllowedReporteeDesignation(): Designation | null;

  /**
   * Whether this role is allowed to have direct reportees.
   */
  public abstract canHaveReportees(): boolean;

  // --- Encapsulated Getters ---

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get dateOfBirth(): string {
    return this._dateOfBirth;
  }

  public get reportsTo(): string | null {
    return this._reportsTo;
  }

  public get reportees(): readonly string[] {
    return Array.from(this._reportees);
  }

  public get email(): string | undefined {
    return this._email;
  }

  public get department(): string | undefined {
    return this._department;
  }

  // --- Controlled Mutators (Encapsulation) ---

  public setName(name: string): void {
    this._name = StringValidator.validateNonEmptyString(name, 'name');
  }

  public setDateOfBirth(dateOfBirth: string): void {
    DateValidator.validateDateOfBirth(dateOfBirth);
    this._dateOfBirth = dateOfBirth.trim();
  }

  public setReportsTo(reportsTo: string | null): void {
    if (reportsTo !== null) {
      this._reportsTo = StringValidator.validateEmployeeId(reportsTo);
    } else {
      this._reportsTo = null;
    }
  }

  public setEmail(email?: string): void {
    if (email !== undefined && email !== '') {
      StringValidator.validateEmail(email);
      this._email = email.trim();
    } else {
      this._email = undefined;
    }
  }

  public setDepartment(department?: string): void {
    if (department !== undefined && department !== '') {
      this._department = StringValidator.validateNonEmptyString(department, 'department');
    } else {
      this._department = undefined;
    }
  }

  /**
   * Adds a reportee ID to this employee's list of reportees.
   * Subclasses can override if reportees are not allowed.
   */
  public addReportee(reporteeId: string): void {
    if (!this.canHaveReportees()) {
      throw new ValidationError(
        `${this.designation} '${this.name}' (ID: ${this.id}) cannot have any reportees.`
      );
    }
    const validatedId = StringValidator.validateEmployeeId(reporteeId);
    if (validatedId === this._id) {
      throw new ValidationError(`Employee '${this.id}' cannot report to themselves.`);
    }
    this._reportees.add(validatedId);
  }

  /**
   * Removes a reportee ID from this employee's list of reportees.
   */
  public removeReportee(reporteeId: string): boolean {
    return this._reportees.delete(reporteeId);
  }

  /**
   * Clears all reportees from this employee.
   */
  public clearReportees(): void {
    this._reportees.clear();
  }

  /**
   * Serializes employee details into a structured JSON DTO.
   */
  public toJSON(): IEmployeeDetails {
    const details: IEmployeeDetails = {
      id: this._id,
      name: this._name,
      dateOfBirth: this._dateOfBirth,
      designation: this.designation,
      reportsTo: this._reportsTo,
      reportees: Array.from(this._reportees),
    };
    if (this._email !== undefined) {
      details.email = this._email;
    }
    if (this._department !== undefined) {
      details.department = this._department;
    }
    return details;
  }

  /**
   * Returns a clean summary string representation.
   */
  public getSummary(): string {
    const reporteesStr =
      this._reportees.size > 0
        ? `Reportees: [${Array.from(this._reportees).join(', ')}]`
        : 'Reportees: None';
    const reportsToStr = this._reportsTo ? `ReportsTo: ${this._reportsTo}` : 'ReportsTo: None';
    return `[${this.designation}] ID: ${this._id} | Name: ${this._name} | DOB: ${this._dateOfBirth} | ${reportsToStr} | ${reporteesStr}`;
  }
}
