import { getStoreListModel } from "@/lib/models";
import connect from "@/lib/db";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendBadRequest, sendNotFound } from "@/lib/utils/responseHandler";
import { ObjectId } from "mongodb";

const validateStoreData = (data) => {
  const { name, Sprice, mainStore, subStore } = data;
  
  if (!name) {
    throw { statusCode: 400, message: "Name field is required!" };
  }
  
  if (mainStore && Sprice) {
    throw { statusCode: 400, message: "Both main store and selling price not allowed!" };
  }
  
  if (subStore && !Sprice) {
    throw { statusCode: 400, message: "Selling price is required for sub store!" };
  }
  
  if (mainStore && subStore) {
    throw { statusCode: 400, message: "Only one store type can be selected" };
  }
  
  if (!mainStore && !subStore) {
    throw { statusCode: 400, message: "Please select a store type (Main Store or Sub Store)" };
  }
};

async function handler(req, res) {
  try {
    await connect();
    
    const StoreList = getStoreListModel();
    const { method, query } = req;
    const { id } = query;
    
    if (!id) {
      return sendBadRequest(res, "Store ID is required");
    }
    
    // For non-admin users, ensure they can only access stores from their company
    const filter = {
      _id: id,
      ...(req.user.role !== 'admin' ? { companyId: req.user.companyId } : {})
    };
    
    switch (method) {
      case "GET":
        const store = await StoreList.findOne(filter);
        
        if (!store) {
          return sendNotFound(res, "Store not found");
        }
        
        return sendSuccess(res, "Store retrieved successfully", store);
        
      case "PUT":
        const updates = req.body;
        
        const updatedStore = await StoreList.findOneAndUpdate(
          filter,
          updates,
          { new: true, runValidators: true }
        );
        
        if (!updatedStore) {
          return sendNotFound(res, "Store not found or you don't have permission to update it");
        }
        
        return sendSuccess(res, "Store updated successfully", updatedStore);
        
      case "DELETE":
        // Soft delete by setting isActive to false
        const deactivatedStore = await StoreList.findOneAndUpdate(
          filter,
          { isActive: false },
          { new: true }
        );
        
        if (!deactivatedStore) {
          return sendNotFound(res, "Store not found or you don't have permission to delete it");
        }
        
        return sendSuccess(res, "Store deactivated successfully");
        
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error("Store API error:", error);
    return sendError(res, error.message || "Error processing request");
  }
}

export default protectRoute(['admin', 'company_admin', 'storeMan'])(handler); 