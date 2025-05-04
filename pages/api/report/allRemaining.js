import connect from "@/lib/db";
import { getInventoryModel } from "@/lib/models";
import { getIdFromToken } from "@/lib/getDataFromToken";
import { sendSuccess, sendError, sendBadRequest } from "@/lib/utils/responseHandler";
import { 
  decodeQuantityFromStorage,
} from "@/lib/inventory/inventoryUtils";
import { withTenant } from "@/lib/middleware/tenantMiddleware";

const Transaction = getInventoryModel();

export default withTenant(async function handler(req, res) {
  try {
    const { method, cookies } = req;
    const token = cookies?.token;
    const userId = await getIdFromToken(token);
    
    if (!userId.success) {
      return sendBadRequest(res, "Unauthorized access");
    }
    
    await connect();

    switch(method) {
        case "GET":
        return await getStoresRemaining(req, res);
        default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    return sendError(res, error);
  }
});

async function getStoresRemaining(req, res) {
  try {
    const remainingByStore = await Transaction.aggregate([
      // Match only completed transactions
      { $match: { status: 'done' } },
      
      // Sort by date descending to get latest transactions
      { $sort: { createdAt: -1 } },
      
      // Group by store and product to get latest transaction
      {
        $group: {
          _id: {
            fromStore: "$fromStore",
            productId: "$productId"
          },
          latestTransaction: { $first: "$$ROOT" }
        }
      },
      
      // Lookup store details
      {
        $lookup: {
          from: "storelists",
          localField: "_id.fromStore",
          foreignField: "_id",
          as: "storeDetails"
        }
      },
      
      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "_id.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      
      // Unwind the arrays created by lookups
      { $unwind: "$storeDetails" },
      { $unwind: "$productDetails" },
      
      // Sort by product name before grouping
      { $sort: { "productDetails.name": 1 } },
      
      // Reshape the output
      {
        $project: {
          _id: 0,
          storeId: "$_id.fromStore",
          storeName: "$storeDetails.name",
          productId: "$_id.productId",
          productName: "$productDetails.name",
          remaining: "$latestTransaction.remaining",
          lastUpdated: "$latestTransaction.createdAt",
          measurementUnit: "$productDetails.measurment_name",
          subMeasurementUnit: "$productDetails.sub_measurment_name",
          subMeasurementValue: "$productDetails.sub_measurment_value",
          transactionType: "$latestTransaction.transactionType",
          conversionRate: "$latestTransaction.conversionRate"
        }
      },
      
      // Group by store
      {
        $group: {
          _id: "$storeId",
          storeName: { $first: "$storeName" },
          totalRemaining: { $sum: "$remaining" },
          productCount: { $sum: 1 },
          products: {
            $push: {
              productId: "$productId",
              productName: "$productName",
              encodedRemaining: "$remaining",
              measurementUnit: "$measurementUnit",
              subMeasurementUnit: "$subMeasurementUnit", 
              subMeasurementValue: "$subMeasurementValue",
              lastUpdated: "$lastUpdated",
              lastTransactionType: "$transactionType",
              conversionRate: "$conversionRate"
            }
          }
        }
      },
      
      // Add additional store statistics
      {
        $addFields: {
          productsWithStock: {
            $size: {
              $filter: {
                input: "$products",
                as: "product",
                cond: { $gt: ["$$product.encodedRemaining", 0] }
              }
            }
          },
          productsOutOfStock: {
            $size: {
              $filter: {
                input: "$products",
                as: "product",
                cond: { $eq: ["$$product.encodedRemaining", 0] }
              }
            }
          }
        }
      },
      
      // Final projection
      {
        $project: {
          _id: 0,
          storeId: "$_id",
          storeName: 1,
          totalRemaining: 1,
          productCount: 1,
          productsWithStock: 1,
          productsOutOfStock: 1,
          products: 1
        }
      },
      
      // Sort stores by name
      { $sort: { storeName: 1 } }
    ]);

    // Process the results to decode and format quantities
    const processedStores = remainingByStore.map(store => {
      // Process each product in the store
      const processedProducts = store.products.map(product => {
        // Decode from the encoded remaining value
        const subUnitsPerMainUnit = product.subMeasurementValue || product.conversionRate || 1;
        const decodedQuantity = decodeQuantityFromStorage(
          product.encodedRemaining,
          subUnitsPerMainUnit
        );
        
        return {
          ...product,
          wholeUnits: decodedQuantity.wholeUnits,
          remainderSubUnits: decodedQuantity.remainderSubUnits,
          displayRemaining: formatDisplayQuantity(
            decodedQuantity.wholeUnits,
            decodedQuantity.remainderSubUnits,
            product.measurementUnit,
            product.subMeasurementUnit
          )
        };
      });
      
      return {
        ...store,
        products: processedProducts
      };
    });

    // Calculate overall summary
    const summary = {
      totalStores: processedStores.length,
      totalProducts: processedStores.reduce((sum, store) => sum + store.productCount, 0),
      totalQuantity: processedStores.reduce((sum, store) => sum + store.totalRemaining, 0),
      totalProductsWithStock: processedStores.reduce((sum, store) => sum + store.productsWithStock, 0),
      totalProductsOutOfStock: processedStores.reduce((sum, store) => sum + store.productsOutOfStock, 0)
    };

    return sendSuccess(res, "Remaining quantities by store retrieved successfully", {
      stores: processedStores,
      summary
    });

  } catch (error) {
    console.error("Aggregation Error:", error);
    return sendError(res, error);
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
