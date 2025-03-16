import connect from "@/lib/db";
import { getSellingPriceModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import mongoose from "mongoose";
import { sendSuccess, sendError, sendBadRequest, sendNotFound } from "@/lib/utils/responseHandler";

async function handler(req, res) {
  const { method, query: { id }, body } = req;

  // Connect to the database
  await connect();
  const Sprice = getSellingPriceModel();

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendBadRequest(res, "Invalid price list ID format");
  }

  // Get the company filter for non-admin users
  const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };

  switch (method) {
    case "GET": {
      try {
        // Add company filter for security
        const priceList = await Sprice.findOne({
          _id: id,
          ...companyFilter
        })
          .populate("products.product", "name")
          .populate("user", "name")
          .lean();
          
        if (!priceList) {
          return sendNotFound(res, "Price list not found");
        }
        
        return sendSuccess(res, "Price list retrieved successfully", priceList);
      } catch (error) {
        console.error("Error fetching price list:", error);
        return sendError(res, error);
      }
    }

    case "PUT": {
      try {
        const { name, products, isActive } = body;

        // Validate required fields
        if (!name) {
          return sendBadRequest(res, "Price list name is required");
        }
        
        if (products !== undefined && (!Array.isArray(products) || products.length === 0)) {
          return sendBadRequest(res, "At least one product is required");
        }

        // Validate product IDs and selling prices if provided
        if (products) {
          const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
          const invalidProducts = products.filter(
            item => !isValidObjectId(item.product) || 
            typeof item.sellingPrice !== 'number' || 
            isNaN(item.sellingPrice)
          );
          
          if (invalidProducts.length > 0) {
            return sendBadRequest(res, "Invalid product data. All products must have valid IDs and numeric selling prices");
          }
        }

        // Check if price list exists and belongs to user's company
        const priceExists = await Sprice.findOne({
          _id: id,
          ...companyFilter
        });
        
        if (!priceExists) {
          return sendNotFound(res, "Price list not found or you don't have permission to modify it");
        }
        
        // Prepare update data
        const updateData = { name };
        if (products) updateData.products = products;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        // Update price list
        const updatedPrice = await Sprice.findByIdAndUpdate(
          id,
          {
            ...updateData,
            updatedBy: req.user.id,
            updatedAt: Date.now()
          },
          { new: true, runValidators: true }
        )
        .populate("products.product", "name")
        .populate("user", "name");
        
        return sendSuccess(res, "Price list updated successfully", updatedPrice);
      } catch (error) {
        console.error("Error updating price list:", error);
        return sendError(res, error);
      }
    }

    case "DELETE": {
      try {
        // Check if price list exists and belongs to user's company
        const priceList = await Sprice.findOne({
          _id: id,
          ...companyFilter
        });
        
        if (!priceList) {
          return sendNotFound(res, "Price list not found or you don't have permission to delete it");
        }
        
        // Soft delete - mark as inactive instead of actually deleting
        await Sprice.findByIdAndUpdate(id, {
          isActive: false,
          updatedBy: req.user.id,
          updatedAt: Date.now()
        });
        
        return sendSuccess(res, "Price list deactivated successfully");
      } catch (error) {
        console.error("Error deleting price list:", error);
        return sendError(res, error);
      }
    }

    default:
      return sendBadRequest(res, `Method ${method} not allowed`);
  }
}

// Use our new protectRoute middleware with allowed roles
// Temporarily allow all roles for testing
export default protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler); 