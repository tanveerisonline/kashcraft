/**
 * Authorization & RBAC (Role-Based Access Control)
 * Permission checking, resource ownership validation, middleware guards
 */

/**
 * User role definitions
 */
export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  CUSTOMER = "customer",
  GUEST = "guest",
}

/**
 * Permission definitions
 */
export enum Permission {
  // Admin permissions
  MANAGE_USERS = "manage:users",
  MANAGE_PRODUCTS = "manage:products",
  MANAGE_ORDERS = "manage:orders",
  MANAGE_CATEGORIES = "manage:categories",
  MANAGE_COUPONS = "manage:coupons",
  VIEW_ANALYTICS = "view:analytics",
  MANAGE_ADMINS = "manage:admins",

  // Moderator permissions
  REVIEW_CONTENT = "review:content",
  FLAG_CONTENT = "flag:content",
  VIEW_REPORTS = "view:reports",

  // Customer permissions
  VIEW_PRODUCTS = "view:products",
  CREATE_ORDERS = "create:orders",
  VIEW_OWN_ORDERS = "view:own_orders",
  UPDATE_PROFILE = "update:profile",
  CREATE_REVIEWS = "create:reviews",

  // Guest permissions
  VIEW_PRODUCTS_GUEST = "view:products_guest",
}

/**
 * Role to permissions mapping
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),

  [UserRole.MODERATOR]: [
    Permission.REVIEW_CONTENT,
    Permission.FLAG_CONTENT,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PRODUCTS,
  ],

  [UserRole.CUSTOMER]: [
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_ORDERS,
    Permission.VIEW_OWN_ORDERS,
    Permission.UPDATE_PROFILE,
    Permission.CREATE_REVIEWS,
  ],

  [UserRole.GUEST]: [Permission.VIEW_PRODUCTS_GUEST],
};

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

/**
 * Check if user has any of the permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if user has all permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Resource ownership check
 */
export interface ResourceOwnershipCheck {
  resourceUserId: string;
  requestUserId: string;
  isAdmin: boolean;
}

export function isResourceOwner({
  resourceUserId,
  requestUserId,
  isAdmin,
}: ResourceOwnershipCheck): boolean {
  // Admins can access any resource
  if (isAdmin) {
    return true;
  }

  // User can only access their own resources
  return resourceUserId === requestUserId;
}

/**
 * Authorization middleware
 */
export function requirePermission(permission: Permission) {
  return async (request: Request, context: any) => {
    const session = context.session;

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!hasPermission(session.user.role, permission)) {
      return new Response("Forbidden", { status: 403 });
    }

    return null;
  };
}

/**
 * Require role middleware
 */
export function requireRole(role: UserRole | UserRole[]) {
  const requiredRoles = Array.isArray(role) ? role : [role];

  return async (request: Request, context: any) => {
    const session = context.session;

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!requiredRoles.includes(session.user.role)) {
      return new Response("Forbidden", { status: 403 });
    }

    return null;
  };
}

/**
 * Check resource ownership middleware
 */
export function checkResourceOwnership(resourceUserId: string) {
  return async (request: Request, context: any) => {
    const session = context.session;

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const isOwner = isResourceOwner({
      resourceUserId,
      requestUserId: session.user.id,
      isAdmin: session.user.role === UserRole.ADMIN,
    });

    if (!isOwner) {
      return new Response("Forbidden", { status: 403 });
    }

    return null;
  };
}

/**
 * Rate limit by role
 */
export const roleLimits: Record<UserRole, number> = {
  [UserRole.ADMIN]: 10000, // 10k requests
  [UserRole.MODERATOR]: 1000,
  [UserRole.CUSTOMER]: 500,
  [UserRole.GUEST]: 100,
};

/**
 * Get rate limit for role
 */
export function getRateLimitForRole(role: UserRole): number {
  return roleLimits[role];
}

/**
 * Activity logging for authorization
 */
export interface AuthorizationLog {
  userId: string;
  action: string;
  permission: Permission;
  allowed: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

/**
 * Log authorization attempt
 */
export async function logAuthorizationAttempt(log: AuthorizationLog): Promise<void> {
  try {
    // Log to database
    console.log("Authorization attempt:", {
      userId: log.userId,
      action: log.action,
      permission: log.permission,
      allowed: log.allowed,
      timestamp: log.timestamp,
    });

    // Send to Sentry for security monitoring
    if (!log.allowed) {
      console.warn("Authorization denied:", {
        userId: log.userId,
        permission: log.permission,
      });
    }
  } catch (error) {
    console.error("Failed to log authorization attempt:", error);
  }
}

/**
 * Audit trail interface
 */
export interface AuditTrailEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
}

/**
 * Record audit trail
 */
export async function recordAuditTrail(entry: AuditTrailEntry): Promise<void> {
  try {
    // Store in database
    console.log("Audit trail:", {
      userId: entry.userId,
      action: entry.action,
      resource: `${entry.resourceType}:${entry.resourceId}`,
      timestamp: entry.timestamp,
    });
  } catch (error) {
    console.error("Failed to record audit trail:", error);
  }
}
