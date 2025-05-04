import { getUserModel } from '@/lib/models';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { sendSuccess, sendError } from '@/lib/utils/responseHandler';
import { withTenant } from "@/lib/middleware/tenantMiddleware";

async function handler(req, res) {
  try {
    const User = getUserModel();
    const userData = await getDataFromToken(req.cookies.token);
    if (!userData) {
      return sendSuccess(res, "User not logged in", { isLoggedIn: false });
    }
    
    const user = await User.findById(userData.id).select('-password').populate('companyId');
    if (!user) {
      return sendSuccess(res, "User not found", { isLoggedIn: false });
    }
    
    return sendSuccess(res, "User is logged in", { 
      isLoggedIn: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId._id,
        companyName: user.companyId.name,
        store: (["storeMan", "barMan"].includes(user.role) && user.store && user.store._id) ? user.store._id : "",
        storeName: (["storeMan", "barMan"].includes(user.role) && user.store && user.store.name) ? user.store.name : "",
      }
    });
  } catch (error) {
    console.error("Login status error:", error);
    return sendError(res, error.message || "Error checking login status");
  }
}

export default withTenant(handler);