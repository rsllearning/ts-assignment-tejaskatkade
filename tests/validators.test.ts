import { DateValidator } from '../src/utils/date.validator';
import { StringValidator } from '../src/utils/string.validator';
import { ValidationError } from '../src/errors/organization.error';

describe('DateValidator', () => {
  describe('validateDateOfBirth', () => {
    it('should accept valid mm/dd/yyyy date strings', () => {
      expect(() => DateValidator.validateDateOfBirth('01/15/1990')).not.toThrow();
      expect(() => DateValidator.validateDateOfBirth('12/31/1985')).not.toThrow();
      expect(() => DateValidator.validateDateOfBirth('07/04/2000')).not.toThrow();
    });

    it('should accept leap day in leap years (e.g. 02/29/2000, 02/29/2024)', () => {
      expect(() => DateValidator.validateDateOfBirth('02/29/2000')).not.toThrow();
      expect(() => DateValidator.validateDateOfBirth('02/29/2024')).not.toThrow();
    });

    it('should reject leap day in non-leap years (e.g. 02/29/2023)', () => {
      expect(() => DateValidator.validateDateOfBirth('02/29/2023')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('02/29/1900')).toThrow(ValidationError);
    });

    it('should reject 30th/31st of February', () => {
      expect(() => DateValidator.validateDateOfBirth('02/30/2000')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('02/31/2000')).toThrow(ValidationError);
    });

    it('should reject 31st day for 30-day months (April, June, Sept, Nov)', () => {
      expect(() => DateValidator.validateDateOfBirth('04/31/2010')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('06/31/2010')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('09/31/2010')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('11/31/2010')).toThrow(ValidationError);
    });

    it('should reject invalid formats like yyyy-mm-dd or dd-mm-yyyy', () => {
      expect(() => DateValidator.validateDateOfBirth('1990-05-20')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('20/05/1990')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('5/5/1990')).toThrow(ValidationError);
      expect(() => DateValidator.validateDateOfBirth('invalid-date')).toThrow(ValidationError);
    });

    it('should reject future birth dates', () => {
      expect(() => DateValidator.validateDateOfBirth('01/01/2099')).toThrow(ValidationError);
    });

    it('should reject dates older than 120 years', () => {
      expect(() => DateValidator.validateDateOfBirth('01/01/1850')).toThrow(ValidationError);
    });
  });

  describe('isValid helper', () => {
    it('returns true for valid dates and false for invalid dates without throwing', () => {
      expect(DateValidator.isValid('05/12/1992')).toBe(true);
      expect(DateValidator.isValid('invalid')).toBe(false);
      expect(DateValidator.isValid('02/30/2020')).toBe(false);
    });
  });
});

describe('StringValidator', () => {
  it('should validate and trim non-empty strings', () => {
    expect(StringValidator.validateNonEmptyString('  Alice  ', 'name')).toBe('Alice');
  });

  it('should throw ValidationError for empty or whitespace strings', () => {
    expect(() => StringValidator.validateNonEmptyString('', 'name')).toThrow(ValidationError);
    expect(() => StringValidator.validateNonEmptyString('   ', 'name')).toThrow(ValidationError);
  });

  it('should validate valid employee IDs and reject special characters', () => {
    expect(StringValidator.validateEmployeeId('EMP-100_A')).toBe('EMP-100_A');
    expect(() => StringValidator.validateEmployeeId('EMP 100')).toThrow(ValidationError);
    expect(() => StringValidator.validateEmployeeId('EMP#100')).toThrow(ValidationError);
  });

  it('should validate email format when provided', () => {
    expect(() => StringValidator.validateEmail('user@company.com')).not.toThrow();
    expect(() => StringValidator.validateEmail('invalid-email')).toThrow(ValidationError);
  });
});
