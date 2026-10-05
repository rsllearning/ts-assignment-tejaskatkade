import { ValidationError } from '../errors/organization.error';

/**
 * Utility for validating string inputs and formats.
 */
export class StringValidator {
  /**
   * Validates that a string is defined and not just whitespace.
   */
  public static validateNonEmptyString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError(`Field '${fieldName}' must be a non-empty string.`);
    }
    return value.trim();
  }

  /**
   * Validates employee ID format (non-empty string, no disallowed characters).
   */
  public static validateEmployeeId(id: unknown): string {
    const trimmed = this.validateNonEmptyString(id, 'id');
    if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
      throw new ValidationError(
        `Employee ID '${trimmed}' contains invalid characters. Only alphanumeric, dashes, and underscores are allowed.`
      );
    }
    return trimmed;
  }

  /**
   * Validates email format if provided.
   */
  public static validateEmail(email?: string): void {
    if (!email) {
      return;
    }
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new ValidationError(`Invalid email format: '${email}'.`);
    }
  }
}
