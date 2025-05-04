import { authenticateUser } from "./authMiddleware";
import { sendForbidden } from "@/lib/utils/responseHandler";

/**
 * Middleware to restrict access based on user roles
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the endpoint
 * @returns {Function} Middleware function
 */


/**
 * Middleware to ensure users can only access data from their own company
 * This would be applied after authenticateUser middleware
 */
export function enforceCompanyRestriction(handler) {
  return async (req, res) => {
    // Admin can access everything
    if (req.user?.role === 'admin') {
      return handler(req, res);
    }
    
    // For company_admin and other roles, enforce company restriction
    // Modify the request to ensure company filtering
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      console.log("Company restriction: No companyId found in user data");
      return sendForbidden(res, "Company information missing");
    }
    
    // Add a company filter to all query operations
    // The actual handler must use this for MongoDB queries
    req.companyFilter = { companyId };
    
    console.log(`Company restriction applied: User ${req.user.id} restricted to company ${companyId}`);
    return handler(req, res);
  };
}

/**
 * Alternative implementation that doesn't use nested middleware chains
 * This approach is simpler and less error-prone
 */
export function protectRoute(allowedRoles = []) {
  return (handler) => {
    return async (req, res) => {
      try {
        // Get token from cookies
        const token = req.cookies?.token;
        if (!token) {
          console.log("protectRoute: No token found");
          return sendForbidden(res, "Authentication required");
        }
        
        // Extract user data from token
        const { verifyToken } = require("@/actions/jwt");
        // Verify token
        const { valid, decoded, error } = verifyToken(token);
        
        if (!valid) {
          console.log(`protectRoute: Token invalid: ${error}`);
          return sendForbidden(res, error || "Invalid authentication");
        }
        
        // Add user info to request object
        req.user = {
          id: decoded.id,
          role: decoded.role,
          companyId: decoded.companyId
        };
        
        
        // Admin role has access to everything
        if (req.user.role === 'admin') {
          return handler(req, res);
        }
        
        // Check if user's role is in the allowed roles
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
          console.log(`protectRoute: User role ${req.user.role} not in allowed roles:`, allowedRoles);
          return sendForbidden(res, "You don't have permission to access this resource");
        }
        
        // For non-admin users, enforce company restriction
        if (!req.user.companyId) {
          console.log("protectRoute: No companyId found in user data");
          return sendForbidden(res, "Company information missing");
        }
        
        // Add company filter to request
        req.companyFilter = { companyId: req.user.companyId };
        
        // All checks passed, allow access
        return handler(req, res);
      } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return sendForbidden(res, "Access control error");
      }
    };
  };
} 