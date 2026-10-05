import { Designation } from './designation.enum';

/**
 * Strict mapping of who each designation must report to.
 * CEO reports to null (nobody).
 */
export const REPORTING_HIERARCHY_RULES: Readonly<Record<Designation, Designation | null>> = {
  [Designation.CEO]: null,
  [Designation.Director]: Designation.CEO,
  [Designation.Manager]: Designation.Director,
  [Designation.Lead]: Designation.Manager,
  [Designation.Engineer]: Designation.Lead,
} as const;

/**
 * Strict mapping of allowed direct subordinate designations for each manager role.
 * Engineer cannot have any reportees.
 */
export const ALLOWED_REPORTEE_RULES: Readonly<Record<Designation, Designation | null>> = {
  [Designation.CEO]: Designation.Director,
  [Designation.Director]: Designation.Manager,
  [Designation.Manager]: Designation.Lead,
  [Designation.Lead]: Designation.Engineer,
  [Designation.Engineer]: null,
} as const;
