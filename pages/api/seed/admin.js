import { getUserModel, getCompanyModel } from "@/lib/models";
import connect from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendSuccess, sendError } from "@/lib/utils/responseHandler";

// This should be a secret key to prevent unauthorized seeding
const SEED_SECRET_KEY = process.env.SEED_SECRET_KEY || "seed-inventory-app-securely";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  
  // Validate secret key
  const { secretKey } = req.body;
  if (!secretKey || secretKey !== SEED_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid or missing secret key."
    });
  }

  try {
    await connect();
    
    const User = getUserModel();
    const Company = getCompanyModel();

    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return sendSuccess(res, "Admin user already exists", { adminExists: true });
    }

    // Create default company
    const company = await Company.create({
      name: "Admin Company",
      email: "admin@example.com",
      isActive: true
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      companyId: company._id,
      isActive: true
    });

    return sendSuccess(res, "Admin user created successfully", {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      company: {
        id: company._id,
        name: company.name
      }
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return sendError(res, error.message || "Error creating admin user");
  }
} 