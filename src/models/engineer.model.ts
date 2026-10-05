import { Designation } from '../types/designation.enum';
import { Employee } from './employee.base';
import { ValidationError } from '../errors/organization.error';

/**
 * Engineer Model:
 * - reportsTo: must be the ID of a Lead.
 * - reportees: no reportees would be present for an engineer.
 */
export class Engineer extends Employee {
  public readonly designation: Designation = Designation.Engineer;

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
    return Designation.Lead;
  }

  public getAllowedReporteeDesignation(): Designation | null {
    return null;
  }

  public canHaveReportees(): boolean {
    return false;
  }

  public override addReportee(reporteeId: string): void {
    throw new ValidationError(
      `Engineer '${this.name}' (ID: ${this.id}) is not permitted to have reportees (attempted to add '${reporteeId}').`
    );
  }
}
