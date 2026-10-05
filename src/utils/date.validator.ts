import { ValidationError } from '../errors/organization.error';

/**
 * Utility for validating and parsing date strings in 'mm/dd/yyyy' format.
 */
export class DateValidator {
  private static readonly DATE_REGEX = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/;

  /**
   * Checks whether a year is a leap year.
   */
  public static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Returns the maximum valid days for a given month and year.
   */
  public static getDaysInMonth(month: number, year: number): number {
    switch (month) {
      case 2:
        return this.isLeapYear(year) ? 29 : 28;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      default:
        return 31;
    }
  }

  /**
   * Validates that the provided date string is in strict 'mm/dd/yyyy' format,
   * corresponds to a valid calendar date, and is not in the future.
   * Throws ValidationError if invalid.
   */
  public static validateDateOfBirth(dateStr: string): void {
    if (!dateStr || typeof dateStr !== 'string') {
      throw new ValidationError("dateOfBirth is required and must be a string in 'mm/dd/yyyy' format.");
    }

    const trimmed = dateStr.trim();
    const match = trimmed.match(this.DATE_REGEX);

    if (!match) {
      throw new ValidationError(
        `Invalid date format for dateOfBirth: '${dateStr}'. Required format is 'mm/dd/yyyy' (e.g. 05/21/1990).`
      );
    }

    const month = parseInt(match[1]!, 10);
    const day = parseInt(match[2]!, 10);
    const year = parseInt(match[3]!, 10);

    const maxDays = this.getDaysInMonth(month, year);
    if (day > maxDays) {
      throw new ValidationError(
        `Invalid calendar date '${dateStr}': Month ${month} in year ${year} has at most ${maxDays} days.`
      );
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (birthDate > today) {
      throw new ValidationError(
        `dateOfBirth '${dateStr}' cannot be a future date.`
      );
    }

    const currentYear = new Date().getFullYear();
    if (year < currentYear - 120) {
      throw new ValidationError(
        `dateOfBirth '${dateStr}' is unrealistic (more than 120 years ago).`
      );
    }
  }

  /**
   * Checks if string is a valid mm/dd/yyyy date without throwing.
   */
  public static isValid(dateStr: string): boolean {
    try {
      this.validateDateOfBirth(dateStr);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parses valid 'mm/dd/yyyy' into a JavaScript Date object.
   */
  public static parse(dateStr: string): Date {
    this.validateDateOfBirth(dateStr);
    const [month, day, year] = dateStr.split('/').map((s) => parseInt(s, 10));
    return new Date(year!, month! - 1, day!);
  }
}
