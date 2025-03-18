import connect from "@/lib/db";
import { getStoreListModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendCreated, sendBadRequest, sendNotFound } from "@/lib/utils/responseHandler";

const validateStoreData = (data) => {
  const { name, mainStore, subStore } = data;
  
  if (!name || mainStore === undefined || subStore === undefined) {
    throw { statusCode: 400, message: "Name, mainStore, and subStore are required fields!" };
  }
  
  // Convert string booleans to actual booleans if needed
  if (typeof mainStore === 'string') {
    data.mainStore = mainStore === 'true';
  }
  
  if (typeof subStore === 'string') {
    data.subStore = subStore === 'true';
  }
};

async function handler(req, res) {
  try {
  await connect();
    const StoreList = getStoreListModel();
    const { method, query, body } = req;

  switch (method) {
    case "POST": {
        validateStoreData(body);
        
        // Create store with user and company ID from authenticated user
        const store = await StoreList.create({
          ...body,
          user: req.user.id,
          companyId: req.user.companyId // Add companyId from authenticated user
        });
        
        return sendCreated(res, "Store created successfully", store);
      }

      case "GET": {
        // Get stores for the current company only or all stores for admin
        const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
        
        const stores = await StoreList.find(companyFilter)
          .sort("-createdAt")
          .populate("user", "name")
          .lean();
        
        return sendSuccess(res, "Stores retrieved successfully", stores);
      }

      case "PUT": {
        const { id } = query;
        const { name, operator, description, mainStore, subStore, isActive } = body;

        if (!id || !name) {
          return sendBadRequest(res, "Missing required fields");
        }

        // Make sure the store belongs to the user's company
        const store = await StoreList.findOne({ 
          _id: id,
          companyId: req.user.companyId 
        });
        
        if (!store) {
          return sendNotFound(res, "Store not found");
        }

        // Prepare update data
        const updateData = { name };
        if (operator !== undefined) updateData.operator = operator;
        if (description !== undefined) updateData.description = description;
        if (mainStore !== undefined) updateData.mainStore = mainStore === 'true' || mainStore === true;
        if (subStore !== undefined) updateData.subStore = subStore === 'true' || subStore === true;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        // Update the store
        const updatedStore = await StoreList.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        );

        return sendSuccess(res, "Store updated successfully", updatedStore);
      }

      case "DELETE": {
        const { id } = query;
        
        if (!id) {
          return sendBadRequest(res, "Store ID is required");
        }
        
        // Make sure the store belongs to the user's company
        const store = await StoreList.findOne({ 
          _id: id,
          companyId: req.user.companyId 
        });
        
        if (!store) {
          return sendNotFound(res, "Store not found");
        }
        
        // Instead of deleting, mark as inactive
        await StoreList.findByIdAndUpdate(id, { isActive: false });
        
        return sendSuccess(res, "Store successfully deactivated");
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
