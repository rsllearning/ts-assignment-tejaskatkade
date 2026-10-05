import { Designation } from '../src/types/designation.enum';
import { OrganizationService } from '../src/services/organization.service';
import { HierarchyService } from '../src/services/hierarchy.service';
import {
  DuplicateEmployeeIdError,
  EmployeeNotFoundError,
  MultipleCeoError,
  InvalidHierarchyError,
  EmployeeHasReporteesError,
  ValidationError,
} from '../src/errors/organization.error';

describe('OrganizationService (CRUD & Hierarchy Validation)', () => {
  let org: OrganizationService;

  beforeEach(() => {
    org = new OrganizationService();
  });

  describe('CREATE Operations', () => {
    it('should successfully add a CEO', () => {
      const ceo = org.addEmployee({
        id: 'CEO-1',
        name: 'Chief Executive',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });

      expect(ceo.id).toBe('CEO-1');
      expect(ceo.designation).toBe(Designation.CEO);
      expect(org.getCEO()?.id).toBe('CEO-1');
      expect(org.getEmployeeCount()).toBe(1);
    });

    it('should reject a second CEO (Only one CEO allowed)', () => {
      org.addEmployee({
        id: 'CEO-1',
        name: 'First CEO',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });

      expect(() =>
        org.addEmployee({
          id: 'CEO-2',
          name: 'Second CEO',
          dateOfBirth: '02/02/1972',
          designation: Designation.CEO,
        })
      ).toThrow(MultipleCeoError);
    });

    it('should reject CEO with reportsTo specified', () => {
      expect(() =>
        org.addEmployee({
          id: 'CEO-1',
          name: 'CEO Name',
          dateOfBirth: '01/01/1970',
          designation: Designation.CEO,
          reportsTo: 'SOME-ID',
        })
      ).toThrow(ValidationError);
    });

    it('should reject employee with duplicate ID', () => {
      org.addEmployee({
        id: 'CEO-1',
        name: 'Chief Executive',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });

      expect(() =>
        org.addEmployee({
          id: 'CEO-1',
          name: 'Duplicate Chief',
          dateOfBirth: '05/05/1975',
          designation: Designation.Director,
          reportsTo: 'CEO-1',
        })
      ).toThrow(DuplicateEmployeeIdError);
    });

    it('should correctly build full hierarchy and maintain bidirectional reportees', () => {
      const ceo = org.addEmployee({
        id: 'CEO-1',
        name: 'CEO',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });

      const dir = org.addEmployee({
        id: 'DIR-1',
        name: 'Director',
        dateOfBirth: '02/02/1975',
        designation: Designation.Director,
        reportsTo: ceo.id,
      });

      const mgr = org.addEmployee({
        id: 'MGR-1',
        name: 'Manager',
        dateOfBirth: '03/03/1980',
        designation: Designation.Manager,
        reportsTo: dir.id,
      });

      const lead = org.addEmployee({
        id: 'LEAD-1',
        name: 'Lead',
        dateOfBirth: '04/04/1985',
        designation: Designation.Lead,
        reportsTo: mgr.id,
      });

      const eng = org.addEmployee({
        id: 'ENG-1',
        name: 'Engineer',
        dateOfBirth: '05/05/1990',
        designation: Designation.Engineer,
        reportsTo: lead.id,
      });

      // Validate bidirectional reportees
      expect(ceo.reportees).toEqual(['DIR-1']);
      expect(dir.reportees).toEqual(['MGR-1']);
      expect(mgr.reportees).toEqual(['LEAD-1']);
      expect(lead.reportees).toEqual(['ENG-1']);
      expect(eng.reportees).toEqual([]);
    });

    it('should reject invalid hierarchy (Engineer reporting directly to CEO)', () => {
      org.addEmployee({
        id: 'CEO-1',
        name: 'CEO',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });

      expect(() =>
        org.addEmployee({
          id: 'ENG-1',
          name: 'Engineer',
          dateOfBirth: '05/05/1990',
          designation: Designation.Engineer,
          reportsTo: 'CEO-1',
        })
      ).toThrow(InvalidHierarchyError);
    });

    it('should reject employee with non-existent supervisor', () => {
      expect(() =>
        org.addEmployee({
          id: 'DIR-1',
          name: 'Director',
          dateOfBirth: '02/02/1975',
          designation: Designation.Director,
          reportsTo: 'NON-EXISTENT-CEO',
        })
      ).toThrow(EmployeeNotFoundError);
    });
  });

  describe('READ Operations', () => {
    beforeEach(() => {
      org.addEmployee({
        id: 'CEO-1',
        name: 'CEO',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });
      org.addEmployee({
        id: 'DIR-1',
        name: 'Director',
        dateOfBirth: '02/02/1975',
        designation: Designation.Director,
        reportsTo: 'CEO-1',
      });
      org.addEmployee({
        id: 'MGR-1',
        name: 'Manager',
        dateOfBirth: '03/03/1980',
        designation: Designation.Manager,
        reportsTo: 'DIR-1',
      });
      org.addEmployee({
        id: 'LEAD-1',
        name: 'Lead',
        dateOfBirth: '04/04/1985',
        designation: Designation.Lead,
        reportsTo: 'MGR-1',
      });
      org.addEmployee({
        id: 'ENG-1',
        name: 'Engineer',
        dateOfBirth: '05/05/1990',
        designation: Designation.Engineer,
        reportsTo: 'LEAD-1',
      });
    });

    it('should retrieve employee by ID', () => {
      const emp = org.getEmployeeById('ENG-1');
      expect(emp.name).toBe('Engineer');
      expect(emp.designation).toBe(Designation.Engineer);
    });

    it('should throw EmployeeNotFoundError when retrieving non-existent ID', () => {
      expect(() => org.getEmployeeById('UNKNOWN-ID')).toThrow(EmployeeNotFoundError);
    });

    it('should retrieve all employees', () => {
      const all = org.getAllEmployees();
      expect(all.length).toBe(5);
    });

    it('should retrieve direct reportees', () => {
      const reportees = org.getDirectReportees('LEAD-1');
      expect(reportees.length).toBe(1);
      expect(reportees[0]?.id).toBe('ENG-1');
    });

    it('should retrieve the full management chain from Engineer to CEO', () => {
      const chain = org.getReportingChain('ENG-1');
      expect(chain.map((e) => e.designation)).toEqual([
        Designation.Lead,
        Designation.Manager,
        Designation.Director,
        Designation.CEO,
      ]);
    });
  });

  describe('UPDATE Operations', () => {
    beforeEach(() => {
      org.addEmployee({
        id: 'CEO-1',
        name: 'CEO',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });
      org.addEmployee({
        id: 'DIR-1',
        name: 'Director',
        dateOfBirth: '02/02/1975',
        designation: Designation.Director,
        reportsTo: 'CEO-1',
      });
      org.addEmployee({
        id: 'MGR-1',
        name: 'Manager',
        dateOfBirth: '03/03/1980',
        designation: Designation.Manager,
        reportsTo: 'DIR-1',
      });
      org.addEmployee({
        id: 'LEAD-1',
        name: 'Lead 1',
        dateOfBirth: '04/04/1985',
        designation: Designation.Lead,
        reportsTo: 'MGR-1',
      });
      org.addEmployee({
        id: 'LEAD-2',
        name: 'Lead 2',
        dateOfBirth: '05/05/1986',
        designation: Designation.Lead,
        reportsTo: 'MGR-1',
      });
      org.addEmployee({
        id: 'ENG-1',
        name: 'Engineer 1',
        dateOfBirth: '06/06/1992',
        designation: Designation.Engineer,
        reportsTo: 'LEAD-1',
      });
    });

    it('should update name, dateOfBirth, and email', () => {
      const updated = org.updateEmployee('ENG-1', {
        name: 'Engineer Updated',
        dateOfBirth: '07/07/1993',
        email: 'eng.updated@org.com',
      });

      expect(updated.name).toBe('Engineer Updated');
      expect(updated.dateOfBirth).toBe('07/07/1993');
      expect(updated.email).toBe('eng.updated@org.com');
    });

    it('should reassign supervisor and update bidirectional reportee lists', () => {
      expect(org.getEmployeeById('LEAD-1').reportees).toContain('ENG-1');
      expect(org.getEmployeeById('LEAD-2').reportees).not.toContain('ENG-1');

      org.updateEmployee('ENG-1', {
        reportsTo: 'LEAD-2',
      });

      expect(org.getEmployeeById('ENG-1').reportsTo).toBe('LEAD-2');
      expect(org.getEmployeeById('LEAD-1').reportees).not.toContain('ENG-1');
      expect(org.getEmployeeById('LEAD-2').reportees).toContain('ENG-1');
    });

    it('should throw EmployeeNotFoundError when updating a non-existent employee', () => {
      expect(() =>
        org.updateEmployee('DOES-NOT-EXIST', { name: 'Something' })
      ).toThrow(EmployeeNotFoundError);
    });

    it('should throw InvalidHierarchyError when updating reportsTo to an invalid role', () => {
      expect(() =>
        org.updateEmployee('ENG-1', {
          reportsTo: 'MGR-1', // Manager instead of Lead!
        })
      ).toThrow(InvalidHierarchyError);
    });
  });

  describe('DELETE Operations & Edge Cases', () => {
    beforeEach(() => {
      org.addEmployee({
        id: 'CEO-1',
        name: 'CEO',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });
      org.addEmployee({
        id: 'DIR-1',
        name: 'Director 1',
        dateOfBirth: '02/02/1975',
        designation: Designation.Director,
        reportsTo: 'CEO-1',
      });
      org.addEmployee({
        id: 'DIR-2',
        name: 'Director 2',
        dateOfBirth: '03/03/1976',
        designation: Designation.Director,
        reportsTo: 'CEO-1',
      });
      org.addEmployee({
        id: 'MGR-1',
        name: 'Manager 1',
        dateOfBirth: '04/04/1980',
        designation: Designation.Manager,
        reportsTo: 'DIR-1',
      });
    });

    it('should delete a leaf employee and remove from supervisor reportees list', () => {
      expect(org.getEmployeeById('DIR-1').reportees).toContain('MGR-1');

      org.deleteEmployee('MGR-1');

      expect(org.hasEmployee('MGR-1')).toBe(false);
      expect(org.getEmployeeById('DIR-1').reportees).not.toContain('MGR-1');
    });

    it('should reject deletion of employee with active reportees when no reassignment is provided', () => {
      expect(() => org.deleteEmployee('DIR-1')).toThrow(EmployeeHasReporteesError);
    });

    it('should successfully delete employee with reportees when reassignment target is provided', () => {
      expect(org.getEmployeeById('MGR-1').reportsTo).toBe('DIR-1');
      expect(org.getEmployeeById('DIR-2').reportees).toEqual([]);

      org.deleteEmployee('DIR-1', { reassignReporteesTo: 'DIR-2' });

      expect(org.hasEmployee('DIR-1')).toBe(false);
      expect(org.getEmployeeById('MGR-1').reportsTo).toBe('DIR-2');
      expect(org.getEmployeeById('DIR-2').reportees).toContain('MGR-1');
      expect(org.getEmployeeById('CEO-1').reportees).not.toContain('DIR-1');
    });

    it('should reject reassignment to an employee of a different designation', () => {
      expect(() =>
        org.deleteEmployee('DIR-1', { reassignReporteesTo: 'CEO-1' })
      ).toThrow(InvalidHierarchyError);
    });

    it('should reject deleting a non-existent employee', () => {
      expect(() => org.deleteEmployee('GHOST-ID')).toThrow(EmployeeNotFoundError);
    });
  });

  describe('HierarchyService', () => {
    it('should format tree representation accurately', () => {
      org.addEmployee({
        id: 'CEO-1',
        name: 'Chief Leader',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });
      org.addEmployee({
        id: 'DIR-1',
        name: 'Director Alpha',
        dateOfBirth: '02/02/1975',
        designation: Designation.Director,
        reportsTo: 'CEO-1',
      });

      const tree = HierarchyService.buildHierarchyTree(org);
      expect(tree).not.toBeNull();
      expect(tree?.id).toBe('CEO-1');
      expect(tree?.subordinates.length).toBe(1);
      expect(tree?.subordinates[0]?.id).toBe('DIR-1');

      const formatted = HierarchyService.formatTree(tree);
      expect(formatted).toContain('[CEO] Chief Leader');
      expect(formatted).toContain('[Director] Director Alpha');
    });
  });
});
