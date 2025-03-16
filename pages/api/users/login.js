import { generateToken } from "@/actions/jwt";
import connect from "@/lib/db";
import { getUserModel, getCompanyModel } from "@/lib/models";
import { sendSuccess, sendError, sendBadRequest, sendNotFound, sendUnauthorized } from "@/lib/utils/responseHandler";
import { serialize } from "cookie";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24, // 1 day
  path: "/"
};

export default async function Login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendBadRequest(res, "Email and password are required");
    }

    // Important: Connect to database before using models
    await connect();
    
    // Get models from registry
    const User = getUserModel();
    const Company = getCompanyModel();


    // Find user and populate company details
    const user = await User.findOne({ email })
      .select('+password')
      .populate('companyId', 'name isActive subscription');
      
    if (!user) {
      return sendNotFound(res, "User not found");
    }
    
    // Check if user is active
    if (!user.isActive) {
      return sendUnauthorized(res, "Your account has been deactivated");
    }
    
    // Check if company is active
    if (!user.companyId || !user.companyId.isActive) {
      return sendUnauthorized(res, "Company account is inactive");
    }
    
    // Check subscription status (optional, can be expanded based on needs)
    const hasValidSubscription = validateSubscription(user.companyId.subscription);
    if (!hasValidSubscription && user.role !== 'admin') {
      return sendUnauthorized(res, "Company subscription has expired");
    }

    // Use the comparePassword method from our model
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return sendBadRequest(res, "Invalid credentials");
    }

    // Generate token with user ID and company ID
    const token = generateToken(
      user._id,
      user.companyId._id,
      user.role
    );
    
    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    res.setHeader("Set-Cookie", serialize("token", token, COOKIE_OPTIONS));
    console.log(user.companyId)
    return sendSuccess(res, "Login successful", {
     
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId._id,
        companyName: user.companyId.name,
        permissions: {
          isAdmin: user.role === 'admin',
          isCompanyAdmin: user.role === 'company_admin',
          canAccessConfig: ['admin', 'company_admin'].includes(user.role),
          canAccessReports: ['admin', 'company_admin', 'storeMan', 'barMan', 'finance'].includes(user.role)
        }
      
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, error);
  }
}

// Helper function to validate subscription status
function validateSubscription(subscription) {
  if (!subscription) return true; // No subscription data means no restrictions
  
  // If there's an expiry date, check it
  if (subscription.expiresAt) {
    const now = new Date();
    const expiryDate = new Date(subscription.expiresAt);
    return now < expiryDate;
  }
  
  // Free plan is always valid
  if (subscription.plan === 'free') {
    return true;
  }
  
  return true; // Default to valid if no specific checks apply
}


