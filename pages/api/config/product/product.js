import connect from "@/lib/db";
import { getProductModel } from "@/lib/models";
import { protectRoute } from "@/lib/middleware/roleMiddleware";
import { sendSuccess, sendError, sendCreated, sendBadRequest, sendNotFound } from "@/lib/utils/responseHandler";
import { withTenant } from "@/lib/middleware/tenantMiddleware";

const validateProductData = (data) => {
  const { name, type, measurment_name, sub_measurment_name, sub_measurment_value } = data;
  
  if (!name || !type || !measurment_name) {
    throw { statusCode: 400, message: "Name, type, and measurement name are required!" };
  }
  if (sub_measurment_name && !sub_measurment_value) {
    throw { statusCode: 400, message: "Sub measurement value is required when sub measurement name is provided!" };
  }
};

async function handler(req, res) {
  try {
    await connect();
    const Product = getProductModel();
    const { method, query, body } = req;
    

    switch (method) {
      case "POST": {
        validateProductData(body);
        
        // Create product with user and company ID from authenticated user
        const product = await Product.create({
          ...body,
          user: req.user.id,
          companyId: req.user.companyId // Add companyId from authenticated user
        });
        
        return sendCreated(res, "Product created successfully", product);
      }

      case "GET": {
        // Get products for the current company only
        // Note: For admin users, the company filter won't be applied due to our middleware
        const companyFilter = req.user.role === 'admin' ? {} : { companyId: req.user.companyId };
        const products = await Product.find({...companyFilter,  isActive: true} )
          .sort("-createdAt")
          .populate("user", "name")
          .lean();        
        return sendSuccess(res, "Products retrieved successfully", products);
      }

      case "PUT": {
        const { id } = query;
        const { name, type, measurment_name, sub_measurment_name, sub_measurment_value } = body;

        if (!id || !name || !type || !measurment_name) {
          return sendBadRequest(res, "Missing required fields");
        }

        // Make sure the product belongs to the user's company
        const product = await Product.findOne({ 
          _id: id,
          companyId: req.user.companyId 
        });
        
        if (!product) {
          return sendNotFound(res, "Product not found");
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { 
            name, 
            type, 
            measurment_name, 
            sub_measurment_name,
            sub_measurment_value
          },
          { new: true }
        );

        return sendSuccess(res, "Product updated successfully", updatedProduct);
      }

      default:
        return sendBadRequest(res, `Method ${method} Not Allowed`);
    }
  } catch (error) {
    return sendError(res, error);
  }
}

// Wrap handler with both middlewares
export default withTenant(protectRoute(['admin', 'company_admin', 'storeMan', 'barMan', 'finance'])(handler));
