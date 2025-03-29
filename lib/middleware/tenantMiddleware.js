import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendError, sendUnauthorized } from "@/lib/utils/responseHandler";
import connect from "../db";

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
    // Connect to MongoDB is needed since we need to validate token data
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
    
    // If next is provided, it means this middleware is being used in an Express-style chain
    // Example:
    // app.use(tenantMiddleware); // next is provided by Express
    // vs
    // export default withTenant(handler); // next is not provided, used as wrapper
    // If next is a function, call it to continue the middleware chain
    // This happens when tenantMiddleware is used as Express-style middleware
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
  // This function is a higher-order function that wraps an API route handler with tenant middleware
  // It takes a handler function as an argument and returns a new async function
  return async (req, res) => {
    try {
      // Call the tenant middleware to validate the token and extract tenant info
      // tenantMiddleware will add user/tenant data to req.user if successful
      const result = await tenantMiddleware(req, res);

      // If result is falsy, it means the middleware already sent an error response
      // (e.g. for invalid/missing token), so we return early
      if (!result) return; 

      // If middleware validation passed, call the original handler function
      // with the enhanced request object containing tenant data
      return handler(req, res);
    } catch (error) {
      // If any error occurs during middleware or handler execution,
      // send a formatted error response
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