import { Designation } from '../src/types/designation.enum';
import { CEO } from '../src/models/ceo.model';
import { Director } from '../src/models/director.model';
import { Manager } from '../src/models/manager.model';
import { Lead } from '../src/models/lead.model';
import { Engineer } from '../src/models/engineer.model';
import { EmployeeFactory } from '../src/models/employee.factory';
import { ValidationError } from '../src/errors/organization.error';

describe('Employee OOP Models & Inheritance', () => {
  describe('CEO Model', () => {
    it('should create CEO with reportsTo as null', () => {
      const ceo = new CEO('CEO-1', 'Satya Nadella', '08/19/1967');
      expect(ceo.id).toBe('CEO-1');
      expect(ceo.designation).toBe(Designation.CEO);
      expect(ceo.reportsTo).toBeNull();
      expect(ceo.canHaveReportees()).toBe(true);
      expect(ceo.getAllowedReportsToDesignation()).toBeNull();
      expect(ceo.getAllowedReporteeDesignation()).toBe(Designation.Director);
    });

    it('should throw ValidationError if CEO is created with non-null reportsTo', () => {
      expect(() => new CEO('CEO-1', 'Satya', '08/19/1967', 'OTHER-ID')).toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError if setReportsTo is called on CEO with non-null', () => {
      const ceo = new CEO('CEO-1', 'Satya Nadella', '08/19/1967');
      expect(() => ceo.setReportsTo('SOME-ID')).toThrow(ValidationError);
    });
  });

  describe('Director Model', () => {
    it('should create Director reporting to CEO', () => {
      const dir = new Director('DIR-1', 'Scott Guthrie', '02/15/1975', 'CEO-1');
      expect(dir.id).toBe('DIR-1');
      expect(dir.designation).toBe(Designation.Director);
      expect(dir.reportsTo).toBe('CEO-1');
      expect(dir.canHaveReportees()).toBe(true);
      expect(dir.getAllowedReportsToDesignation()).toBe(Designation.CEO);
      expect(dir.getAllowedReporteeDesignation()).toBe(Designation.Manager);
    });
  });

  describe('Manager Model', () => {
    it('should create Manager reporting to Director', () => {
      const mgr = new Manager('MGR-1', 'Alice Johnson', '11/04/1982', 'DIR-1');
      expect(mgr.id).toBe('MGR-1');
      expect(mgr.designation).toBe(Designation.Manager);
      expect(mgr.reportsTo).toBe('DIR-1');
      expect(mgr.canHaveReportees()).toBe(true);
      expect(mgr.getAllowedReportsToDesignation()).toBe(Designation.Director);
      expect(mgr.getAllowedReporteeDesignation()).toBe(Designation.Lead);
    });
  });

  describe('Lead Model', () => {
    it('should create Lead reporting to Manager', () => {
      const lead = new Lead('LEAD-1', 'Charlie Brown', '09/12/1988', 'MGR-1');
      expect(lead.id).toBe('LEAD-1');
      expect(lead.designation).toBe(Designation.Lead);
      expect(lead.reportsTo).toBe('MGR-1');
      expect(lead.canHaveReportees()).toBe(true);
      expect(lead.getAllowedReportsToDesignation()).toBe(Designation.Manager);
      expect(lead.getAllowedReporteeDesignation()).toBe(Designation.Engineer);
    });
  });

  describe('Engineer Model', () => {
    it('should create Engineer reporting to Lead with empty reportees', () => {
      const eng = new Engineer('ENG-1', 'Evan Wright', '01/25/1995', 'LEAD-1');
      expect(eng.id).toBe('ENG-1');
      expect(eng.designation).toBe(Designation.Engineer);
      expect(eng.reportsTo).toBe('LEAD-1');
      expect(eng.canHaveReportees()).toBe(false);
      expect(eng.reportees).toEqual([]);
      expect(eng.getAllowedReportsToDesignation()).toBe(Designation.Lead);
      expect(eng.getAllowedReporteeDesignation()).toBeNull();
    });

    it('should throw ValidationError when attempting to add reportee to an Engineer', () => {
      const eng = new Engineer('ENG-1', 'Evan Wright', '01/25/1995', 'LEAD-1');
      expect(() => eng.addReportee('ENG-2')).toThrow(ValidationError);
    });
  });

  describe('Encapsulation & Mutators', () => {
    it('should allow updating name and DOB with validation', () => {
      const eng = new Engineer('ENG-1', 'Evan Wright', '01/25/1995', 'LEAD-1');
      eng.setName('Evan Wright-Miller');
      expect(eng.name).toBe('Evan Wright-Miller');

      eng.setDateOfBirth('01/25/1994');
      expect(eng.dateOfBirth).toBe('01/25/1994');

      expect(() => eng.setName('')).toThrow(ValidationError);
      expect(() => eng.setDateOfBirth('bad-date')).toThrow(ValidationError);
    });

    it('should serialize to JSON DTO properly', () => {
      const lead = new Lead(
        'LEAD-1',
        'Charlie Brown',
        '09/12/1988',
        'MGR-1',
        'charlie@org.com',
        'Engineering'
      );
      lead.addReportee('ENG-1');
      const json = lead.toJSON();
      expect(json).toEqual({
        id: 'LEAD-1',
        name: 'Charlie Brown',
        dateOfBirth: '09/12/1988',
        designation: Designation.Lead,
        reportsTo: 'MGR-1',
        reportees: ['ENG-1'],
        email: 'charlie@org.com',
        department: 'Engineering',
      });
    });
  });

  describe('EmployeeFactory', () => {
    it('should instantiate appropriate subclass for each Designation', () => {
      const ceo = EmployeeFactory.createEmployee({
        id: 'CEO-1',
        name: 'CEO Name',
        dateOfBirth: '01/01/1970',
        designation: Designation.CEO,
      });
      expect(ceo).toBeInstanceOf(CEO);

      const dir = EmployeeFactory.createEmployee({
        id: 'DIR-1',
        name: 'Dir Name',
        dateOfBirth: '01/01/1975',
        designation: Designation.Director,
        reportsTo: 'CEO-1',
      });
      expect(dir).toBeInstanceOf(Director);

      const mgr = EmployeeFactory.createEmployee({
        id: 'MGR-1',
        name: 'Mgr Name',
        dateOfBirth: '01/01/1980',
        designation: Designation.Manager,
        reportsTo: 'DIR-1',
      });
      expect(mgr).toBeInstanceOf(Manager);

      const lead = EmployeeFactory.createEmployee({
        id: 'LEAD-1',
        name: 'Lead Name',
        dateOfBirth: '01/01/1985',
        designation: Designation.Lead,
        reportsTo: 'MGR-1',
      });
      expect(lead).toBeInstanceOf(Lead);

      const eng = EmployeeFactory.createEmployee({
        id: 'ENG-1',
        name: 'Eng Name',
        dateOfBirth: '01/01/1990',
        designation: Designation.Engineer,
        reportsTo: 'LEAD-1',
      });
      expect(eng).toBeInstanceOf(Engineer);
    });

    it('should throw ValidationError if non-CEO employee is created without reportsTo', () => {
      expect(() =>
        EmployeeFactory.createEmployee({
          id: 'ENG-1',
          name: 'Eng Name',
          dateOfBirth: '01/01/1990',
          designation: Designation.Engineer,
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid designation', () => {
      expect(() =>
        EmployeeFactory.createEmployee({
          id: 'EMP-1',
          name: 'Emp Name',
          dateOfBirth: '01/01/1990',
          designation: 'Intern' as any,
        })
      ).toThrow(ValidationError);
    });
  });
});
