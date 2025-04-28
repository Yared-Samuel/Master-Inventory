import { getProductModel } from "@/lib/models";
import connect from "@/lib/db";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendBadRequest, sendNotFound } from "@/lib/utils/responseHandler";
import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { withUsageTracking } from "@/lib/middleware/usageMiddleware";

async function handler(req, res) {
  try {
    await connect();
    
    const Product = getProductModel();
    const { method, query } = req;
    const { id } = query;
    
    if (!id) {
      return sendBadRequest(res, "Product ID is required");
    }
    
    // For non-admin users, ensure they can only access products from their company
    const filter = {
      _id: id,
      ...(req.user.role !== 'admin' ? { companyId: req.user.companyId } : {})
    };
    
    switch (method) {
      case "GET":
        const product = await Product.findOne(filter);
        
        if (!product) {
          return sendNotFound(res, "Product not found");
        }
        
        return sendSuccess(res, "Product retrieved successfully", product);
        
      case "PUT":
        const updates = req.body;
        
        // Validate selling_price array if provided
        if (updates.selling_price) {
          // Ensure it's an array
          if (!Array.isArray(updates.selling_price)) {
            return sendBadRequest(res, "selling_price must be an array");
          }
          
          // Validate each entry in the selling_price array
          for (const price of updates.selling_price) {
            if (!price.storeId) {
              return sendBadRequest(res, "Each selling price must have a storeId");
            }
            if (typeof price.price_sub_measurment !== 'number') {
              return sendBadRequest(res, "Each selling price must have a valid price_sub_measurment");
            }
            // price_main_measurment is optional
          }
        }
        
        // Validate used_products array if provided
        if (updates.used_products) {
          // Ensure it's an array
          if (!Array.isArray(updates.used_products)) {
            return sendBadRequest(res, "used_products must be an array");
          }
          
          // Validate each entry in the used_products array
          for (const component of updates.used_products) {
            if (!component.productId) {
              return sendBadRequest(res, "Each component must have a productId");
            }
            if (typeof component.quantity !== 'number' || component.quantity <= 0) {
              return sendBadRequest(res, "Each component must have a valid quantity");
            }
          }
        }
        
        try {
          const updatedProduct = await Product.findOneAndUpdate(
            filter,
            updates,
            { new: true, runValidators: true }
          );
          
          if (!updatedProduct) {
            return sendNotFound(res, "Product not found or you don't have permission to update it");
          }
          
          return sendSuccess(res, "Product updated successfully", updatedProduct);
        } catch (error) {
          return sendBadRequest(res, `Error updating product: ${error.message}`);
        }
        
      case "DELETE":
        // Soft delete by setting isActive to false
        const deactivatedProduct = await Product.findOneAndUpdate(
          filter,
          { isActive: false },
          
        );
        
        if (!deactivatedProduct) {
          return sendNotFound(res, "Product not found or you don't have permission to delete it");
        }
        
        return sendSuccess(res, "Product deactivated successfully");
        
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error("Product API error:", error);
    return sendError(res, error.message || "Error processing request");
  }
}

// Wrap handler with both middlewares
export default withTenant(withUsageTracking(protectRoute(['admin', 'company_admin', 'storeMan'])(handler)));
