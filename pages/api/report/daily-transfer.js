import connect from "@/lib/db";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {


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

    // Query transfer data with date range and company_id filter
    const transfers = await db.collection("transfers")
      .aggregate([
        {
          $match: {
            company_id: req.user.companyId,
            createdAt: { $gte: start, $lte: end }
          }
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
            localField: "source_store_id",
            foreignField: "_id",
            as: "sourceStore"
          }
        },
        {
          $lookup: {
            from: "stores",
            localField: "destination_store_id",
            foreignField: "_id",
            as: "destinationStore"
          }
        },
        {
          $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$sourceStore", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$destinationStore", preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            quantity: 1,
            status: 1,
            createdAt: 1,
            productName: "$product.name",
            sourceStoreName: "$sourceStore.name",
            destinationStoreName: "$destinationStore.name",
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
      message: "Transfer data retrieved successfully",
      data: transfers
    });

  } catch (error) {
    console.error("Error fetching transfer data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfer data",
      error: error.message
    });
  }
}
