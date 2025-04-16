import connect from "@/lib/db";
import { getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendCreated, sendBadRequest, sendNotFound } from "@/lib/utils/responseHandler";

async function handler(req, res) {
  try {
    await connect();
    const Product = getProductModel();
    const { method } = req;

    switch (method) {
      case "GET": {
        // Apply company filter based on user role
        const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
        
        // Find all products for the user's company
        const products = await Product.find({...companyFilter,  isActive: true })
          .sort("-createdAt");
          
        return sendSuccess(res, "Products retrieved successfully", products);
      }
      
      // You can add more HTTP methods here if needed
      // case "POST": { ... }
      // case "PUT": { ... }
      
      default:
        return sendBadRequest(res, `Method ${method} Not Allowed`);
    }
  } catch (error) {
    return sendError(res, error);
  }
}

export default protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance'])(handler);