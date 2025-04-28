import connect from "@/lib/db";
import { getInventoryModel, getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import {
  sendSuccess,
  sendError,
  sendBadRequest,
} from "@/lib/utils/responseHandler";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import {
  checkInventoryAvailability,
  checkInventoryAvailabilityToStore,
  getPurchasePrice,
  getSellingPrice,
} from "@/lib/inventory/inventoryUtils";
import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { withUsageTracking } from "@/lib/middleware/usageMiddleware";

async function handler(req, res) {
  try {
    await connect();
    const Transaction = getInventoryModel();
    const Product = getProductModel();
    const { method, body } = req;

    // Get company ID and role from authenticated user
    const userId = req.user.id;
    const companyId = req.user.companyId;
    const userRole = req.user.role;

    switch (method) {
      case "POST":
        return await handleTransferTransaction(body, userId, companyId, userRole, res, Product);
      case "GET":
        return await getTransferTransactions(req, res, Transaction, companyId, userRole);
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error("Transaction API Error:", error);
    return sendError(res, error);
  }
}

async function handleTransferTransaction(body, userId, companyId, userRole, res, Product) {
  const { 
    productId, 
    quantity,
    measurementType,
    fromStore, 
    toStore, 
    date 
  } = body;

  // Validate input
  if (!validateTransferInput(productId, quantity, fromStore, toStore)) {
    return sendBadRequest(res, "All fields are required and must be valid!");
  }

  // Apply company filter based on user role
  const companyFilter = userRole === 'admin' ? {} : { companyId: companyId };
  

  // Get product details with appropriate company filtering
  const product = await Product.findOne({
    _id: productId,
    ...companyFilter
  });
  
  if (!product) {
    return sendBadRequest(res, "Product not found or access denied");
  }

  // Check if product has sub-measurement units defined

  const subUnitsPerMainUnit = product.sub_measurment_value || 1;

  // Calculate actual quantity in sub-units
  let actualQuantityInSubUnits;
  if (measurementType === "main") {
    // Convert from main to sub units
    actualQuantityInSubUnits = quantity * subUnitsPerMainUnit;
  } else {
    actualQuantityInSubUnits = quantity
  }

  // Check inventory availability with company ID
  const inventoryCheck = await checkInventoryAvailability(
    productId,
    fromStore,
    actualQuantityInSubUnits,
    "done",
    companyId
  );
  
  const inventoryCheckReceive = await checkInventoryAvailabilityToStore(
    productId,
    toStore,
    "done",
    companyId
  );
  
  if (!inventoryCheck.success || !inventoryCheckReceive.success) {
    // Format error message with proper units
    let errorMessage = inventoryCheck.success 
      ? inventoryCheckReceive.message 
      : inventoryCheck.message;
      
    if (!inventoryCheck.success && product.sub_measurment_value == 1) {
      const availableInSubUnits = inventoryCheck.available || 0;
      const { wholeUnits, remainderSubUnits } = convertSubUnitsToWholeUnits(
        availableInSubUnits,
        subUnitsPerMainUnit
      );

      const formattedInventory = wholeUnits > 0 && remainderSubUnits > 0
        ? `${wholeUnits} ${product.measurment_name} and ${remainderSubUnits} ${product.sub_measurment_name}`
        : wholeUnits > 0
          ? `${wholeUnits} ${product.measurment_name}`
          : `${remainderSubUnits} ${product.sub_measurment_name}`;
          
      errorMessage = `Insufficient inventory. Only ${formattedInventory} available.`;
    }
    
    return sendBadRequest(res, errorMessage);
  }



 // get purchase price to calculate total price

  const purchasePrice = await getPurchasePrice(productId, companyId)
  if (!purchasePrice.success) {
    return sendBadRequest(res, purchasePrice.message);
  }


  
  // Calculate total price
  const totalPrice =  purchasePrice.unitPrice * actualQuantityInSubUnits

  // Calculate new remaining values in sub-units
  const currentInventoryInSubUnits = inventoryCheck.remaining;
  const newRemainingInSubUnits = currentInventoryInSubUnits - actualQuantityInSubUnits;
  
  const currentReceivingInventory = inventoryCheckReceive.remaining;
  const newReceivingInventory = currentReceivingInventory + actualQuantityInSubUnits;

  // Create transactions
  const send = await createTransferTransaction({
    productId,
    quantity: actualQuantityInSubUnits,
    fromStore,
    totalPrice,
    remaining: newRemainingInSubUnits,
    remainingBeforeTransfer: currentInventoryInSubUnits,
    date: date || new Date(),
    userId,
    companyId: companyId,
    transactionType: "send",
  });
  
  const receive = await createTransferTransaction({
    productId,
    quantity: actualQuantityInSubUnits,
    fromStore: toStore,
    totalPrice,
    remaining: newReceivingInventory,
    remainingBeforeTransfer: currentReceivingInventory,
    date: date || new Date(),
    userId,
    companyId: companyId,
    transactionType: "receive",
  });

  return sendSuccess(res, "Transfer transaction successful", {
    send,
    receive
  }, 201);
}

async function getTransferTransactions(req, res, Transaction, companyId, userRole) {
  try {
    // Apply company filter based on user role
    const companyFilter = userRole === 'admin'
      ? {} 
      : { companyId: companyId };

    // Build query with appropriate company filtering
    const query = {
      transactionType: { $in: ["send", "receive"] },
      status: "done",
      ...companyFilter // Apply company filter conditionally
    };

    // Add date filtering if provided
    if (req.query.startDate) {
      query.date = query.date || {};
      query.date.$gte = new Date(req.query.startDate);
    }

    if (req.query.endDate) {
      query.date = query.date || {};
      query.date.$lte = new Date(req.query.endDate);
    }

    // Get transactions with appropriate filtering
    const transactions = await Transaction.find(query)
      .sort("-createdAt")
      .populate("productId", "name measurment_name sub_measurment_name sub_measurment_value")
      .populate("fromStore", "name")
      .populate("user", "name");

    return sendSuccess(res, "Transfer transactions retrieved successfully", transactions);
  } catch (error) {
    console.error("Get transfer error:", error);
    return sendError(res, error);
  }
}

// Helper function to create transfer transactions
async function createTransferTransaction({
  productId,
  quantity,
  fromStore,
  totalPrice,
  remaining,
  remainingBeforeTransfer,
  date,
  userId,
  companyId,
  transactionType,
}) {
  const Transaction = getInventoryModel();
  
  const newTransfer = new Transaction({
    transactionType,
    status: "done",
    productId: new ObjectId(productId),
    quantity,
    fromStore: new ObjectId(fromStore),
    totalPrice: totalPrice || 0,
    remaining,
    remainingBeforeTransfer,
    date: date || new Date(),
    user: new ObjectId(userId),
    companyId: new ObjectId(companyId) // Add company ID to transaction
  });

  return await newTransfer.save();
}

// Helper function to validate transfer input
function validateTransferInput(productId, quantity, fromStore, toStore) {
  return (
    isValidObjectId(productId) &&
    isValidObjectId(fromStore) &&
    isValidObjectId(toStore) &&
    fromStore !== toStore &&
    typeof quantity === "number" &&
    quantity > 0
  );
}

// Wrap handler with both middlewares
export default withTenant(withUsageTracking(protectRoute([
  "admin",
  "company_admin",
  "storeMan",
  "barMan",
  "finance",
  "user",
])(handler)));
