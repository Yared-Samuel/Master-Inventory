import connect from "@/lib/db";
import { sendError } from "@/lib/utils/responseHandler";

export const withUsageTracking = (handler) => {
  return async (req, res) => {
    try {
      // Get the API endpoint path
      const endpoint = req.url;
      
      // Get the tenant ID from the request
      const tenantId = req.tenantId;
      
      // Get current timestamp
      const timestamp = new Date();
      
      // Get MongoDB connection
      const db = await connect();
      
      // Update usage tracking
      await db.collection("api_usage").updateOne(
        { 
          tenantId,
          endpoint,
          date: {
            $gte: new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate()),
            $lt: new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate() + 1)
          }
        },
        {
          $inc: { count: 1 },
          $setOnInsert: {
            tenantId,
            endpoint,
            date: new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate())
          }
        },
        { upsert: true }
      );
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error("Usage tracking error:", error);
      // Continue with the request even if tracking fails
      return handler(req, res);
    }
  };
}; 