/**
 * Supported organizational designations in order of hierarchy:
 * CEO -> Director -> Manager -> Lead -> Engineer
 */
export enum Designation {
  CEO = 'CEO',
  Director = 'Director',
  Manager = 'Manager',
  Lead = 'Lead',
  Engineer = 'Engineer',
}

/**
 * Type guard to check if a string is a valid Designation enum value.
 */
export function isDesignation(value: unknown): value is Designation {
  return (
    typeof value === 'string' &&
    Object.values(Designation).includes(value as Designation)
  );
}
