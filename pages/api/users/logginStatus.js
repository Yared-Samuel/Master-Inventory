import { getUserModel } from '@/lib/models';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { sendSuccess, sendError } from '@/lib/utils/responseHandler';

export default async function logginStatus(req, res) {
  try {
    const User = getUserModel();
    const userData = await getDataFromToken(req);
    
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
        companyName: user.companyId.name
      }
    });
  } catch (error) {
    console.error("Login status error:", error);
    return sendError(res, error.message || "Error checking login status");
  }
}