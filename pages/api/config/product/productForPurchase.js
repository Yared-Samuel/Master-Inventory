import connect from "@/lib/db";
import { getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendBadRequest } from "@/lib/utils/responseHandler";
import { withTenant } from "@/lib/middleware/tenantMiddleware";

async function handler(req, res) {
  try {
    await connect();
    const Product = getProductModel();
    const { method } = req;

    switch (method) {
      case "GET": {
        // Get products for the current company only
        // Note: For admin users, the company filter won't be applied due to our middleware
        const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
        const products = await Product.find({
          ...companyFilter,
          type: { $ne: 'forSale' }, // $ne means "not equal to" - excludes products of type 'finished'
          isActive: true
        })
          .lean(); // Converts Mongoose documents to plain JavaScript objects - more memory efficient and faster        
        return sendSuccess(res, "Products retrieved successfully", products);
      }

  

      default:
        return sendBadRequest(res, `Method ${method} Not Allowed`);
    }
  } catch (error) {
    return sendError(res, error);
  }
}

// Wrap handler with both middlewares
export default withTenant(protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler));
