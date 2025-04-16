import { getInventoryModel, getProductModel, getSellingPriceModel, getStoreListModel } from "@/lib/models";
const Transaction = getInventoryModel();
const Product = getProductModel();
const Sprice = getSellingPriceModel();
const StoreList = getStoreListModel();
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

/**
 * Convert sub-units to whole units and remainder
 * @param {number} subUnits - Number of sub-units (e.g., bottles)
 * @param {number} subUnitsPerMainUnit - Number of sub-units in one main unit (e.g., 24 bottles per crate)
 * @returns {Object} Contains whole units and remaining sub-units
 */
export function convertSubUnitsToWholeUnits(subUnits, subUnitsPerMainUnit) {
  if (!subUnitsPerMainUnit) return { wholeUnits: subUnits, remainderSubUnits: 0 };
  
  // Round to avoid floating point issues
  const roundedSubUnits = Math.round(subUnits);
  
  // Calculate whole units using integer division
  const wholeUnits = Math.floor(roundedSubUnits / subUnitsPerMainUnit);
  
  // Calculate remaining sub-units using modulo
  const remainderSubUnits = roundedSubUnits % subUnitsPerMainUnit;
  
  return {
    wholeUnits,
    remainderSubUnits,
    displayText: `${wholeUnits} + ${remainderSubUnits}/${subUnitsPerMainUnit}`
  };
}

/**
 * Convert main units with decimal to whole units and remainder
 * @param {number} mainUnits - Quantity in main units (can be decimal, e.g., 1.25 crates)
 * @param {number} subUnitsPerMainUnit - Number of sub-units in one main unit (e.g., 24 bottles per crate)
 * @returns {Object} Contains whole units and remaining sub-units
 */
export function convertDecimalToWholeUnitsAndRemainder(mainUnits, subUnitsPerMainUnit) {
  if (!subUnitsPerMainUnit) return { wholeUnits: mainUnits, remainderSubUnits: 0 };
  
  // Convert to total sub-units to avoid decimal issues
  const totalSubUnits = Math.round(mainUnits * subUnitsPerMainUnit);
  
  // Use integer division to get whole units and remainder
  return convertSubUnitsToWholeUnits(totalSubUnits, subUnitsPerMainUnit);
}

/**
 * Format remaining inventory as whole units and sub-units
 * @param {number} remaining - Remaining quantity in main units
 * @param {Object} product - Product object with measurement info
 * @returns {Object} Formatted remaining quantities
 */
export function formatRemainingInventory(remaining, product) {
  if (!product || !product.sub_measurment_value) {
    return {
      remaining,
      formattedRemaining: `${remaining} ${product?.measurment_name || ''}`,
      wholeUnits: remaining,
      remainderSubUnits: 0,
      totalInSubUnits: 0
    };
  }
  
  const { wholeUnits, remainderSubUnits } = convertDecimalToWholeUnitsAndRemainder(
    remaining,
    product.sub_measurment_value
  );
  
  let formattedRemaining = `${wholeUnits} ${product.measurment_name}`;
  if (remainderSubUnits > 0) {
    formattedRemaining += ` and ${remainderSubUnits} ${product.sub_measurment_name}`;
  }
  
  // Calculate total in sub-units for calculations
  const totalInSubUnits = (wholeUnits * product.sub_measurment_value) + remainderSubUnits;
  
  return {
    remaining, // Keep the original decimal value for calculations
    formattedRemaining, // Human-readable format
    wholeUnits,
    remainderSubUnits,
    totalInSubUnits
  };
}

/**
 * Calculate inventory operations in sub-units to maintain precision
 * @param {number} startingMainUnits - Starting quantity in main units (can be decimal)
 * @param {number} operationSubUnits - Quantity to add/subtract in sub-units
 * @param {number} subUnitsPerMainUnit - Conversion rate between units
 * @param {boolean} isAddition - Whether to add (true) or subtract (false)
 * @returns {Object} New quantities in whole units, remainder, and decimal format
 */
export function calculateInventoryChangeInSubUnits(startingMainUnits, operationSubUnits, subUnitsPerMainUnit, isAddition = false) {
  // Convert starting amount to total sub-units
  const startingTotalSubUnits = Math.round(startingMainUnits * subUnitsPerMainUnit);
  
  // Perform operation
  const resultingSubUnits = isAddition 
    ? startingTotalSubUnits + operationSubUnits
    : startingTotalSubUnits - operationSubUnits;
  
  // Convert back to whole units and remainder
  const { wholeUnits, remainderSubUnits } = convertSubUnitsToWholeUnits(resultingSubUnits, subUnitsPerMainUnit);
  
  // Calculate decimal representation for database storage
  const decimalUnits = resultingSubUnits / subUnitsPerMainUnit;
  
  return {
    wholeUnits,
    remainderSubUnits,
    decimalUnits,
    totalSubUnits: resultingSubUnits
  };
}

/**
 * Check if sufficient inventory is available
 * @param {string} productId - Product ID to check
 * @param {string} storeId - Store ID to check
 * @param {number} quantity - Requested quantity
 * @param {string} [status='done'] - Transaction status to check
 * @param {string} companyId - Company ID to filter transactions
 * @param {Object} [session] - MongoDB session for transaction safety
 * @returns {Promise<{success: boolean, remaining?: number, message?: string}>}
 */
export async function checkInventoryAvailability(productId, storeId, quantity, status = 'done', companyId, session = null) {
  // Use a session if provided, or start a new one if checking forSale product
  let localSession = session;
  let shouldEndSession = false;
  
  try {
    const { type } = await Product.findOne({ _id: productId, companyId: companyId }).select('type').session(localSession);    
    
    // For forSale products, we need to check multiple component inventories atomically
    if(type == "forSale" && !localSession) {
      // Start a session if not provided
      localSession = await mongoose.startSession();
      localSession.startTransaction();
      shouldEndSession = true;
    }
    
    if(type == "forSale"){
      // Get the full product details including used_products
      const forSaleProduct = await Product.findOne(
        { _id: productId, companyId }
      ).populate('used_products.productId')
       .session(localSession);
      
      // Check if product has components
      if (!forSaleProduct.used_products || forSaleProduct.used_products.length === 0) {
        // No components to check
        if (shouldEndSession) {
          await localSession.commitTransaction();
          localSession.endSession();
        }
      return {
        success: true, 
        remaining: quantity,
        };
      }
      
      // Check availability for each component product
      let maxPossible = Infinity;
      let limitingComponents = [];
      let available = 0;
      
      for (const component of forSaleProduct.used_products) {
        // Skip if product or quantity is null
        if (!component.productId || !component.quantity) continue;
        
        // Get latest inventory transaction for this component
        const latestComponentInventory = await Transaction.find({
          productId: component.productId._id,
          fromStore: storeId,
          status: "done",
          companyId: companyId
        })
        .sort({createdAt: -1})
        .limit(1)
        .session(localSession);
        
        // Calculate how many units of the forSale product can be made
        const availableQuantity = latestComponentInventory.length > 0 ? latestComponentInventory[0].remaining : 0;
        
        // Set available to the first component's available quantity for error reporting
        if (limitingComponents.length === 0) {
          available = availableQuantity;
        }
        
        // Calculate how many complete units of the final product can be made based on this component's availability
        const possibleUnits = Math.floor(availableQuantity / component.quantity);
        
        // If this component is more limiting than previous ones, update maxPossible
        if (possibleUnits < maxPossible) {
          maxPossible = possibleUnits;
          limitingComponents = [{ 
            productId: component.productId._id,
            available: availableQuantity,
            required: component.quantity,
            canMake: possibleUnits
          }];
        } else if (possibleUnits === maxPossible) {
          limitingComponents.push({ 
            productId: component.productId._id,
            available: availableQuantity,
            required: component.quantity,
            canMake: possibleUnits
          });
        }
      }
      
      // Determine actual remaining quantity
      const remaining = Math.min(quantity, maxPossible);
      const success = maxPossible >= quantity;
      
      // If using a local session, commit or abort the transaction
      if (shouldEndSession) {
        if (success) {
          await localSession.commitTransaction();
        } else {
          await localSession.abortTransaction();
        }
        localSession.endSession();
      }
      
      return {
        success: success, 
        remaining: remaining,
        maxPossible: maxPossible,
        limitingComponents: limitingComponents.length > 0 ? limitingComponents : undefined,
        message: maxPossible < quantity ? `Insufficient component inventory. Available: ${maxPossible}, Requested: ${quantity}` : undefined,
        available: available // Add available quantity for error formatting in use.js
      };
    }
    
    // For regular products (non-forSale)
    const latestInventory = await Transaction.find({
      productId: productId, 
      fromStore: storeId, 
      status: "done",
      companyId: companyId
    })
    .sort({createdAt: -1})
    .limit(1)
    .session(localSession);
    
    if (!latestInventory.length) {
      return { 
        success: false, 
        message: "No inventory record found" 
      };
    }

    const available = latestInventory[0].remaining;
    if (available < quantity || !available) {
      return { 
        success: false, 
        message: `Insufficient inventory. Available: ${available}, Requested: ${quantity}`,
        available
      };
    }

    return { 
      success: true, 
      remaining: available,
      latestTransaction: latestInventory[0]
    };
  } catch (error) {
    // If using a local session, abort the transaction on error
    if (shouldEndSession && localSession) {
      await localSession.abortTransaction();
      localSession.endSession();
    }
    
    console.error('Inventory check error:', error);
    return {
      success: false,
      message: "Error checking inventory availability: " + error.message
    };
  }
}

export async function checkInventoryAvailabilityForSale(productId, storeId, quantity, companyId, session = null, customUsedProducts = null) {
  // Use a session if provided, or start a new one if checking forSale product
  let localSession = session;
  let shouldEndSession = false;
  
  try {
    const { type } = await Product.findOne({ _id: productId, companyId: companyId }).select('type').session(localSession);    
    
    // For forSale products, we need to check multiple component inventories atomically
    if(type == "forSale" && !localSession) {
      // Start a session if not provided
      localSession = await mongoose.startSession();
      localSession.startTransaction();
      shouldEndSession = true;
    }
    
    if(type == "forSale"){
      // Get the full product details including used_products
      const forSaleProduct = await Product.findOne(
        { _id: productId, companyId }
      ).populate('used_products.productId')
       .session(localSession);
      
      // Use custom components from request body if provided, otherwise use product's default components
      const componentsToUse = customUsedProducts || forSaleProduct.used_products;
      
      // Check if product has components
      if (!componentsToUse || componentsToUse.length === 0) {
        // No components to check
        if (shouldEndSession) {
          await localSession.commitTransaction();
          localSession.endSession();
        }
        return {
          success: true, 
          remaining: quantity,
        };
      }
      
      // Check availability for each component product
      let maxPossible = Infinity;
      let limitingComponents = [];
      let available = 0;
      
      for (const component of componentsToUse) {
        // Skip if product or quantity is null
        if (!component.productId || !component.quantity) continue;
        
        // Handle both populated and non-populated component references
        const componentId = component.productId._id || component.productId;
        
        // Get latest inventory transaction for this component
        const latestComponentInventory = await Transaction.find({
          productId: componentId,
          fromStore: storeId,
          status: 'done',
          companyId: companyId
        })
        .sort({createdAt: -1})
        .limit(1)
        .session(localSession);
        
        // Calculate how many units of the forSale product can be made
        const availableQuantity = latestComponentInventory.length > 0 ? latestComponentInventory[0].remaining : 0;
        
        // Set available to the first component's available quantity for error reporting
        if (limitingComponents.length === 0) {
          available = availableQuantity;
        }
        
        // Calculate how many complete units of the final product can be made based on this component's availability
        const possibleUnits = Math.floor(availableQuantity / component.quantity);
        
        // If this component is more limiting than previous ones, update maxPossible
        if (possibleUnits < maxPossible) {
          maxPossible = possibleUnits;
          limitingComponents = [{ 
            productId: componentId,
            available: availableQuantity,
            required: component.quantity,
            canMake: possibleUnits
          }];
        } else if (possibleUnits === maxPossible) {
          limitingComponents.push({ 
            productId: componentId,
            available: availableQuantity,
            required: component.quantity,
            canMake: possibleUnits
          });
        }
      }
      
      // Determine actual remaining quantity
      const remaining = Math.min(quantity, maxPossible);
      const success = maxPossible >= quantity;
      
      // If using a local session, commit or abort the transaction
      if (shouldEndSession) {
        if (success) {
          await localSession.commitTransaction();
        } else {
          await localSession.abortTransaction();
        }
        localSession.endSession();
      }
      return {
        success: success, 
        remaining: remaining,
        maxPossible: maxPossible,
        limitingComponents: limitingComponents.length > 0 ? limitingComponents : undefined,
        message: maxPossible < quantity ? `Insufficient component inventory. Available: ${maxPossible}, Requested: ${quantity}` : undefined,
        available: available // Add available quantity for error formatting in use.js
      };
    }
    
    // For regular products (non-forSale)
    const latestInventory = await Transaction.find({
      productId: productId, 
      fromStore: storeId, 
      status: 'done',
      companyId: companyId
    })
    .sort({createdAt: -1})
    .limit(1)
    .session(localSession);
    
    if (!latestInventory.length) {
      return { 
        success: false, 
        message: "No inventory record found" 
      };
    }

    const available = latestInventory[0].remaining;
    if (available < quantity || !available) {
      return { 
        success: false, 
        message: `Insufficient inventory. Available: ${available}, Requested: ${quantity}`,
        available
      };
    }

    return { 
      success: true, 
      remaining: available,
      latestTransaction: latestInventory[0]
    };
  } catch (error) {
    // If using a local session, abort the transaction on error
    if (shouldEndSession && localSession) {
      await localSession.abortTransaction();
      localSession.endSession();
    }
    
    console.error('Inventory check error:', error);
    return {
      success: false,
      message: "Error checking inventory availability: " + error.message
    };
  }
}
export async function checkInventoryAvailabilityToStore(productId, toStore, status = 'done', companyId) {
  try {
    const latestInventory = await Transaction.find({
      productId: productId, 
      fromStore: toStore, 
      status: status,
      companyId: companyId
    })
    .sort({createdAt: -1})
    .limit(1);
    
    const available = latestInventory[0]?.remaining || 0;
    return { 
      success: true, 
      remaining: available,
    };
  } catch (error) {
    console.error('Inventory check error:', error);
    return {
      success: false,
      message: "Error checking inventory availability"
    };
  }
}

/**
 * Get selling price for a product in a store
 * @param {string} storeId - Store ID
 * @param {string} productId - Product ID
 * @returns {Promise<{success: boolean, price?: number, message?: string, priceDetails?: Object}>}
 */
export async function getSellingPrice(toStore, productId, companyId) {
  try {
    const productType = await getProductType(productId, companyId);
    if(productType == "raw" || productType == "fixed" || productType == "use-and-throw"){
      return { 
        success: false,
        message: "Product is not for sale"
      };
    }

    const store = await StoreList.findOne({
      _id: new ObjectId(toStore),
      Sprice: { $exists: true },
      companyId: new ObjectId(companyId)
    });

    if(store?.mainStore){
      return {
        success: true,
        price: 1
      };
    }


    if (!store?.Sprice) {
      return { 
        success: true, 
        message: "Main store has no price" 
      };
    }

    const priceDetail = await Sprice.findOne(
      {
        _id: new ObjectId(store.Sprice),
        'products.product': productId,
        companyId: new ObjectId(companyId)
      },
      { 'products.$': 1 }
    );
    if (!priceDetail?.products[0]?.sellingPrice) {
      return { 
        success: false, 
        message: `Selling price not found for this product in store - ${store.name} and  selling Price name - ${priceDetail.name}`
      };
    }

    return { 
      success: true, 
      price: priceDetail.products[0].sellingPrice,
      priceDetails: priceDetail.products[0] // In case additional price info is needed
    };
  } catch (error) {
    console.error('Price check error:', error);
    return {
      success: false,
      message: "Error fetching selling price"
    };
  }
}

/**
 * Validate quantity
 * @param {number} quantity - Quantity to validate
 * @returns {boolean}
 */
export function isValidQuantity(quantity) {
  // Accept any positive number (including decimals)
  return typeof quantity === 'number' && !isNaN(quantity) && quantity > 0;
}

/**
 * Validate ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
export function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * Validate purchase price
 * @param {number} price - Price to validate
 * @returns {boolean}
 */
export function isValidPrice(price) {
  return typeof price === 'number' && price > 0;
}

/**
 * Calculate average purchase price
 * @param {string} productId - Product ID
 * @param {string} storeId - Store ID
 * @returns {Promise<{success: boolean, averagePrice?: number, message?: string}>}
 */
export async function calculateAveragePurchasePrice(productId, storeId) {
  try {
    const purchases = await Transaction.find({
      productId,
      fromStore: storeId,
      transactionType: 'purchase',
      status: 'done'
    })
    .sort({ createdAt: -1 })
    .limit(5); // Consider last 5 purchases for average

    if (!purchases.length) {
      return {
        success: false,
        message: "No purchase history found"
      };
    }

    const totalPrice = purchases.reduce((sum, purchase) => 
      sum + (purchase.totalPrice / purchase.quantity), 0);
    
    return {
      success: true,
      averagePrice: totalPrice / purchases.length
    };
  } catch (error) {
    console.error('Average price calculation error:', error);
    return {
      success: false,
      message: "Error calculating average price"
    };
  }
} 

export async function getProductType(productId, companyId){
  try {
    const product = await Product.findOne({
      _id: new ObjectId(productId),
      companyId: new ObjectId(companyId)
    });
    if (!product) {
      return null;
    }
    return product.type;
  } catch (error) {
    console.error('Error getting product type:', error);
    return null;
  }
}

/**
 * Encode quantity for database storage in the format the user wants
 * @param {number} wholeUnits - Whole units (e.g., crates)
 * @param {number} remainderSubUnits - Remainder sub-units (e.g., bottles)
 * @param {number} subUnitsPerMainUnit - Sub-units per main unit (e.g., 24 bottles per crate)
 * @returns {number} Encoded value for storage (e.g., 1.06 for 1 crate and 6 bottles)
 */
export function encodeQuantityForStorage(wholeUnits, remainderSubUnits, subUnitsPerMainUnit) {
  // Check if we need to normalize (if remainder exceeds the base)
  if (remainderSubUnits >= subUnitsPerMainUnit) {
    const additionalWholeUnits = Math.floor(remainderSubUnits / subUnitsPerMainUnit);
    wholeUnits += additionalWholeUnits;
    remainderSubUnits = remainderSubUnits % subUnitsPerMainUnit;
  }
  
  // Calculate the decimal fraction (convert to two decimal places)
  // For a base-24 system (24 bottles per crate):
  // 1 bottle = 0.01
  // 6 bottles = 0.06
  // 18 bottles = 0.18
  // etc.
  const fraction = remainderSubUnits / 100;
  
  // Combine whole and fractional parts
  return wholeUnits + fraction;
}

/**
 * Decode quantity from database storage format
 * @param {number} encodedValue - Encoded value from database (e.g., 1.06)
 * @param {number} subUnitsPerMainUnit - Sub-units per main unit (e.g., 24)
 * @returns {Object} Decoded values: wholeUnits and remainderSubUnits
 */
export function decodeQuantityFromStorage(encodedValue, subUnitsPerMainUnit) {
  // Extract whole units
  const wholeUnits = Math.floor(encodedValue);
  
  // Extract fraction part and convert to remainder units
  // The fraction is already in the format we want (0.06 = 6 bottles)
  // Just multiply by 100 to get the number of units
  const fraction = encodedValue - wholeUnits;
  const remainderSubUnits = Math.round(fraction * 100);
  
  return {
    wholeUnits,
    remainderSubUnits
  };
}

/**
 * Calculate inventory operations using the custom base system
 * @param {number} currentEncodedValue - Current quantity in encoded format (e.g., 60.00)
 * @param {number} operationSubUnits - Sub-units to add or subtract (e.g., 30 bottles)
 * @param {number} subUnitsPerMainUnit - Sub-units per main unit (e.g., 24)
 * @param {boolean} isAddition - Whether to add (true) or subtract (false)
 * @returns {Object} New values in encoded format and components
 */
export function calculateInventoryOperation(currentEncodedValue, operationSubUnits, subUnitsPerMainUnit, isAddition = false) {
  // Decode current value
  const { wholeUnits: currentWholeUnits, remainderSubUnits: currentRemainderSubUnits } = 
    decodeQuantityFromStorage(currentEncodedValue, subUnitsPerMainUnit);
  
  // Calculate total in sub-units
  const currentTotalSubUnits = (currentWholeUnits * subUnitsPerMainUnit) + currentRemainderSubUnits;
  
  // Perform operation
  const resultingSubUnits = isAddition 
    ? currentTotalSubUnits + operationSubUnits
    : currentTotalSubUnits - operationSubUnits;
  
  // Convert back to whole and remainder
  const resultWholeUnits = Math.floor(resultingSubUnits / subUnitsPerMainUnit);
  const resultRemainderSubUnits = resultingSubUnits % subUnitsPerMainUnit;
  
  // Encode for storage
  const encodedResult = encodeQuantityForStorage(resultWholeUnits, resultRemainderSubUnits, subUnitsPerMainUnit);
  
  return {
    encodedValue: encodedResult,
    wholeUnits: resultWholeUnits,
    remainderSubUnits: resultRemainderSubUnits,
    totalSubUnits: resultingSubUnits
  };
}

export async function getPurchasePrice(productId, companyId){
  try {

    const purchasePrice = await Transaction.findOne({
    productId: new ObjectId(productId),
    transactionType: 'purchase',
    companyId: new ObjectId(companyId),
    status: 'done'
  })
  .sort({createdAt: -1})
  .limit(1);
  if (!purchasePrice) {
    return {
      success: false,
      message: "No purchase price found to calculate total price"
    };
  }
  const unitPrice = purchasePrice.totalPrice / purchasePrice.quantity;
  
  return {
    success: true,
    unitPrice: unitPrice
  };
    
  } catch (error) {
    return {
      success: false,
      message: "Error fetching Purchase price"
    };
  }
  
}
