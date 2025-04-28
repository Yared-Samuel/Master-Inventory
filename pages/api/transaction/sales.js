import connect from "@/lib/db";
import { getInventoryModel, getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import {
  sendSuccess,
  sendError,
  sendBadRequest,
} from "@/lib/utils/responseHandler";
import {
  
  checkInventoryAvailabilityForSale,
  isValidObjectId,
  convertSubUnitsToWholeUnits,
  decodeQuantityFromStorage,
} from "@/lib/inventory/inventoryUtils";
import mongoose from "mongoose";

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
  // Start a MongoDB session for transaction atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      productId,
      quantity,
      measurementType,
      fromStore,
      used_products,
      date,
    } = body;

    console.log(used_products)
    
    // Validate input
    if (!isValidObjectId(productId) || !isValidObjectId(fromStore)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid product or store ID",
      });
    }

    // Apply company filter based on user role
    const companyFilter = userRole === 'admin' ? {} : { companyId: companyId };

    // Get the product details
    const product = await Product.findOne({
      _id: productId,
      ...companyFilter
    }).session(session);

    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Product not found or access denied"
      });
    }

    // Validate measurement type
    if (
      measurementType === "sub" &&
      (!product.sub_measurment_name || !product.sub_measurment_value)
    ) {
      await session.abortTransaction();
      session.endSession();
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
  

    // Calculate quantity in main measurement unit if using sub-measurement


    // Check inventory availability
    const inventoryCheck = await checkInventoryAvailabilityForSale(
      productId,
      fromStore,
      actualQuantityInSubUnits,      
      companyId,
      session,
      used_products // Pass the custom used_products from request body
    );

    if (!inventoryCheck.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: inventoryCheck.message || "Insufficient inventory"
      });
    }

    // Determine which used_products to use
    const componentsToUse = used_products && used_products.length > 0 
      ? used_products 
      : (product.used_products || []);

    // Process each component product
    for (const component of componentsToUse) {
      // Skip if product or quantity is null
      if (!component.productId || !component.quantity) {
        continue;
      }
      
      // Get latest inventory record for the component
      const latestInventory = await Transaction.find({
        productId: component.productId,
        fromStore: fromStore,
        status: "done",
        companyId: companyId
      })
      .sort({createdAt: -1})
      .limit(1)
      .session(session);
      
      if (!latestInventory.length) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `No inventory record found for component product ${component.productId}`
        });
      }
      
      // Get the component product details to find its selling price
      const componentProduct = await Product.findOne({
        _id: component.productId,
        ...companyFilter
      }).session(session);
      
      if (!componentProduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Component product ${component.productId} not found or access denied`
        });
      }
      
      // Find the selling price for this store
      const componentPriceDetails = componentProduct.selling_price && 
        componentProduct.selling_price.find(price => price.storeId.toString() === fromStore);
      
      // Calculate unit price from the selling price
      let unitPrice = 0;
      if (componentPriceDetails && componentPriceDetails.price_sub_measurment) {
        unitPrice = componentPriceDetails.price_sub_measurment;
      } else {
        // Fallback to latest purchase if selling price not found
        const latestPurchase = await Transaction.find({
          productId: component.productId,
          transactionType: "purchase",
          status: "done",
          companyId: companyId
        })
        .sort({createdAt: -1})
        .limit(1)
        .session(session);
        
        if (latestPurchase.length > 0) {
          unitPrice = latestPurchase[0].totalPrice / latestPurchase[0].quantity;
        }
      }
      
      // Calculate quantity to use based on the sale quantity
      const componentQuantity = component.quantity * actualQuantityInSubUnits;
      const currentRemaining = latestInventory[0].remaining;
      
      // Verify there's not enough inventory for this component
      if (currentRemaining < componentQuantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for component. Required: ${componentQuantity}, Available: ${currentRemaining}`
        });
      }
      
      // Calculate total price for this component use
      const componentTotalPrice = unitPrice * componentQuantity;
      
      // Create use transaction for this component
      const useTransaction = new Transaction({
        transactionType: "use",
        status: "done",
        productId: component.productId,
        quantity: componentQuantity,
        totalPrice: componentTotalPrice, // Use calculated price from selling price
        remaining: currentRemaining - componentQuantity,
        remainingBeforeTransfer: currentRemaining,
        fromStore: fromStore,
        date: date || new Date(),
        user: userId,
        companyId: companyId
      });
      await useTransaction.save({ session });
      console.log(`Created use transaction for component ${component.productId}, quantity: ${componentQuantity}, unit price: ${unitPrice}, total price: ${componentTotalPrice}`);
    }

    const priceDetails = product.selling_price.find(price => price.storeId.toString() === fromStore);
    if (!priceDetails) {
      await session.abortTransaction();
      session.endSession();
      return sendBadRequest(res, "No selling price of this product found for this store");
    }

    
    
    
    // Calculate total price
    // If price is stored per main unit, we need to convert back
    const totalPrice = actualQuantityInSubUnits * priceDetails.price_sub_measurment

    // Calculate new remaining values in sub-units
    const currentInventoryInSubUnits = inventoryCheck.remaining;
    const newRemainingInSubUnits = currentInventoryInSubUnits - actualQuantityInSubUnits;



    // Ensure we use the correct company ID for the transaction
    // For admins viewing other companies' data, use the product's company ID
    const transactionCompanyId = product.companyId || companyId;

    // Create transaction - always store in sub-units when available
    const transaction = new Transaction({
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
      
    await transaction.save({ session });
    
    // Commit all changes
    await session.commitTransaction();
    session.endSession();
      
    return res.status(201).json({
      success: true,
      message: `Successfully sold!`,
      data: transaction,
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Sales API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing sales transaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
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
      let formattedQuantity = transaction.quantity.toString(); // Default case

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
        formattedQuantity = `${decoded.wholeUnits} ${product.measurment_name}`;
        if (decoded.remainderSubUnits > 0) {
          formattedQuantity += ` ${decoded.remainderSubUnits} ${product.sub_measurment_name}`;
        }
      }

      return {
        ...transactionObj,
        quantity: formattedQuantity,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Sales transactions retrieved successfully",
      data: formattedTransactions,
    });
  } catch (error) {
    console.error("Sales API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving sales transactions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

// Allow admin, company_admin, and regular users to perform sales
export default protectRoute([
  "admin",
  "company_admin",
  "storeMan",
  "barMan",
  "finance",
])(handler);