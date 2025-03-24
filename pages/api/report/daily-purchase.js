import { connect } from "@/lib/db";

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

    // Query purchase data with date range and company_id filter
    const purchases = await db.collection("purchases")
      .aggregate([
        {
          $match: {
            company_id: session.user.company_id,
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
            localField: "store_id",
            foreignField: "_id",
            as: "store"
          }
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "supplier_id",
            foreignField: "_id",
            as: "supplier"
          }
        },
        {
          $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$store", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true }
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
            supplierName: "$supplier.name",
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
      message: "Purchase data retrieved successfully",
      data: purchases
    });

  } catch (error) {
    console.error("Error fetching purchase data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase data",
      error: error.message
    });
  }
}
