/**
 * Organization Management System - Main Entry Point & Live Demonstration
 */
import { Designation } from './types/designation.enum';
import { OrganizationService } from './services/organization.service';
import { HierarchyService } from './services/hierarchy.service';
import {
  OrganizationError,
  DuplicateEmployeeIdError,
  EmployeeNotFoundError,
  MultipleCeoError,
  InvalidHierarchyError,
  EmployeeHasReporteesError,
  ValidationError,
} from './errors/organization.error';

// Export domain symbols for library consumers
export * from './types/designation.enum';
export * from './types/employee.interface';
export * from './types/hierarchy.types';
export * from './models/employee.base';
export * from './models/ceo.model';
export * from './models/director.model';
export * from './models/manager.model';
export * from './models/lead.model';
export * from './models/engineer.model';
export * from './models/employee.factory';
export * from './services/organization.service';
export * from './services/hierarchy.service';
export * from './errors/organization.error';
export * from './utils/date.validator';
export * from './utils/string.validator';

/**
 * Helper to print section headers in terminal.
 */
function printSection(title: string): void {
  console.log('\n' + '='.repeat(75));
  console.log(`>>> ${title}`);
  console.log('='.repeat(75));
}

/**
 * Runs a complete demonstration of the Organization Management System.
 */
export function runDemo(): void {
  console.log('###########################################################################');
  console.log('#              ORGANIZATION MANAGEMENT SYSTEM - TS OOP DEMO               #');
  console.log('###########################################################################');

  const org = new OrganizationService();

  // =========================================================================
  // 1. CREATE OPERATIONS (Building Organization Hierarchy)
  // =========================================================================
  printSection('1. CREATE OPERATIONS - Adding Employees Across Hierarchy');

  console.log('Adding CEO...');
  const ceo = org.addEmployee({
    id: 'EMP-CEO-01',
    name: 'Satya Nadella',
    dateOfBirth: '08/19/1967',
    designation: Designation.CEO,
    email: 'satya@org.com',
    department: 'Executive',
  });
  console.log(`[CREATED] ${ceo.getSummary()}`);

  console.log('\nAdding Directors reporting to CEO...');
  const dirEngineering = org.addEmployee({
    id: 'EMP-DIR-01',
    name: 'Scott Guthrie',
    dateOfBirth: '02/15/1975',
    designation: Designation.Director,
    reportsTo: ceo.id,
    email: 'scott.g@org.com',
    department: 'Cloud & AI',
  });
  const dirProduct = org.addEmployee({
    id: 'EMP-DIR-02',
    name: 'Panos Panay',
    dateOfBirth: '07/28/1972',
    designation: Designation.Director,
    reportsTo: ceo.id,
    email: 'panos@org.com',
    department: 'Devices',
  });
  console.log(`[CREATED] ${dirEngineering.getSummary()}`);
  console.log(`[CREATED] ${dirProduct.getSummary()}`);

  console.log('\nAdding Managers reporting to Directors...');
  const mgrBackend = org.addEmployee({
    id: 'EMP-MGR-01',
    name: 'Alice Johnson',
    dateOfBirth: '11/04/1982',
    designation: Designation.Manager,
    reportsTo: dirEngineering.id,
    department: 'Core Backend',
  });
  const mgrFrontend = org.addEmployee({
    id: 'EMP-MGR-02',
    name: 'Bob Williams',
    dateOfBirth: '03/22/1984',
    designation: Designation.Manager,
    reportsTo: dirEngineering.id,
    department: 'Web Platforms',
  });
  console.log(`[CREATED] ${mgrBackend.getSummary()}`);
  console.log(`[CREATED] ${mgrFrontend.getSummary()}`);

  console.log('\nAdding Technical Leads reporting to Managers...');
  const leadServices = org.addEmployee({
    id: 'EMP-LEAD-01',
    name: 'Charlie Brown',
    dateOfBirth: '09/12/1988',
    designation: Designation.Lead,
    reportsTo: mgrBackend.id,
    department: 'Microservices',
  });
  const leadData = org.addEmployee({
    id: 'EMP-LEAD-02',
    name: 'Diana Prince',
    dateOfBirth: '06/18/1990',
    designation: Designation.Lead,
    reportsTo: mgrBackend.id,
    department: 'Data Pipelines',
  });
  console.log(`[CREATED] ${leadServices.getSummary()}`);
  console.log(`[CREATED] ${leadData.getSummary()}`);

  console.log('\nAdding Engineers reporting to Leads...');
  const eng1 = org.addEmployee({
    id: 'EMP-ENG-01',
    name: 'Evan Wright',
    dateOfBirth: '01/25/1995',
    designation: Designation.Engineer,
    reportsTo: leadServices.id,
    department: 'Microservices',
  });
  const eng2 = org.addEmployee({
    id: 'EMP-ENG-02',
    name: 'Fiona Gallagher',
    dateOfBirth: '12/10/1996',
    designation: Designation.Engineer,
    reportsTo: leadServices.id,
    department: 'Microservices',
  });
  const eng3 = org.addEmployee({
    id: 'EMP-ENG-03',
    name: 'George Clark',
    dateOfBirth: '04/05/1997',
    designation: Designation.Engineer,
    reportsTo: leadData.id,
    department: 'Data Pipelines',
  });
  console.log(`[CREATED] ${eng1.getSummary()}`);
  console.log(`[CREATED] ${eng2.getSummary()}`);
  console.log(`[CREATED] ${eng3.getSummary()}`);

  console.log(`\nTotal employees currently in organization: ${org.getEmployeeCount()}`);

  // =========================================================================
  // 2. READ OPERATIONS
  // =========================================================================
  printSection('2. READ OPERATIONS - Inspecting Organization');

  console.log('Retrieve Specific Employee by ID (EMP-LEAD-01):');
  const fetchedLead = org.getEmployeeById('EMP-LEAD-01');
  console.log(JSON.stringify(fetchedLead.toJSON(), null, 2));

  console.log('\nDirect Reportees of Lead Charlie Brown:');
  const reportees = org.getDirectReportees('EMP-LEAD-01');
  reportees.forEach((r) => console.log(` - ${r.getSummary()}`));

  console.log('\nReporting Chain from Engineer Evan Wright up to CEO:');
  const chain = org.getReportingChain('EMP-ENG-01');
  chain.forEach((manager, index) => {
    console.log(` Level ${index + 1}: [${manager.designation}] ${manager.name} (${manager.id})`);
  });

  console.log('\nFull Organizational Chart:');
  const tree = HierarchyService.buildHierarchyTree(org);
  console.log(HierarchyService.formatTree(tree));

  // =========================================================================
  // 3. UPDATE OPERATIONS
  // =========================================================================
  printSection('3. UPDATE OPERATIONS - Modifying Profile & Reassigning Supervisor');

  console.log('Updating Evan Wright profile (updating name & date of birth):');
  const updatedEng1 = org.updateEmployee('EMP-ENG-01', {
    name: 'Evan Wright-Miller',
    dateOfBirth: '01/25/1994',
    email: 'evan.wm@org.com',
  });
  console.log(`[UPDATED] ${updatedEng1.getSummary()}`);

  console.log('\nReassigning Evan Wright from Lead Charlie Brown to Lead Diana Prince...');
  console.log(`Before reassignment:`);
  console.log(` Charlie Brown reportees: [${org.getEmployeeById('EMP-LEAD-01').reportees.join(', ')}]`);
  console.log(` Diana Prince reportees:  [${org.getEmployeeById('EMP-LEAD-02').reportees.join(', ')}]`);

  org.updateEmployee('EMP-ENG-01', {
    reportsTo: 'EMP-LEAD-02',
  });

  console.log(`After reassignment:`);
  console.log(` Evan reportsTo: ${org.getEmployeeById('EMP-ENG-01').reportsTo}`);
  console.log(` Charlie Brown reportees: [${org.getEmployeeById('EMP-LEAD-01').reportees.join(', ')}]`);
  console.log(` Diana Prince reportees:  [${org.getEmployeeById('EMP-LEAD-02').reportees.join(', ')}]`);

  // =========================================================================
  // 4. DELETE OPERATIONS & EDGE CASES
  // =========================================================================
  printSection('4. DELETE OPERATIONS - Handling Employees with Reportees & Leaves');

  console.log('Attempting to delete Lead Diana Prince (who has active reportees):');
  try {
    org.deleteEmployee('EMP-LEAD-02');
    console.log('FAIL: Deletion should have been rejected!');
  } catch (error) {
    if (error instanceof EmployeeHasReporteesError) {
      console.log(`[SUCCESSFULLY REJECTED] Expected Error: ${error.message}`);
    } else {
      console.log(`Unexpected error: ${error}`);
    }
  }

  console.log('\nDeleting Lead Diana Prince WITH safe reassignment of reportees to Lead Charlie Brown...');
  org.deleteEmployee('EMP-LEAD-02', { reassignReporteesTo: 'EMP-LEAD-01' });
  console.log(`[DELETED] EMP-LEAD-02 removed.`);
  console.log(`Charlie Brown reportees now: [${org.getEmployeeById('EMP-LEAD-01').reportees.join(', ')}]`);
  console.log(`Evan Wright reportsTo now: ${org.getEmployeeById('EMP-ENG-01').reportsTo}`);
  console.log(`George Clark reportsTo now: ${org.getEmployeeById('EMP-ENG-03').reportsTo}`);

  console.log('\nDeleting leaf Engineer Fiona Gallagher (EMP-ENG-02)...');
  org.deleteEmployee('EMP-ENG-02');
  console.log(`[DELETED] EMP-ENG-02 removed.`);
  console.log(`Charlie Brown reportees now: [${org.getEmployeeById('EMP-LEAD-01').reportees.join(', ')}]`);
  console.log(`Total employee count now: ${org.getEmployeeCount()}`);

  // =========================================================================
  // 5. VALIDATIONS & EDGE CASES SUITE
  // =========================================================================
  printSection('5. VALIDATIONS & EDGE CASES DEMONSTRATION');

  // Edge Case 1: Duplicate ID
  testValidationCase(
    'Edge Case 1: Reject Duplicate Employee ID',
    () => {
      org.addEmployee({
        id: 'EMP-CEO-01', // Already exists
        name: 'Imposter CEO',
        dateOfBirth: '05/10/1980',
        designation: Designation.CEO,
      });
    },
    DuplicateEmployeeIdError
  );

  // Edge Case 2: Only One CEO Allowed
  testValidationCase(
    'Edge Case 2: Reject Second CEO Creation',
    () => {
      org.addEmployee({
        id: 'EMP-CEO-02',
        name: 'Second CEO Candidate',
        dateOfBirth: '05/10/1980',
        designation: Designation.CEO,
      });
    },
    MultipleCeoError
  );

  // Edge Case 3: Invalid Hierarchy (Engineer reporting directly to CEO)
  testValidationCase(
    'Edge Case 3: Reject Invalid Hierarchy (Engineer reporting directly to CEO)',
    () => {
      org.addEmployee({
        id: 'EMP-ENG-INVALID',
        name: 'Rogue Engineer',
        dateOfBirth: '08/14/1998',
        designation: Designation.Engineer,
        reportsTo: 'EMP-CEO-01', // CEO instead of Lead!
      });
    },
    InvalidHierarchyError
  );

  // Edge Case 4: Invalid Hierarchy (Lead reporting to another Lead instead of Manager)
  testValidationCase(
    'Edge Case 4: Reject Invalid Hierarchy (Lead reporting to another Lead)',
    () => {
      org.addEmployee({
        id: 'EMP-LEAD-INVALID',
        name: 'Confused Lead',
        dateOfBirth: '03/11/1991',
        designation: Designation.Lead,
        reportsTo: 'EMP-LEAD-01', // Lead instead of Manager!
      });
    },
    InvalidHierarchyError
  );

  // Edge Case 5: Non-existent Supervisor Reference
  testValidationCase(
    'Edge Case 5: Reject Non-Existent Supervisor Reference',
    () => {
      org.addEmployee({
        id: 'EMP-ENG-GHOST',
        name: 'Ghost Engineer',
        dateOfBirth: '01/01/1995',
        designation: Designation.Engineer,
        reportsTo: 'NON-EXISTENT-LEAD',
      });
    },
    EmployeeNotFoundError
  );

  // Edge Case 6: Updating Non-Existent Employee
  testValidationCase(
    'Edge Case 6: Reject Update for Non-Existent Employee ID',
    () => {
      org.updateEmployee('EMP-DOES-NOT-EXIST', { name: 'New Name' });
    },
    EmployeeNotFoundError
  );

  // Edge Case 7: Invalid Date Format (YYYY-MM-DD instead of MM/DD/YYYY)
  testValidationCase(
    'Edge Case 7: Reject Invalid Date Format (YYYY-MM-DD)',
    () => {
      org.addEmployee({
        id: 'EMP-ENG-DATE-1',
        name: 'Bad Date Emp',
        dateOfBirth: '1995-10-25',
        designation: Designation.Engineer,
        reportsTo: 'EMP-LEAD-01',
      });
    },
    ValidationError
  );

  // Edge Case 8: Invalid Calendar Date (e.g. Feb 30th)
  testValidationCase(
    'Edge Case 8: Reject Invalid Calendar Date (02/30/2000)',
    () => {
      org.addEmployee({
        id: 'EMP-ENG-DATE-2',
        name: 'Feb 30 Emp',
        dateOfBirth: '02/30/2000',
        designation: Designation.Engineer,
        reportsTo: 'EMP-LEAD-01',
      });
    },
    ValidationError
  );

  // Edge Case 9: Future Birth Date
  testValidationCase(
    'Edge Case 9: Reject Future Date of Birth',
    () => {
      org.addEmployee({
        id: 'EMP-ENG-FUTURE',
        name: 'Time Traveler',
        dateOfBirth: '01/01/2099',
        designation: Designation.Engineer,
        reportsTo: 'EMP-LEAD-01',
      });
    },
    ValidationError
  );

  // Edge Case 10: Empty Required Name Field
  testValidationCase(
    'Edge Case 10: Reject Empty Required Field (Empty Name)',
    () => {
      org.addEmployee({
        id: 'EMP-ENG-NO-NAME',
        name: '   ',
        dateOfBirth: '05/15/1995',
        designation: Designation.Engineer,
        reportsTo: 'EMP-LEAD-01',
      });
    },
    ValidationError
  );

  // Edge Case 11: Attempting to Add Reportee to an Engineer
  testValidationCase(
    'Edge Case 11: Reject Adding Reportee to an Engineer',
    () => {
      const eng = org.getEmployeeById('EMP-ENG-01');
      eng.addReportee('EMP-ENG-03');
    },
    ValidationError
  );

  printSection('DEMONSTRATION COMPLETED SUCCESSFULLY');
  console.log('All CRUD operations, OOP concepts, hierarchy validations, and edge cases');
  console.log('executed cleanly according to all assignment requirements!');
}

/**
 * Helper to run an edge case test and verify expected custom error is thrown.
 */
function testValidationCase(
  testName: string,
  action: () => void,
  expectedErrorType: new (...args: any[]) => OrganizationError
): void {
  console.log(`\nTesting: ${testName}`);
  try {
    action();
    console.error(` ❌ FAILED: Expected ${expectedErrorType.name} but no error was thrown.`);
  } catch (error) {
    if (error instanceof expectedErrorType) {
      console.log(` ✅ PASSED: Correctly caught [${error.errorCode}]: ${error.message}`);
    } else {
      console.error(` ❌ FAILED: Expected ${expectedErrorType.name}, but caught:`, error);
    }
  }
}

// Auto-run if executed directly via ts-node or node
if (require.main === module) {
  runDemo();
}
