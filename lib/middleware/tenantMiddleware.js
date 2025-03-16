import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendError, sendUnauthorized } from "@/lib/utils/responseHandler";
import connect from "@/lib/db";

/**
 * Middleware that enforces tenant separation by adding tenant data to the request
 * and validating that the user has access to the tenant's data
 */
export async function tenantMiddleware(req, res, next) {
  try {
    // Get token from cookies
    const token = req.cookies?.token;
    
    if (!token) {
      return sendUnauthorized(res, "Authentication required");
    }
    
    // Connect to MongoDB
    await connect();
    
    // Extract user and tenant data from token
    const tokenData = await getDataFromToken(token);
    
    if (!tokenData.success) {
      return sendUnauthorized(res, tokenData.error || "Invalid authentication");
    }
    
    // Add tenant context to request
    req.user = {
      id: tokenData.id,
      role: tokenData.role,
      companyId: tokenData.companyId
    };
    
    // If next is provided, it's being used as middleware
    if (typeof next === 'function') {
      return next();
    }
    
    // Otherwise, it's being used as a wrapper function, so return req and res
    return { req, res };
  } catch (error) {
    console.error("Tenant middleware error:", error);
    if (typeof next === 'function') {
      return sendError(res, error);
    }
    throw error; // Re-throw for wrapper usage
  }
}

/**
 * Wrapper function that applies tenant middleware to API handlers
 */
export function withTenant(handler) {
  return async (req, res) => {
    try {
      const result = await tenantMiddleware(req, res);
      if (!result) return; // Response already sent
      return handler(req, res);
    } catch (error) {
      return sendError(res, error);
    }
  };
}

/**
 * Helper function to validate that a request includes the correct tenant data
 */
export function validateTenantAccess(req, targetCompanyId) {
  // If user is system admin (role='admin'), allow cross-tenant access
  if (req.user.role === 'admin') {
    return true;
  }
  
  // Otherwise ensure the request is for user's own tenant
  return req.user.companyId.toString() === targetCompanyId.toString();
} 