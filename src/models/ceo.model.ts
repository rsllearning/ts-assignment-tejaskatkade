import { Designation } from '../types/designation.enum';
import { Employee } from './employee.base';
import { ValidationError } from '../errors/organization.error';

/**
 * CEO Model:
 * - Represents the top-level executive in the organization.
 * - reportsTo: must be null (CEO reports to no one).
 * - reportees: list of Director employee IDs.
 */
export class CEO extends Employee {
  public readonly designation: Designation = Designation.CEO;

  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    reportsTo: string | null = null,
    email?: string,
    department?: string
  ) {
    if (reportsTo !== null && reportsTo !== undefined && reportsTo !== '') {
      throw new ValidationError(`CEO cannot report to anyone. 'reportsTo' must be null or omitted.`);
    }
    super(id, name, dateOfBirth, null, email, department);
  }

  public getAllowedReportsToDesignation(): Designation | null {
    return null;
  }

  public getAllowedReporteeDesignation(): Designation | null {
    return Designation.Director;
  }

  public canHaveReportees(): boolean {
    return true;
  }

  public override setReportsTo(reportsTo: string | null): void {
    if (reportsTo !== null && reportsTo !== undefined && reportsTo !== '') {
      throw new ValidationError(`CEO cannot report to anyone. 'reportsTo' must remain null.`);
    }
    super.setReportsTo(null);
  }
}
