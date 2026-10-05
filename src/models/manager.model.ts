import { Designation } from '../types/designation.enum';
import { Employee } from './employee.base';

/**
 * Manager Model:
 * - reportsTo: must be the ID of a Director.
 * - reportees: list of Lead employee IDs.
 */
export class Manager extends Employee {
  public readonly designation: Designation = Designation.Manager;

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
    return Designation.Director;
  }

  public getAllowedReporteeDesignation(): Designation | null {
    return Designation.Lead;
  }

  public canHaveReportees(): boolean {
    return true;
  }
}
