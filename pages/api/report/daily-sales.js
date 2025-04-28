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
      return await getSalesReport(req, res, req.user.companyId, req.user.role);
    default:
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
  }
}

async function getSalesReport(req, res, companyId, userRole) {
  try {
    await connect();
    const Sales = getInventoryModel("sales");

    const companyFilter = userRole === 'admin'
      ? {} 
      : { companyId: new mongoose.Types.ObjectId(companyId) };

    const sales = await Sales
      .aggregate([
        {
          $match: {
            ...companyFilter,
            status: "done",
            transactionType: "sale"
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
          $unwind: "$storeInfo"
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
              storeName: "$storeInfo.name"
            },
            storeDailyTotal: { $sum: "$totalPrice" }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            totalSales: { $sum: "$storeDailyTotal" },
            stores: {
              $push: {
                storeName: "$_id.storeName",
                sales: { $round: ["$storeDailyTotal", 2] }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalSales: { $round: ["$totalSales", 2] },
            stores: 1
          }
        },
        {
          $sort: { date: -1 }
        }
      ]);

    // Format the numbers with commas
    const formattedSales = sales.map(day => ({
      date: day.date,
      totalSales: day.totalSales.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      stores: day.stores.map(store => ({
        storeName: store.storeName,
        sales: store.sales.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }))
    }));

    return res.status(200).json({
      success: true,
      message: "Daily sales report retrieved successfully",
      data: formattedSales
    });

  } catch (error) {
    console.error("Error fetching sales report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales report",
      error: error.message
    });
  }
}

// Wrap handler with both middlewares
export default withTenant(withUsageTracking(protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'])(handler)));