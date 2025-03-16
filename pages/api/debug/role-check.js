import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess } from "@/lib/utils/responseHandler";

async function handler(req, res) {
  // This handler will only be called if the role check passes
  return sendSuccess(res, "Role check passed", {
    user: {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId
    },
    companyFilter: req.companyFilter || {}
  });
}

// Only admin and company_admin should be able to access this
export default protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler); 