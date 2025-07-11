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



async function getSalesTransactions(req, res, Transaction, companyId, userRole) {
  try {
    // Apply company filter based on user role

    const companyFilter = userRole === 'admin'
      ? {} 
      : { companyId: companyId };

    const { startDate, endDate } = req.query;
    
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
    if(startDate && endDate){
      const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
    query.date = {
      $gte: start,
      $lte: end
    }
  } else if(!startDate && !endDate){
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    query.date = {
      $gte: startOfDay,
      $lte: endOfDay
    }
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
        formattedQuantity = `${decoded.wholeUnits}`;
        let  subQuantity  
        if (decoded.remainderSubUnits > 0) {
          subQuantity = ` ${decoded.remainderSubUnits}`;
        }
      }

      return {
        ...transactionObj,
        quantity: formattedQuantity,
        subQuantity: transaction.quantity,
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