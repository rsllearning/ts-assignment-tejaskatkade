import { Designation } from '../types/designation.enum';
import { Employee } from './employee.base';

/**
 * Director Model:
 * - reportsTo: must be the ID of the CEO.
 * - reportees: list of Manager employee IDs.
 */
export class Director extends Employee {
  public readonly designation: Designation = Designation.Director;

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
    return Designation.CEO;
  }

  public getAllowedReporteeDesignation(): Designation | null {
    return Designation.Manager;
  }

  public canHaveReportees(): boolean {
    return true;
  }
}
