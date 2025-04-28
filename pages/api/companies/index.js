import { getCompanyModel, getUserModel } from "@/lib/models";
import connect from "@/lib/db";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendBadRequest, sendCreated } from "@/lib/utils/responseHandler";
import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { withUsageTracking } from "@/lib/middleware/usageMiddleware";

async function handler(req, res) {
  try {
    await connect();
    
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const { method } = req;
    
    switch (method) {
      case "GET":
        console.log("first")
        const companies = await Company.find().sort("-createdAt");
        return sendSuccess(res, "Companies retrieved successfully", companies);
        console.log(companies)
      case "POST":
        const { name, email, address, phone } = req.body;
        
        if (!name || !email) {
          return sendBadRequest(res, "Name and email are required");
        }
        
        const newCompany = new Company({
          name,
          email,
          address,
          phone,
          createdBy: req.user.id
        });
        
        const savedCompany = await newCompany.save();
        return sendCreated(res, "Company created successfully", savedCompany);
        
      default:
        return sendBadRequest(res, "Method not allowed");
    }
  } catch (error) {
    console.error("Companies API error:", error);
    return sendError(res, error.message || "Error processing request");
  }
}

// Wrap handler with both middlewares
export default withTenant(withUsageTracking(protectRoute(['admin'])(handler))); 