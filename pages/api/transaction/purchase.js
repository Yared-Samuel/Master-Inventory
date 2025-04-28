import connect from "@/lib/db";
import { getInventoryModel, getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendCreated, sendBadRequest } from "@/lib/utils/responseHandler";
import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { withUsageTracking } from "@/lib/middleware/usageMiddleware";


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
    // Request body contains purchase data from frontend
    const { 
      productId,
      quantity,
      totalPrice,
      fromStore,
      tin,
      date
    } = req.body;
    
    // Validation
    if (!productId || !fromStore || !quantity) {
      return sendBadRequest(res, "Product ID, store ID, and quantity are required");
    }
    
    // Get product details
    const product = await Product.findOne({ 
      _id: productId,
      companyId: req.user.companyId // Ensure product belongs to user's company
    });
    
    const sub_measurment_value = product.sub_measurment_value;

    
    // Ensure quantity is a number
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return sendBadRequest(res, "Quantity must be a positive number");
    }
    
    const quantityInSubUnit = parsedQuantity * sub_measurment_value;

    if (!product) {
      return sendBadRequest(res, "Product not found or doesn't belong to your company");
    }
    const lastTransaction = await Transaction.findOne({
      companyId: req.user.companyId,
      fromStore: fromStore,
      productId: productId,
      status: "done",
    }, 'remaining remainingBeforeTransfer')
    .sort({ createdAt: -1 });

    let prevRemaining = 0
    let currRemaining = 0

    if(!lastTransaction){
      currRemaining = quantityInSubUnit
      prevRemaining = 0
    }else {
      currRemaining = lastTransaction.remaining + quantityInSubUnit
      prevRemaining = lastTransaction.remaining
    }
    
    // Create purchase transaction matching the schema and frontend data
    const transaction = new Transaction({
      transactionType: "purchase",
      status: "done", 
      quantity: quantityInSubUnit,
      totalPrice: totalPrice,
      remainingBeforeTransfer: prevRemaining,
      remaining: currRemaining, // Set initial remaining value equal to quantity
      fromStore,
      productId,
      tin: tin || null,
      date: date ? new Date(date) : new Date(),
      user: req.user.id,
      companyId: req.user.companyId
    });
    
    await transaction.save();
    
    return sendCreated(res, "Purchase transaction successful", {
      _id: transaction._id,
      productName: product.name,
      quantity: quantityInSubUnit,
      totalPrice: transaction.totalPrice,
      date: transaction.date
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getPurchaseTransactions(req, res, Transaction) {
  try {
    // Filter by company for non-admin users
    const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
    const transactions = await Transaction.find({
      ...companyFilter,
      transactionType: "purchase"
    })
    .populate("productId", "name measurment_name sub_measurment_name sub_measurment_value")
    .populate("fromStore", "name")
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
export default withTenant(withUsageTracking(protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler)));
