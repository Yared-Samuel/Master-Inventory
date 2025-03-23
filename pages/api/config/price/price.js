import connect from "@/lib/db";
import { getSellingPriceModel, getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendBadRequest, sendCreated } from "@/lib/utils/responseHandler";

async function handler(req, res) {
  try {
  await connect();
    const Sprice = getSellingPriceModel();
    const Product = getProductModel();
    
    const { method } = req;
    console.log(`Processing ${method} request for price API`);

  switch (method) {
    case "POST": {
        const { name, products } = req.body;
        
        if (!name || !products) {
          return sendBadRequest(res, "Name and products are required");
        }

        const newPrice = new Sprice({
          name,
          products,
          user: req.user.id,
          companyId: req.user.companyId
        });

        const savedPrice = await newPrice.save();
        return sendCreated(res, "Price list created successfully", savedPrice);
      }

      case "GET": {
        const filter = req.user.role === 'admin'
          ? {} 
          : { companyId: req.user.companyId };

        const priceLists = await Sprice.find(filter)
          .populate("products.product", "name measurment_name")
          .populate("user", "name")
          .sort("-createdAt");

        return sendSuccess(res, "Price lists retrieved successfully", priceLists);
      }

      case "PUT": {
        const { id } = req.query;
        const updates = req.body;

        if (!id) {
          return sendBadRequest(res, "Price list ID is required");
        }

        const filter = {
          _id: id,
          ...(req.user.role !== 'admin' ? { companyId: req.user.companyId } : {})
        };

        const updatedPrice = await Sprice.findOneAndUpdate(
          filter,
          updates,
          { new: true }
        ).populate("products.product", "name measurment_name");

        if (!updatedPrice) {
          return sendBadRequest(res, "Price list not found or access denied");
        }

        return sendSuccess(res, "Price list updated successfully", updatedPrice);
      }

      case "DELETE": {
        const { id } = req.query;

        if (!id) {
          return sendBadRequest(res, "Price list ID is required");
        }

        const filter = {
          _id: id,
          ...(req.user.role !== 'admin' ? { companyId: req.user.companyId } : {})
        };

        await Sprice.findOneAndUpdate(filter, { isActive: false });
        return sendSuccess(res, "Price list deactivated successfully");
      }

      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error("Price API error:", error);
    return sendError(res, error.message || "Something went wrong");
  }
}

export default protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler);
