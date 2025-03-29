import connect from "@/lib/db";
import { getStoreListModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError,  sendBadRequest } from "@/lib/utils/responseHandler";



async function handler(req, res) {
  try {
  await connect();
    const StoreList = getStoreListModel();
    const { method, query, body } = req;

  switch (method) {
   

      case "GET": {
        // Get stores for the current company only or all stores for admin
        const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
        
        const stores = await StoreList.find({
          ...companyFilter,
          subStore: true,
          mainStore: false
        }).lean();
        
        return sendSuccess(res, "Stores retrieved successfully", stores);
      }

 

      default:
        return sendBadRequest(res, `Method ${method} Not Allowed`);
    }
      } catch (error) {
    return sendError(res, error);
  }
}

// Use our new protectRoute middleware with allowed roles
// Temporarily allow all roles for testing
export default protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler);
