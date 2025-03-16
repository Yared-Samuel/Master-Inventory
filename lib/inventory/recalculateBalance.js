import connect from "@/lib/db";
import { getInventoryModel, getProductModel } from "@/lib/models";
import { 
  encodeQuantityForStorage,
  convertSubUnitsToWholeUnits
} from "./inventoryUtils";

/**
 * Recalculates the balance for a specific product in a specific store
 * 
 * @param {string} productId - The ID of the product to recalculate
 * @param {string} storeId - The ID of the store to recalculate for
 * @returns {Promise<Object>} - Result object with success status and data
 */
export async function recalculateProductBalance(productId, storeId) {
  try {
    await connect();
    
    const Product = getProductModel();
    const Transaction = getInventoryModel();
    
    // Fetch the product to get measurement details
    const product = await Product.findById(productId);
    if (!product) {
      return { 
        success: false, 
        message: "Product not found" 
      };
    }
    
    const subUnitsPerMainUnit = product.sub_measurment_value || 1;
    
    // Get the latest transaction for this product/store
    const latestTransaction = await Transaction.findOne({
      productId,
      fromStore: storeId,
      status: 'done'
    }).sort({ createdAt: -1 });
    
    if (!latestTransaction) {
      return { 
        success: false, 
        message: "No transactions found for this product in this store" 
      };
    }
    
    // Calculate the correct balance by aggregating all transactions
    const transactions = await Transaction.find({
      productId,
      fromStore: storeId,
      status: 'done',
      createdAt: { $lte: latestTransaction.createdAt }
    }).sort({ createdAt: 1 });
    
    let runningBalance = 0;
    
    for (const tx of transactions) {
      if (tx.transactionType === "purchase") {
        runningBalance += parseFloat(tx.quantity) || 0;
      } else if (tx.transactionType === "sales") {
        runningBalance -= parseFloat(tx.quantity) || 0;
      }
    }
    
    // Ensure we don't have negative balance
    runningBalance = Math.max(0, runningBalance);
    
    // Convert to whole units and remainder
    const { wholeUnits, remainderSubUnits } = convertSubUnitsToWholeUnits(
      runningBalance, 
      subUnitsPerMainUnit
    );
    
    // Encode for storage
    const encodedBalance = encodeQuantityForStorage(
      wholeUnits,
      remainderSubUnits,
      subUnitsPerMainUnit
    );
    
    // Update the latest transaction with the correct values
    await Transaction.updateOne(
      { _id: latestTransaction._id },
      { 
        $set: {
          remaining: encodedBalance
        }
      }
    );
    
    // Format for display in the response only
    const formattedRemaining = formatDisplayQuantity(
      wholeUnits,
      remainderSubUnits,
      product.measurment_name,
      product.sub_measurment_name
    );
    
    return {
      success: true,
      message: "Balance recalculated successfully",
      data: {
        productId,
        storeId,
        encodedBalance,
        formattedRemaining,
        wholeUnits, // Include in response for display purposes
        remainderSubUnits // Include in response for display purposes
      }
    };
  } catch (error) {
    console.error("Error recalculating balance:", error);
    return {
      success: false,
      message: "Error recalculating balance",
      error: error.message
    };
  }
}

/**
 * Recalculates balances for all products in all stores
 * 
 * @returns {Promise<Object>} - Result object with success status and data
 */
export async function recalculateAllBalances() {
  try {
    await connect();
    
    const Transaction = getInventoryModel();
    
    // Get all distinct product/store combinations
    const combinations = await Transaction.aggregate([
      { $match: { status: 'done' } },
      { 
        $group: { 
          _id: { 
            productId: "$productId", 
            storeId: "$fromStore" 
          } 
        } 
      }
    ]);
    
    const results = {
      total: combinations.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Process each combination
    for (const combo of combinations) {
      const { productId, storeId } = combo._id;
      
      const result = await recalculateProductBalance(productId, storeId);
      
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          productId,
          storeId,
          error: result.message
        });
      }
    }
    
    return {
      success: true,
      message: `Recalculated ${results.successful} balances, ${results.failed} failed`,
      data: results
    };
  } catch (error) {
    console.error("Error recalculating all balances:", error);
    return {
      success: false,
      message: "Error recalculating all balances",
      error: error.message
    };
  }
}

// Helper function to format display strings
function formatDisplayQuantity(wholeUnits, remainderSubUnits, mainUnit, subUnit) {
  let displayText = `${wholeUnits} ${mainUnit}`;
  if (remainderSubUnits > 0 && subUnit) {
    displayText += ` and ${remainderSubUnits} ${subUnit}`;
  }
  return displayText;
}