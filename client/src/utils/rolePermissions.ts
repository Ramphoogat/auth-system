
export type UserRole = 'user' | 'editor' | 'author' | 'admin';
export type DashboardType = 'user' | 'editor' | 'author' | 'admin';

// Role hierarchy: user < editor < author < admin
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  editor: 2,
  author: 3,
  admin: 4,
};

// Dashboard access permissions
export const DASHBOARD_PERMISSIONS: Record<UserRole, DashboardType[]> = {
  user: ['user'],
  editor: ['user', 'editor'],
  author: ['user', 'editor', 'author'],
  admin: ['user', 'editor', 'author', 'admin'],
};

/**
 * Check if a user with a given role can access a specific dashboard
 */
export function canAccessDashboard(userRole: UserRole, dashboard: DashboardType): boolean {
  const permissions = DASHBOARD_PERMISSIONS[userRole];
  return permissions?.includes(dashboard) || false;
}

/**
 * Get all dashboards accessible to a specific role
 */
export function getAccessibleDashboards(userRole: UserRole): DashboardType[] {
  return DASHBOARD_PERMISSIONS[userRole] || [];
}

/**
 * Get the default dashboard for a role
 */
export function getDefaultDashboard(): string {
  return '/dashboard';
}

export interface NavItem {
  name: string;
  path: string;
  role: DashboardType;
  description: string;
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(userRole: UserRole): NavItem[] {
  const allNavItems: NavItem[] = [
    {
      name: 'User',
      path: '/dashboard',
      role: 'user',
      description: 'Main user dashboard',
    },
    {
      name: 'Editor',
      path: '/dashboard',
      role: 'editor',
      description: 'Content editing workspace',
    },
    {
      name: 'Author',
      path: '/dashboard',
      role: 'author',
      description: 'Content creation workspace',
    },
    {
      name: 'Admin',
      path: '/dashboard',
      role: 'admin',
      description: 'Administrative panel',
    },
  ];

  // Filter to only show accessible dashboards
  return allNavItems.filter(item => canAccessDashboard(userRole, item.role));
}

/**
 * Get user role from token or storage
 */
export function getUserRole(): UserRole {
  const role = localStorage.getItem('role') || sessionStorage.getItem('role');
  return (role as UserRole) || 'user';
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    user: 'User',
    editor: 'Editor',
    author: 'Author',
    admin: 'Administrator',
  };
  return displayNames[role] || 'User';
}

/**
 * Check if role is higher than another role
 */
export function isRoleHigherThan(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

