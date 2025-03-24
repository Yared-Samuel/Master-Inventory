import connect from "@/lib/db";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
 const userRole = req.user.role;
 const companyFilter = userRole === 'admin' ? {} : { companyId: companyId };


    // Connect to database using Mongoose
    await connect();
    
    // Get date range from query params
    const { startDate, endDate } = req.query;
    
    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date and end date are required" 
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid date format" 
      });
    }

    // Get Mongoose connection for raw operations
    const db = mongoose.connection.db;

    // Modify the $match stage in the aggregation pipeline
    const matchStage = {
      ...companyFilter,
      createdAt: { $gte: start, $lte: end }
    };

    // Add store_id filter if provided
    if (req.query.storeId && req.query.storeId !== "all") {
      matchStage.store_id = req.query.storeId;
    }

    // Query sales data with filters
    const sales = await db.collection("sales")
      .aggregate([
        {
          $match: matchStage
        },
        {
          $lookup: {
            from: "products",
            localField: "product_id",
            foreignField: "_id",
            as: "product"
          }
        },
        {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store"
          }
        },
        {
          $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$store", preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            quantity: 1,
            total_price: 1,
            unit_price: 1,
            createdAt: 1,
            productName: "$product.name",
            storeName: "$store.name",
            measurementUnit: "$product.measurment_name",
            subMeasurementUnit: "$product.sub_measurment_name",
            subMeasurementValue: "$product.sub_measurment_value"
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    // Return success response with data
    return res.status(200).json({
      success: true,
      message: "Sales data retrieved successfully",
      data: sales
    });

  } catch (error) {
    console.error("Error fetching sales data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales data",
      error: error.message
    });
  }
}
