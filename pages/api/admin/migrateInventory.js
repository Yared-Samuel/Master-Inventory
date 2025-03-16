import connect from "@/lib/db";
import Transaction from "@/models/inventoryModel";
import Product from "@/models/productModel";
import { getIdFromToken } from "@/lib/getDataFromToken";
import { 
  encodeQuantityForStorage,
  convertDecimalToWholeUnitsAndRemainder 
} from "@/lib/inventory/inventoryUtils";

export default async function handler(req, res) {
  try {
    const { method, cookies } = req;
    const token = cookies?.token;
    const userId = await getIdFromToken(token);
    
    // Only allow admin access
    if (!userId.success || userId.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized access. Admin rights required." 
      });
    }
    
    await connect();

    switch (method) {
      case "POST":
        return await migrateInventoryData(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          message: "Method not allowed" 
        });
    }
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function migrateInventoryData(req, res) {
  // This will be a long-running operation, so increase timeout if needed
  
  try {
    // Get all transactions that need updating (using a different criteria now)
    const transactions = await Transaction.find({
      // Focus on transactions with old decimal formats
      $or: [
        { originalQuantity: { $exists: false } },
        { measurementType: { $exists: false } }
      ]
    }).populate("productId", "measurment_name sub_measurment_name sub_measurment_value");
    
    console.log(`Found ${transactions.length} transactions to migrate`);
    
    // Keep track of stats
    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each transaction
    for (const transaction of transactions) {
      try {
        const product = transaction.productId;
        
        // Skip transactions without products
        if (!product) {
          errors.push({ 
            transactionId: transaction._id, 
            error: "Missing product reference" 
          });
          errorCount++;
          continue;
        }
        
        const subUnitsPerMainUnit = product.sub_measurment_value || 1;
        
        // Get the quantity and remaining values in decimal form
        const decimalQuantity = transaction.quantity || 0;
        const decimalRemaining = transaction.remaining || 0;
        
        // Convert to whole units and remainder
        const quantityResult = convertDecimalToWholeUnitsAndRemainder(
          decimalQuantity,
          subUnitsPerMainUnit
        );
        
        const remainingResult = convertDecimalToWholeUnitsAndRemainder(
          decimalRemaining,
          subUnitsPerMainUnit
        );
        
        // Encode for storage in our custom format
        const encodedQuantity = encodeQuantityForStorage(
          quantityResult.wholeUnits,
          quantityResult.remainderSubUnits,
          subUnitsPerMainUnit
        );
        
        const encodedRemaining = encodeQuantityForStorage(
          remainingResult.wholeUnits,
          remainingResult.remainderSubUnits,
          subUnitsPerMainUnit
        );
        
        // Update the transaction
        await Transaction.updateOne(
          { _id: transaction._id },
          { 
            $set: {
              quantity: encodedQuantity,
              remaining: encodedRemaining,
              // Set default values for fields that didn't exist before
              measurementType: transaction.measurementType || 'main',
              measurementUnit: transaction.measurementUnit || product.measurment_name,
              conversionRate: subUnitsPerMainUnit
            }
          }
        );
        
        migratedCount++;
      } catch (err) {
        console.error(`Error processing transaction ${transaction._id}:`, err);
        errors.push({ 
          transactionId: transaction._id, 
          error: err.message 
        });
        errorCount++;
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Migration completed. ${migratedCount} transactions updated, ${errorCount} errors encountered.`,
      migratedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Migration process error:', error);
    return res.status(500).json({
      success: false,
      message: "Error during migration process",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to format display strings
function formatDisplayQuantity(wholeUnits, remainderSubUnits, product) {
  let displayText = `${wholeUnits} ${product.measurment_name}`;
  if (remainderSubUnits > 0 && product.sub_measurment_name) {
    displayText += ` and ${remainderSubUnits} ${product.sub_measurment_name}`;
  }
  return displayText;
} 