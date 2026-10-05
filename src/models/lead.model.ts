import { Designation } from '../types/designation.enum';
import { Employee } from './employee.base';

/**
 * Lead Model:
 * - reportsTo: must be the ID of a Manager.
 * - reportees: list of Engineer employee IDs.
 */
export class Lead extends Employee {
  public readonly designation: Designation = Designation.Lead;

  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    reportsTo: string,
    email?: string,
    department?: string
  ) {
    super(id, name, dateOfBirth, reportsTo, email, department);
  }

  public getAllowedReportsToDesignation(): Designation | null {
    return Designation.Manager;
  }

  public getAllowedReporteeDesignation(): Designation | null {
    return Designation.Engineer;
  }

  public canHaveReportees(): boolean {
    return true;
  }
}
