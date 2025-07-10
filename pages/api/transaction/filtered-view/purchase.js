import connect from "@/lib/db";
import { getInventoryModel, getProductModel, getStoreListModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendCreated, sendBadRequest } from "@/lib/utils/responseHandler";
import { withTenant } from "@/lib/middleware/tenantMiddleware";


async function handler(req, res) {
  try {
  await connect();
    const Transaction = getInventoryModel();
    const Product = getProductModel();
    const StoreList = getStoreListModel();
    const { method } = req;
  
  switch (method) {

      case "GET":
        return await getPurchaseTransactions(req, res, Transaction);
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error('Purchase API Error:', error);
    return sendError(res, error);
  }
}



async function getPurchaseTransactions(req, res, Transaction) {
  try {
    // Filter by company for non-admin users
    const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
    const { startDate, endDate } = req.query;
    
    const  query = {
      ...companyFilter,
      transactionType: "purchase"
    }
    if(startDate && endDate){
        const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
      query.date = {
        $gte: start,
        $lte: end
      }
    } else if(!startDate && !endDate){
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }
    

    const transactions = await Transaction.find(query)
    .populate("productId", "name measurment_name sub_measurment_name sub_measurment_value")
    .populate("fromStore", "name")
    .populate("user", "name")
          .sort("-createdAt")
    .lean();
    
    return sendSuccess(res, "Purchase transactions retrieved successfully", transactions);
      } catch (error) {
    console.error('Get Purchase Transactions Error:', error);
    return sendError(res, error);
  }
}

// Allow admin, company_admin, and regular users to perform purchases
export default withTenant(protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler));
