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
    isValidObjectId,
    convertSubUnitsToWholeUnits,
    getPurchasePrice,
  } from "@/lib/inventory/inventoryUtils";

import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { withUsageTracking } from "@/lib/middleware/usageMiddleware";

  async function handler(req, res) {
    try {
        await connect();
        const Transaction = getInventoryModel();
        const Product = getProductModel();
        const { method, body } = req;
     
        switch (method) {
            case "GET":
                return await handleGetAllUse(Transaction, req.user.companyId, req.user.role, res);
            case "POST":
                return await handleUseTransaction(body, req.user.id, req.user.companyId, req.user.role, res, Transaction, Product);
            default:
                return sendBadRequest(res, "Method not allowed");
        }
    } catch (error) {
        console.error("Use API Error:", error);
        return sendError(res, error);
        }
  }

  async function handleUseTransaction(entries, userId, companyId, userRole, res, Transaction, Product) {
    // Ensure entries is an array (handle both single entry and multiple entries)
    const useEntries = Array.isArray(entries) ? entries : [entries];
    
    // Apply company filter based on user role
    const companyFilter = userRole === 'admin' ? {} : { companyId: companyId };
    
    const results = [];
    const errors = [];

    // Process each entry
    for (const entry of useEntries) {
      const {
          productId,
          quantity,
          measurementType,
          fromStore,
          date,
      } = entry;

      try {
        // Validate input
        if(!isValidObjectId(productId) || !isValidObjectId(fromStore)){
          errors.push(`Invalid product or store ID for entry with product ${productId}`);
          continue;
        }

        // Get product details with appropriate company filtering
        const product = await Product.findOne({
          _id: productId,
          ...companyFilter
        });
        
        if (!product) {
          errors.push(`Product not found or access denied for entry with product ${productId}`);
          continue;
        }

        // Validate measurement type
        if (
          measurementType === "sub" &&
          (!product.sub_measurment_name || !product.sub_measurment_value)
        ) {
          errors.push(`Product ${product.name} does not have sub-measurement units defined`);
          continue;
        }

        // Check if product has sub-measurement units defined
        const subUnitsPerMainUnit = product.sub_measurment_value || 1;

        // Calculate actual quantity in sub-units
        let actualQuantityInSubUnits;
        if (measurementType === "main") {
          // Convert from main to sub units
          actualQuantityInSubUnits = quantity * subUnitsPerMainUnit;
        } else {
          actualQuantityInSubUnits = quantity;
        }
      
        // Check inventory availability with company ID filter
        const inventoryCheck = await checkInventoryAvailability(
          productId,
          fromStore,
          actualQuantityInSubUnits,
          "done",
          companyId
        );
        if (!inventoryCheck.success) {
          // Format error message with proper units
          let errorMessage = inventoryCheck.message;
            
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
                
            errorMessage = `Insufficient inventory for ${product.name}. Only ${formattedInventory} available.`;
          }    
          
          errors.push(errorMessage);
          continue;
        }

        // get purchase price to calculate total price
        const purchasePrice = await getPurchasePrice(productId, companyId);
        if (!purchasePrice.success) {
          errors.push(`Could not get purchase price for product ${product.name}: ${purchasePrice.message}`);
          continue;
        }

        // Calculate total price
        const totalPrice = purchasePrice.unitPrice * actualQuantityInSubUnits;

        // Calculate new remaining values in sub-units
        const currentInventoryInSubUnits = inventoryCheck.remaining;
        const newRemainingInSubUnits = currentInventoryInSubUnits - actualQuantityInSubUnits;

        // Ensure we use the correct company ID for the transaction
        const transactionCompanyId = product.companyId || companyId;
        const transaction = await Transaction.create({
          transactionType: "use",
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
        
        await transaction.save();
        results.push(transaction);

      } catch (error) {
        console.error("Error processing entry:", error);
        errors.push(`Error processing entry for product ${productId}: ${error.message}`);
      }
    }

    // If no transactions were created and there are errors, return a failure response
    if (results.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to process any use transactions",
        errors
      });
    }

    // If some transactions were successful but there were also errors, return partial success
    if (results.length > 0 && errors.length > 0) {
      return res.status(207).json({ // Using 207 Multi-Status for partial success
        success: true,
        message: `Successfully used ${results.length} products with ${errors.length} errors`,
        data: results,
        errors
      });
    }

    // All transactions were successful
    return res.status(201).json({
      success: true,
      message: `Successfully used ${results.length} products!`,
      data: results
    });
  }

  async function handleGetAllUse(Transaction, companyId, userRole, res) {
    const companyFilter = userRole === 'admin' ? {} : { companyId };
    const transactions = await Transaction.find({ 
      transactionType: "use",
      ...companyFilter
    })
    .sort("-createdAt")
      .populate(
        "productId",
        "name measurment_name sub_measurment_name sub_measurment_value"
      )
      .populate("fromStore", "name")
      .populate("user", "name");
    return res.status(200).json({
      success: true,
      data: transactions
    })
  } 

  // Wrap handler with both middlewares
  export default withTenant(withUsageTracking(protectRoute([
    "admin",
    "company_admin",
    "storeMan",
    "barMan",
    "finance",
    
  ])(handler)));