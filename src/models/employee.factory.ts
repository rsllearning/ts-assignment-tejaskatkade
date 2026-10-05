import { Designation, isDesignation } from '../types/designation.enum';
import { CreateEmployeeDTO } from '../types/employee.interface';
import { Employee } from './employee.base';
import { CEO } from './ceo.model';
import { Director } from './director.model';
import { Manager } from './manager.model';
import { Lead } from './lead.model';
import { Engineer } from './engineer.model';
import { ValidationError } from '../errors/organization.error';

/**
 * Factory pattern implementation for polymorphic Employee instantiation.
 */
export class EmployeeFactory {
  /**
   * Instantiates the appropriate Employee subclass based on the designation.
   */
  public static createEmployee(dto: CreateEmployeeDTO): Employee {
    if (!dto) {
      throw new ValidationError('Employee data DTO must be provided.');
    }

    if (!isDesignation(dto.designation)) {
      throw new ValidationError(
        `Invalid designation: '${dto.designation}'. Must be one of: ${Object.values(
          Designation
        ).join(', ')}`
      );
    }

    switch (dto.designation) {
      case Designation.CEO:
        return new CEO(
          dto.id,
          dto.name,
          dto.dateOfBirth,
          dto.reportsTo,
          dto.email,
          dto.department
        );

      case Designation.Director:
        if (!dto.reportsTo) {
          throw new ValidationError(`Director must report to a CEO. 'reportsTo' is required.`);
        }
        return new Director(
          dto.id,
          dto.name,
          dto.dateOfBirth,
          dto.reportsTo,
          dto.email,
          dto.department
        );

      case Designation.Manager:
        if (!dto.reportsTo) {
          throw new ValidationError(`Manager must report to a Director. 'reportsTo' is required.`);
        }
        return new Manager(
          dto.id,
          dto.name,
          dto.dateOfBirth,
          dto.reportsTo,
          dto.email,
          dto.department
        );

      case Designation.Lead:
        if (!dto.reportsTo) {
          throw new ValidationError(`Lead must report to a Manager. 'reportsTo' is required.`);
        }
        return new Lead(
          dto.id,
          dto.name,
          dto.dateOfBirth,
          dto.reportsTo,
          dto.email,
          dto.department
        );

      case Designation.Engineer:
        if (!dto.reportsTo) {
          throw new ValidationError(`Engineer must report to a Lead. 'reportsTo' is required.`);
        }
        return new Engineer(
          dto.id,
          dto.name,
          dto.dateOfBirth,
          dto.reportsTo,
          dto.email,
          dto.department
        );

      default:
        // Exhaustive check
        const _exhaustive: never = dto.designation;
        throw new ValidationError(`Unhandled designation: ${_exhaustive}`);
    }
  }
}
