import { OrgTreeNode } from '../types/employee.interface';
import { OrganizationService } from './organization.service';
import { Employee } from '../models/employee.base';

/**
 * Service to build and render organizational tree hierarchies.
 */
export class HierarchyService {
  /**
   * Constructs a hierarchical tree from the CEO down to individual Engineers.
   */
  public static buildHierarchyTree(orgService: OrganizationService): OrgTreeNode | null {
    const ceo = orgService.getCEO();
    if (!ceo) {
      return null;
    }
    return this.buildSubtree(ceo, orgService);
  }

  private static buildSubtree(employee: Employee, orgService: OrganizationService): OrgTreeNode {
    const directReportees = orgService.getDirectReportees(employee.id);
    const subordinates: OrgTreeNode[] = directReportees.map((reportee) =>
      this.buildSubtree(reportee, orgService)
    );

    return {
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      dateOfBirth: employee.dateOfBirth,
      reportsTo: employee.reportsTo,
      subordinates,
    };
  }

  /**
   * Formats the organizational tree as a human-readable ASCII string.
   */
  public static formatTree(node: OrgTreeNode | null, prefix: string = '', isLast: boolean = true): string {
    if (!node) {
      return 'Empty Organization (No CEO appointed)';
    }

    let output = '';
    const connector = prefix === '' ? '' : isLast ? '└── ' : '├── ';
    output += `${prefix}${connector}[${node.designation}] ${node.name} (ID: ${node.id}, DOB: ${node.dateOfBirth})\n`;

    const childPrefix = prefix === '' ? '    ' : prefix + (isLast ? '    ' : '│   ');
    node.subordinates.forEach((child, index) => {
      const isChildLast = index === node.subordinates.length - 1;
      output += this.formatTree(child, childPrefix, isChildLast);
    });

    return output;
  }
}
