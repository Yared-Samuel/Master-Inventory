import { authenticateUser } from "@/lib/middleware/authMiddleware";
import { sendSuccess } from "@/lib/utils/responseHandler";

async function handler(req, res) {
  try {
    // Return user info from the request object (added by authenticateUser)
    return sendSuccess(res, "Authentication check successful", {
      authenticated: true,
      user: {
        id: req.user.id,
        role: req.user.role,
        companyId: req.user.companyId,
      }
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return sendSuccess(res, "Authentication debug info", {
      authenticated: false,
      error: error.message || "Unknown error",
      cookies: req.cookies || {},
      hasToken: !!req.cookies?.token
    });
  }
}

export default authenticateUser(handler); 