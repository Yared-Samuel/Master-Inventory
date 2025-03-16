import connect from "@/lib/db";
import { getInventoryModel, getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendCreated, sendBadRequest } from "@/lib/utils/responseHandler";
import { 
  checkInventoryAvailability, 
  isValidQuantity, 
  isValidObjectId,
  convertSubUnitsToWholeUnits,
  encodeQuantityForStorage,
  decodeQuantityFromStorage,
  calculateInventoryOperation
} from "@/lib/inventory/inventoryUtils";

async function handler(req, res) {
  try {
    await connect();
    const Transaction = getInventoryModel();
    const Product = getProductModel();
    const { method } = req;

    switch (method) {
      case "POST":
        return await handlePurchaseTransaction(req, res, Transaction, Product);
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

async function handlePurchaseTransaction(req, res, Transaction, Product) {
  try {
    // Request body contains all purchase data
    const { 
      quantity,
      productId,
      storeId,
      measurementType,
      originalQuantity,
      // Additional fields
      price,
      supplier,
      notes 
    } = req.body;
    
    // Validation
    if (!productId || !storeId || !quantity) {
      return sendBadRequest(res, "Product ID, store ID, and quantity are required");
    }
    
    // Ensure quantity is a number
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return sendBadRequest(res, "Quantity must be a positive number");
    }
    
    // Get product details (needed for measurement handling)
    const product = await Product.findOne({ 
      _id: productId,
      companyId: req.user.companyId // Ensure product belongs to user's company
    });
    
    if (!product) {
      return sendBadRequest(res, "Product not found or doesn't belong to your company");
    }
    
    // Calculate the actual quantity in sub-units
    let subUnitQuantity = parsedQuantity;
    let displayQuantity = parsedQuantity;
    
    // Format the display quantity based on measurement type
    if (measurementType === 'main' && product.sub_measurment_value) {
      // If main units specified (e.g., crates), convert to sub-units (e.g., bottles)
      subUnitQuantity = parsedQuantity * product.sub_measurment_value;
      displayQuantity = `${originalQuantity || parsedQuantity} ${product.measurment_name}`;
    } else {
      // Using sub-units directly (e.g., individual bottles)
      displayQuantity = `${parsedQuantity} ${product.sub_measurment_name || product.measurment_name}`;
    }
    
    // Encode the purchased quantity for storage
    const encodedQuantity = encodeQuantityForStorage(parsedQuantity, product);
    
    // Create purchase transaction
    const transaction = new Transaction({
      type: "purchase",
      productId,
      storeId,
      quantity: subUnitQuantity, // Store the actual sub-unit quantity
      encodedQuantity, // Store the custom encoded quantity
      displayQuantity, // Store formatted display quantity
      user: req.user.id,
      companyId: req.user.companyId,
      // Additional fields
      price: price || 0,
      supplier,
      notes
    });
    
    await transaction.save();
    
    return sendCreated(res, "Purchase transaction successful", {
      _id: transaction._id,
      productName: product.name,
      quantity: displayQuantity,
      encodedQuantity,
      decodedQuantity: decodeQuantityFromStorage(encodedQuantity, product),
      price: transaction.price,
      date: transaction.createdAt
    });
  } catch (error) {
    console.error('Handle Purchase Error:', error);
    return sendError(res, error);
  }
}

async function getPurchaseTransactions(req, res, Transaction) {
  try {
    // Filter by company for non-admin users
    const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
    
    const transactions = await Transaction.find({
      ...companyFilter,
      type: "purchase"
    })
    .populate("productId", "name measurment_name sub_measurment_name sub_measurment_value")
    .populate("storeId", "name")
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
export default protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler);
