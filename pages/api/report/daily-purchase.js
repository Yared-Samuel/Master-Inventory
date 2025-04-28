import connect from "@/lib/db";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { getInventoryModel } from "@/lib/models";
import mongoose from "mongoose";
import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { withUsageTracking } from "@/lib/middleware/usageMiddleware";

async function handler(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - User data not available'
    });
  }

  switch (req.method) {
    case 'GET':
      return await getPurchaseReport(req, res, req.user.companyId, req.user.role);
    default:
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
  }
}

async function getPurchaseReport(req, res, companyId, userRole) {
  try {
    await connect();
    const Purchase = getInventoryModel("purchases");

    const companyFilter = userRole === 'admin'
      ? {} 
      : { companyId: new mongoose.Types.ObjectId(companyId) };

    const purchases = await Purchase
      .aggregate([
        {
          $match: {
            ...companyFilter,
            status: "done",
            transactionType: "purchase"
          }
        },
        {
          $lookup: {
            from: "storelists",
            localField: "fromStore",
            foreignField: "_id",
            as: "storeInfo"
          }
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "supplier",
            foreignField: "_id",
            as: "supplierInfo"
          }
        },
        {
          $unwind: "$storeInfo"
        },
        {
          $unwind: {
            path: "$supplierInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { 
                  format: "%Y-%m-%d", 
                  date: "$date" 
                }
              },
              storeId: "$fromStore",
              storeName: "$storeInfo.name",
              supplierId: "$supplier",
              supplierName: { $ifNull: ["$supplierInfo.name", "Unknown Supplier"] }
            },
            storeDailyTotal: { $sum: "$totalPrice" },
            totalQuantity: { $sum: "$quantity" }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            totalPurchases: { $sum: "$storeDailyTotal" },
            totalQuantity: { $sum: "$totalQuantity" },
            details: {
              $push: {
                storeName: "$_id.storeName",
                supplierName: "$_id.supplierName",
                amount: { $round: ["$storeDailyTotal", 2] },
                quantity: "$totalQuantity"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalPurchases: { $round: ["$totalPurchases", 2] },
            totalQuantity: 1,
            details: 1
          }
        },
        {
          $sort: { date: -1 }
        }
      ]);

    // Format the numbers with commas
    const formattedPurchases = purchases.map(day => ({
      date: day.date,
      totalPurchases: day.totalPurchases.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      totalQuantity: day.totalQuantity,
      details: day.details.map(detail => ({
        storeName: detail.storeName,
        supplierName: detail.supplierName,
        amount: detail.amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        quantity: detail.quantity
      }))
    }));

    return res.status(200).json({
      success: true,
      message: "Daily purchase report retrieved successfully",
      data: formattedPurchases
    });

  } catch (error) {
    console.error("Error fetching purchase report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase report",
      error: error.message
    });
  }
}

// Wrap handler with both middlewares
export default withTenant(withUsageTracking(protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler)));
