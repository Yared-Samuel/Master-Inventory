import connect from "@/lib/db";
import { getIdFromToken } from "@/lib/getDataFromToken";
import { sendSuccess, sendError, sendBadRequest } from "@/lib/utils/responseHandler";
import { 
  recalculateProductBalance,
  recalculateAllBalances
} from "@/lib/inventory/recalculateBalance";

export default async function handler(req, res) {
  try {
    const { method, cookies, query, body } = req;
    const token = cookies?.token;
    const userId = await getIdFromToken(token);
    
    // Only allow admin access
    if (!userId.success || userId.role !== 'admin') {
      return sendBadRequest(res, "Unauthorized access. Admin rights required.");
    }
    
    await connect();

    switch(method) {
      case "POST":
        // Recalculate all balances or a specific product/store
        if (body.productId && body.storeId) {
          return await recalculateSingle(req, res);
        } else {
          return await recalculateAll(req, res);
        }
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error("Error handling recalculation request:", error);
    return sendError(res, error);
  }
}

async function recalculateSingle(req, res) {
  try {
    const { productId, storeId } = req.body;
    
    if (!productId || !storeId) {
      return sendBadRequest(res, "Product ID and Store ID are required");
    }
    
    const result = await recalculateProductBalance(productId, storeId);
    
    if (!result.success) {
      return sendBadRequest(res, result.message);
    }
    
    return sendSuccess(
      res, 
      "Balance recalculated successfully", 
      result.data
    );
  } catch (error) {
    console.error("Error recalculating single balance:", error);
    return sendError(res, error);
  }
}

async function recalculateAll(req, res) {
  try {
    const result = await recalculateAllBalances();
    
    if (!result.success) {
      return sendBadRequest(res, result.message);
    }
    
    return sendSuccess(
      res, 
      result.message, 
      result.data
    );
  } catch (error) {
    console.error("Error recalculating all balances:", error);
    return sendError(res, error);
  }
} 