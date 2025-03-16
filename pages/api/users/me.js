import connect from "@/lib/db";
import User from "@/models/userModel";
import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { sendSuccess, sendError } from "@/lib/utils/responseHandler";

async function handler(req, res) {
  try {
    const { method } = req;
    
    if (method !== "GET") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
    
    await connect();
    
    // Get user information (withTenant middleware already adds user to req)
    const { id, role, companyId } = req.user;
    
    // Fetch complete user data if needed
    const user = await User.findById(id)
      .select('-password')
      .populate('companyId', 'name isActive subscription');
    
    return sendSuccess(res, "User information retrieved successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: {
        _id: user.companyId._id,
        name: user.companyId.name,
        isActive: user.companyId.isActive,
        subscription: user.companyId.subscription
      },
      lastLogin: user.lastLogin
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// Wrap handler with tenant middleware
export default withTenant(handler); 