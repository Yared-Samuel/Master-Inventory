import connect from "@/lib/db";
import { getInventoryModel, getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendBadRequest } from "@/lib/utils/responseHandler";
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
  calculateInventoryOperation
} from "@/lib/inventory/inventoryUtils";

async function handler(req, res) {
  try {
  await connect();
    const Transaction = getInventoryModel();
    const Product = getProductModel();
    const { method, body } = req;

  switch (method) {
    case "POST":
        return await handleSalesTransaction(body, req.user.id, res, Transaction, Product);
      case "GET":
        return await getSalesTransactions(req, res, Transaction);
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error('Sales API Error:', error);
    return sendError(res, error);
  }
}

async function handleSalesTransaction(body, userId, res, Transaction, Product) {
  const { productId, quantity, originalQuantity, measurementType, fromStore, date } = body;

  // Parse quantities to ensure they're numbers
  const parsedOriginalQuantity = originalQuantity ? Number(originalQuantity) : null;

  // Validate input
  if (!isValidObjectId(productId) || !isValidObjectId(fromStore)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid product or store ID" 
    });
  }

  if (!parsedOriginalQuantity || isNaN(parsedOriginalQuantity) || parsedOriginalQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid quantity value"
    });
  }

  // Get product details to verify measurement units
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  // Validate measurement type
  if (measurementType === 'sub' && (!product.sub_measurment_name || !product.sub_measurment_value)) {
    return res.status(400).json({
      success: false,
      message: "This product does not have sub-measurement units defined"
    });
  }

  // Initialize variables for inventory calculations
  let actualQuantityInSubUnits;
  let displayQuantity;
  const subUnitsPerMainUnit = product.sub_measurment_value || 1;

  if (measurementType === 'main') {
    // For main unit (crates), convert to sub-units
    actualQuantityInSubUnits = parsedOriginalQuantity * subUnitsPerMainUnit;
    displayQuantity = `${parsedOriginalQuantity} ${product.measurment_name}`;
  } else {
    // For sub-unit (bottles), use the quantity directly
    actualQuantityInSubUnits = parsedOriginalQuantity;
    
    // Calculate how many whole crates and remaining bottles
    const { wholeUnits, remainderSubUnits } = convertSubUnitsToWholeUnits(
      parsedOriginalQuantity, 
      subUnitsPerMainUnit
    );
    
    // Format display quantity
    if (wholeUnits > 0 && remainderSubUnits > 0) {
      displayQuantity = `${wholeUnits} ${product.measurment_name} and ${remainderSubUnits} ${product.sub_measurment_name}`;
    } else if (wholeUnits > 0) {
      displayQuantity = `${wholeUnits} ${product.measurment_name}`;
    } else {
      displayQuantity = `${remainderSubUnits} ${product.sub_measurment_name}`;
    }
  }

  // Calculate sold quantity in whole units and remainder
  const soldQuantityResult = convertSubUnitsToWholeUnits(
    actualQuantityInSubUnits,
    subUnitsPerMainUnit
  );
  
  // Encode quantity for database storage in custom format (e.g., 1.06 for 1 crate and 6 bottles)
  const encodedSoldQuantity = encodeQuantityForStorage(
    soldQuantityResult.wholeUnits,
    soldQuantityResult.remainderSubUnits,
    subUnitsPerMainUnit
  );

  // For inventory check, we still use the decimal value
  const actualQuantityInMainUnits = actualQuantityInSubUnits / subUnitsPerMainUnit;

  // Check inventory availability
  const inventoryCheck = await checkInventoryAvailability(productId, fromStore, actualQuantityInMainUnits);
  if (!inventoryCheck.success) {
    // Format available inventory for error message
    const availableInMain = inventoryCheck.available || 0;
    const formattedInventory = formatRemainingInventory(availableInMain, product);
    
    return res.status(400).json({
      success: false,
      message: `Insufficient inventory. Only ${formattedInventory.formattedRemaining} available.`
    });
  }

  // Get selling price
  const priceDetails = await getSellingPrice(fromStore, productId);
  if (!priceDetails.success) {
    return res.status(400).json(priceDetails);
  }

  // Calculate total price (based on the main unit conversion)
  const totalPrice = priceDetails.price * actualQuantityInMainUnits;
  
  // Calculate new remaining inventory with the custom base system
  const currentInventoryValue = inventoryCheck.remaining;
  
  // Calculate new remaining value using our custom encoding
  const inventoryResult = calculateInventoryOperation(
    currentInventoryValue,
    actualQuantityInSubUnits,
    subUnitsPerMainUnit,
    false // isAddition = false (we're subtracting)
  );
  
  // Get components for display
  const wholeUnits = inventoryResult.wholeUnits;
  const remainderSubUnits = inventoryResult.remainderSubUnits;
  const newRemainingEncoded = inventoryResult.encodedValue;
  
  // Format for display
  let formattedRemaining = `${wholeUnits} ${product.measurment_name}`;
  if (remainderSubUnits > 0) {
    formattedRemaining += ` and ${remainderSubUnits} ${product.sub_measurment_name}`;
  }
  
  // Create transaction
  const transaction = await createSalesTransaction({
    productId,
    quantity: encodedSoldQuantity, // Store in our custom encoding format
    originalQuantity: parsedOriginalQuantity,
    measurementType,
    measurementUnit: measurementType === 'main' ? product.measurment_name : product.sub_measurment_name,
    conversionRate: subUnitsPerMainUnit,
    fromStore,
    totalPrice,
    remaining: newRemainingEncoded, // Store in our custom encoding format
    date: date || new Date(),
    userId
  }, Transaction);

  return res.status(201).json({
    success: true,
    message: `Successfully sold ${displayQuantity}. Remaining: ${formattedRemaining}`,
    data: transaction
  });
}

async function getSalesTransactions(req, res, Transaction) {
  try {
    // Build query
    const query = {
      transactionType: 'sale',
      status: 'done'
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

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort("-createdAt")
      .populate("productId", "name measurment_name sub_measurment_name sub_measurment_value")
      .populate("fromStore", "name")
      .populate("user", "name");

    // Format transactions to include measurement information
    const formattedTransactions = transactions.map(transaction => {
      const transactionObj = transaction.toObject();
      
      // If we need to decode the quantity from the encoded format
      if (transaction.quantity !== undefined && transaction.productId?.sub_measurment_value) {
        const product = transaction.productId;
        const subUnitsPerMainUnit = product.sub_measurment_value;
        
        // Decode the quantity
        const decoded = decodeQuantityFromStorage(transaction.quantity, subUnitsPerMainUnit);
        
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
          const decodedRemaining = decodeQuantityFromStorage(transaction.remaining, subUnitsPerMainUnit);
          
          let formattedRemaining = `${decodedRemaining.wholeUnits} ${product.measurment_name}`;
          if (decodedRemaining.remainderSubUnits > 0) {
            formattedRemaining += ` and ${decodedRemaining.remainderSubUnits} ${product.sub_measurment_name}`;
          }
          
          transactionObj.formattedRemaining = formattedRemaining;
        }
        
        return transactionObj;
      }
      
      // Fallback to original behavior for older records
      if (transaction.measurementType === 'sub' && transaction.originalQuantity && transaction.productId) {
        // For sub-measurements (bottles), show both original quantity and main unit equivalent
        const product = transaction.productId;
        const mainUnitValue = transaction.quantity;
        const subUnitValue = transaction.originalQuantity;
        
        transactionObj.formattedQuantity = `${subUnitValue} ${product.sub_measurment_name} (${mainUnitValue} ${product.measurment_name})`;
      } else if (transaction.measurementType === 'main' && transaction.productId) {
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
            const totalSubUnits = (t.decodedWholeUnits * product.sub_measurment_value) + 
                                 (t.decodedRemainderSubUnits || 0);
            return sum + (totalSubUnits / product.sub_measurment_value);
          }
        }
        return sum + t.quantity;
      }, 0),
      totalSales: formattedTransactions.reduce((sum, t) => sum + t.totalPrice, 0),
      productCountMap: {},
      storeCountMap: {}
    };
    
    // Count by product and store
    formattedTransactions.forEach(t => {
      if (t.productId) {
        const productName = t.productId.name;
        const quantityToAdd = t.decodedWholeUnits !== undefined ? 
          t.decodedWholeUnits + (t.decodedRemainderSubUnits / 100) : t.quantity;
          
        summary.productCountMap[productName] = (summary.productCountMap[productName] || 0) + quantityToAdd;
      }
      
      if (t.fromStore) {
        const storeName = t.fromStore.name;
        const quantityToAdd = t.decodedWholeUnits !== undefined ? 
          t.decodedWholeUnits + (t.decodedRemainderSubUnits / 100) : t.quantity;
          
        summary.storeCountMap[storeName] = (summary.storeCountMap[storeName] || 0) + quantityToAdd;
      }
    });

    return res.status(200).json({
      success: true,
      data: formattedTransactions,
      summary
    });
  } catch (error) {
    console.error('Get sales error:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sales transactions",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper functions
async function createSalesTransaction({
  productId,
  quantity,
  originalQuantity,
  measurementType,
  measurementUnit,
  conversionRate,
  fromStore,
  totalPrice,
  remaining,
  date,
  userId
}, Transaction) {
      const newSales = new Transaction({
        transactionType: "sale",
        status: "done",
        productId: new ObjectId(productId),
    quantity,            // Store decimal form for calculations
    originalQuantity,
    measurementType,
    measurementUnit,
    conversionRate,
        fromStore: new ObjectId(fromStore),
        totalPrice,
    remaining,           // Store decimal form for calculations
    date,
    user: userId
  });

  return await newSales.save();
}

// Allow admin, company_admin, and regular users to perform sales
export default protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler);
