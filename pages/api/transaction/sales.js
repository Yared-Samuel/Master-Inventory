import connect from "@/lib/db";
import { getInventoryModel, getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import {
  sendSuccess,
  sendError,
  sendBadRequest,
} from "@/lib/utils/responseHandler";
import {
  checkInventoryAvailability,
  getSellingPrice,
  isValidQuantity,
  isValidObjectId,
  convertSubUnitsToWholeUnits,
  convertDecimalToWholeUnitsAndRemainder,
  formatRemainingInventory,
  calculateInventoryChangeInSubUnits,
  encodeQuantityForStorage,
  decodeQuantityFromStorage,
  calculateInventoryOperation,
} from "@/lib/inventory/inventoryUtils";

async function handler(req, res) {
  try {
    await connect();
    const Transaction = getInventoryModel();
    const Product = getProductModel();
    const { method, body } = req;

    switch (method) {
      case "POST":
        return await handleSalesTransaction(
          body,
          req.user.id,
          req.user.companyId,
          req.user.role,
          res,
          Transaction,
          Product
        );
      case "GET":
        return await getSalesTransactions(req, res, Transaction, req.user.companyId, req.user.role);
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error("Sales API Error:", error);
    return sendError(res, error);
  }
}

async function handleSalesTransaction(body, userId, companyId, userRole, res, Transaction, Product) {
  const {
    productId,
    quantity,
    measurementType,
    fromStore,
    date,
  } = body;


  // Validate input
  if (!isValidObjectId(productId) || !isValidObjectId(fromStore)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product or store ID",
    });
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

  // Validate measurement type
  if (
    measurementType === "sub" &&
    (!product.sub_measurment_name || !product.sub_measurment_value)
  ) {
    return res.status(400).json({
      success: false,
      message: "This product does not have sub-measurement units defined",
    });
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
  

  // Check inventory availability with company ID filter
  const inventoryCheck = await checkInventoryAvailability(
    productId,
    fromStore,
    actualQuantityInSubUnits,
    "done", // Changed from "sub" to "done" since "done" is the correct status used in checkInventoryAvailability
    companyId  // Add company ID parameter
  );

  if (!inventoryCheck.success) {
    // Format error message with proper units
    let errorMessage = inventoryCheck.success ? inventoryCheck.message : inventoryCheck.message;
      
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

  // Get selling price
  const priceDetails = await getSellingPrice(fromStore, productId, companyId);
  if (!priceDetails.success || !priceDetails.price) {
    return res.status(400).json(priceDetails);
  }

  // Calculate total price
  // If price is stored per main unit, we need to convert back
  const totalPrice = actualQuantityInSubUnits * priceDetails.price

// Calculate new remaining values in sub-units
const currentInventoryInSubUnits = inventoryCheck.remaining;
const newRemainingInSubUnits = currentInventoryInSubUnits - actualQuantityInSubUnits;



  // Ensure we use the correct company ID for the transaction
  // For admins viewing other companies' data, use the product's company ID
  const transactionCompanyId = product.companyId || companyId;

  // Create transaction - always store in sub-units when available
  const transaction = await Transaction.create({
    transactionType: "sale",
    status: "done",
    productId,
    quantity: actualQuantityInSubUnits, // Always store in sub-units
    totalPrice,
    remaining: newRemainingInSubUnits, // Always store remaining in sub-units
    remainingBeforeTransfer: currentInventoryInSubUnits,
    fromStore,
    date: date || new Date(),
    user: userId,
    companyId: transactionCompanyId, // Use appropriate company ID
  });
    await transaction.save()
  return res.status(201).json({
    success: true,
    message: `Successfully sold!`,
    data: transaction,
  });
}

async function getSalesTransactions(req, res, Transaction, companyId, userRole) {
  try {
    // Apply company filter based on user role

    const companyFilter = userRole === 'admin'
      ? {} 
      : { companyId: companyId };
    
    // Build query with appropriate company filtering
    const query = {
      transactionType: "sale",
      status: "done",
      ...companyFilter // Apply company filter conditionally
    };

    // Filter by store if provided
    if (req.query.storeId && isValidObjectId(req.query.storeId)) {
      query.fromStore = new ObjectId(req.query.storeId);
    }

    // Filter by product if provided
    if (req.query.productId && isValidObjectId(req.query.productId)) {
      query.productId = new ObjectId(req.query.productId);
    }

    // Date range filtering
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
      .populate(
        "productId",
        "name measurment_name sub_measurment_name sub_measurment_value"
      )
      .populate("fromStore", "name")
      .populate("user", "name");

    // Format transactions to include measurement information
    const formattedTransactions = transactions.map((transaction) => {
      const transactionObj = transaction.toObject();

      // If we need to decode the quantity from the encoded format
      if (
        transaction.quantity !== undefined &&
        transaction.productId?.sub_measurment_value
      ) {
        const product = transaction.productId;
        const subUnitsPerMainUnit = product.sub_measurment_value;

        // Decode the quantity
        const decoded = decodeQuantityFromStorage(
          transaction.quantity,
          subUnitsPerMainUnit
        );

        // Format the quantity
        let formattedQuantity = `${decoded.wholeUnits} ${product.measurment_name}`;
        if (decoded.remainderSubUnits > 0) {
          formattedQuantity += ` and ${decoded.remainderSubUnits} ${product.sub_measurment_name}`;
        }

        transactionObj.formattedQuantity = formattedQuantity;
        transactionObj.decodedWholeUnits = decoded.wholeUnits;
        transactionObj.decodedRemainderSubUnits = decoded.remainderSubUnits;

        // Also decode the remaining quantity
        if (transaction.remaining !== undefined) {
          const decodedRemaining = decodeQuantityFromStorage(
            transaction.remaining,
            subUnitsPerMainUnit
          );

          let formattedRemaining = `${decodedRemaining.wholeUnits} ${product.measurment_name}`;
          if (decodedRemaining.remainderSubUnits > 0) {
            formattedRemaining += ` and ${decodedRemaining.remainderSubUnits} ${product.sub_measurment_name}`;
          }

          transactionObj.formattedRemaining = formattedRemaining;
        }

        return transactionObj;
      }

      // Fallback to original behavior for older records
      if (
        transaction.measurementType === "sub" &&
        transaction.originalQuantity &&
        transaction.productId
      ) {
        // For sub-measurements (bottles), show both original quantity and main unit equivalent
        const product = transaction.productId;
        const mainUnitValue = transaction.quantity;
        const subUnitValue = transaction.originalQuantity;

        transactionObj.formattedQuantity = `${subUnitValue} ${product.sub_measurment_name} (${mainUnitValue} ${product.measurment_name})`;
      } else if (
        transaction.measurementType === "main" &&
        transaction.productId
      ) {
        // For main measurements (crates), show the quantity with unit
        const product = transaction.productId;
        transactionObj.formattedQuantity = `${transaction.quantity} ${product.measurment_name}`;
      } else {
        // Fallback to just the quantity
        transactionObj.formattedQuantity = `${transaction.quantity}`;
      }

      return transactionObj;
    });

    // Calculate summary information
    const summary = {
      totalTransactions: formattedTransactions.length,
      totalQuantity: formattedTransactions.reduce((sum, t) => {
        // If we have decoded values, use those for the summary
        if (t.decodedWholeUnits !== undefined) {
          const product = t.productId;
          if (product && product.sub_measurment_value) {
            // Convert to sub-units for accurate counting
            const totalSubUnits =
              t.decodedWholeUnits * product.sub_measurment_value +
              (t.decodedRemainderSubUnits || 0);
            return sum + totalSubUnits / product.sub_measurment_value;
          }
        }
        return sum + t.quantity;
      }, 0),
      totalSales: formattedTransactions.reduce(
        (sum, t) => sum + t.totalPrice,
        0
      ),
      productCountMap: {},
      storeCountMap: {},
    };

    // Count by product and store
    formattedTransactions.forEach((t) => {
      if (t.productId) {
        const productName = t.productId.name;
        const quantityToAdd =
          t.decodedWholeUnits !== undefined
            ? t.decodedWholeUnits + t.decodedRemainderSubUnits / 100
            : t.quantity;

        summary.productCountMap[productName] =
          (summary.productCountMap[productName] || 0) + quantityToAdd;
      }

      if (t.fromStore) {
        const storeName = t.fromStore.name;
        const quantityToAdd =
          t.decodedWholeUnits !== undefined
            ? t.decodedWholeUnits + t.decodedRemainderSubUnits / 100
            : t.quantity;

        summary.storeCountMap[storeName] =
          (summary.storeCountMap[storeName] || 0) + quantityToAdd;
      }
    });

    return res.status(200).json({
      success: true,
      data: formattedTransactions,
      summary,
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sales transactions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// // Helper functions
// async function createSalesTransaction(
//   {
//     productId,
//     quantity,
//     fromStore,
//     totalPrice,
//     remaining,
//     remainingBeforeTransfer,
//     date,
//     userId,
//     companyId
//   },
//   Transaction
// ) {
//   const newSales = new Transaction({
//     transactionType: "sale",
//     status: "done",
//     productId: new ObjectId(productId),
//     quantity,
//     fromStore: new ObjectId(fromStore),
//     totalPrice: totalPrice || 0,
//     remaining,
//     remainingBeforeTransfer: remainingBeforeTransfer || remaining,
//     date: date || new Date(),
//     user: new ObjectId(userId),
//     companyId: new ObjectId(companyId)
//   });

//   return await newSales.save();
// }

// Allow admin, company_admin, and regular users to perform sales
export default protectRoute([
  "admin",
  "company_admin",
  "storeMan",
  "barMan",
  "finance",
  
])(handler);
