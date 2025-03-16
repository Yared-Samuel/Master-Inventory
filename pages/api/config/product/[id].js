import { getProductModel } from "@/lib/models";
import connect from "@/lib/db";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendBadRequest, sendNotFound } from "@/lib/utils/responseHandler";

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
        
        const updatedProduct = await Product.findOneAndUpdate(
          filter,
          updates,
          { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
          return sendNotFound(res, "Product not found or you don't have permission to update it");
        }
        
        return sendSuccess(res, "Product updated successfully", updatedProduct);
        
      case "DELETE":
        // Soft delete by setting isActive to false
        const deactivatedProduct = await Product.findOneAndUpdate(
          filter,
          { isActive: false },
          { new: true }
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

export default protectRoute(['admin', 'company_admin', 'storeMan'])(handler);
