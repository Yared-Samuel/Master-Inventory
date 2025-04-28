import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { withUsageTracking } from "@/lib/middleware/usageMiddleware";
import { sendSuccess, sendError, sendBadRequest, sendNotFound, sendUnauthorized } from "@/lib/utils/responseHandler";
import bcrypt from "bcryptjs";
import { getUserModel, getCompanyModel  } from "@/lib/models";
import connect from "@/lib/db";
import { getUsageStats } from '../../../lib/usage';
const User = getUserModel()
const Company = getCompanyModel()

async function handler(req, res) {
  try {
    // Track API usage
    await getUsageStats('users_api');
    
    const { method } = req;
    
    await connect();
    
    // The user and company info is added by the tenant middleware
    const { role } = req.user;
    
    // Only admin can access this endpoint
    if (role !== "admin") {
      return sendUnauthorized(res, "Only system administrators can manage users across companies");
    }
    
    switch (method) {
      case "GET":
        // Get all users, optionally filtered by company
        const { companyId } = req.query;
        const users = await getUsers(companyId);
        return sendSuccess(res, "Users retrieved successfully", users);
        
      case "POST":
        // Create a new user
        const userData = req.body;
        console.log(userData);
        const newUser = await createUser(userData);
        return sendSuccess(res, "User created successfully", newUser, 201);
        
      case "PUT":
        // Update a user
        const updatedUser = await updateUser(req.body);
        return sendSuccess(res, "User updated successfully", updatedUser);
        
      case "DELETE":
        // Delete or deactivate a user
        const { userId } = req.query;
        if (!userId) {
          return sendBadRequest(res, "User ID is required");
        }
        await deactivateUser(userId);
        return sendSuccess(res, "User deactivated successfully");
        
      default:
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
  } catch (error) {
    return sendError(res, error);
  }
}

// Get users, optionally filtered by company
async function getUsers(companyId) {
  let query = {};
  
  if (companyId) {
    query.companyId = companyId;
  }
  
  const users = await User.find(query)
    .select("-password")
    .populate("companyId", "name")
    .sort({ createdAt: -1 });
    
  return users;
}

// Create a new user
async function createUser(data) {
  const { name, email, password, role, companyId, assignedStores } = data;
  
  if (!name || !email || !password || !role || !companyId) {
    throw new Error("All fields are required");
  }
  
  // Check if user with email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  
  // Check if company exists
  const company = await Company.findById(companyId);
  if (!company) {
    throw new Error("Company not found");
  }
  
  // Create password hash
  console.log(password)
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log(hashedPassword)
  // Create user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
    companyId,
    isActive: true,
    assignedStores: assignedStores || []
  });
  
  await newUser.save();
  
  // Remove password from response
  const userResponse = newUser.toObject();
  delete userResponse.password;
  
  return userResponse;
}

// Update a user
async function updateUser(data) {
  const { _id, name, email, role, isActive, companyId } = data;
  
  if (!_id) {
    throw new Error("User ID is required");
  }
  
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  
  // If changing company, check if new company exists
  if (companyId && companyId !== user.companyId.toString()) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error("Company not found");
    }
  }
  
  // Prepare update data
  const updateData = {};
  if (name) updateData.name = name;
  if (email && email !== user.email) {
    // Check if email is already taken
    const existingUser = await User.findOne({ email, _id: { $ne: _id } });
    if (existingUser) {
      throw new Error("Email is already taken");
    }
    updateData.email = email;
  }
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (companyId) updateData.companyId = companyId;
  
  // If password is provided, hash it
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(data.password, salt);
  }
  
  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    updateData,
    { new: true, runValidators: true }
  ).select("-password");
  
  return updatedUser;
}

// Deactivate a user (soft delete)
async function deactivateUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  await User.findByIdAndUpdate(userId, { isActive: false });
  return true;
}

// Wrap handler with tenant middleware
export default withTenant(withUsageTracking(handler)); 