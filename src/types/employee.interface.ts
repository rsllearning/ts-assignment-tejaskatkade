import { Designation } from './designation.enum';

/**
 * Public contract for all Employee models.
 */
export interface IEmployee {
  readonly id: string;
  readonly name: string;
  readonly dateOfBirth: string;
  readonly designation: Designation;
  readonly reportsTo: string | null;
  readonly reportees: readonly string[];
  readonly email?: string;
  readonly department?: string;

  canHaveReportees(): boolean;
  getAllowedReportsToDesignation(): Designation | null;
  getAllowedReporteeDesignation(): Designation | null;
  toJSON(): IEmployeeDetails;
  getSummary(): string;
}

/**
 * Data Transfer Object for creating a new Employee.
 */
export interface CreateEmployeeDTO {
  id: string;
  name: string;
  dateOfBirth: string; // mm/dd/yyyy
  designation: Designation;
  reportsTo?: string | null;
  email?: string;
  department?: string;
}

/**
 * Data Transfer Object for updating an existing Employee.
 */
export interface UpdateEmployeeDTO {
  name?: string;
  dateOfBirth?: string; // mm/dd/yyyy
  reportsTo?: string | null;
  designation?: Designation;
  email?: string;
  department?: string;
}

/**
 * Serialized representation of an employee.
 */
export interface IEmployeeDetails {
  id: string;
  name: string;
  dateOfBirth: string;
  designation: Designation;
  reportsTo: string | null;
  reportees: string[];
  email?: string;
  department?: string;
}

/**
 * Tree representation node for org hierarchy reporting visualization.
 */
export interface OrgTreeNode {
  id: string;
  name: string;
  designation: Designation;
  dateOfBirth: string;
  reportsTo: string | null;
  subordinates: OrgTreeNode[];
}
