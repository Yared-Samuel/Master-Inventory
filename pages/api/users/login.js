import { generateToken } from "@/actions/jwt";
import connect from "@/lib/db";
import { getUserModel } from "@/lib/models";
import { sendSuccess, sendError, sendBadRequest, sendNotFound, sendUnauthorized } from "@/lib/utils/responseHandler";
import { serialize } from "cookie";
import bcrypt from 'bcryptjs';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24, // 1 day
  path: "/"
};

// Map of role-specific messages and handling
const roleConfig = {
  'admin': {
    loginMessage: "Admin login successful",
    dashboardRedirect: "/admin/dashboard"
  },
  'company_admin': {
    loginMessage: "Company admin login successful",
    dashboardRedirect: "/dashboard"
  },
  'storeMan': {
    loginMessage: "Store manager login successful",
    dashboardRedirect: "/store/dashboard"
  },
  'barMan': {
    loginMessage: "Bar manager login successful", 
    dashboardRedirect: "/bar/dashboard"
  },
  'finance': {
    loginMessage: "Finance login successful",
    dashboardRedirect: "/finance/dashboard"
  },
  'user': {
    loginMessage: "User login successful",
    dashboardRedirect: "/"
  }
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
    // const Company = getCompanyModel();
    // Find user and populate company details
    const user = await User.findOne({ email })
      .select('+password')
      .populate('companyId', 'name isActive subscription')
      .populate('store', 'name isActive');
    console.log(user)
    if (!user) {
      console.log(`User not found: ${email}`);
      return sendNotFound(res, "User not found");
    }
    
    // Check if user is active
    if (!user.isActive) {
      // console.log(`User account is inactive: ${email}`);
      return sendUnauthorized(res, "Your account has been deactivated");
    }
    
    // Check if company is active
    if (!user.companyId || !user.companyId.isActive) {
      // console.log(`Company is inactive for user: ${email}`);
      return sendUnauthorized(res, "Company account is inactive");
    }
    
    // Check subscription status (optional, can be expanded based on needs)
    const hasValidSubscription = validateSubscription(user.companyId.subscription);
    console.log(hasValidSubscription, "hasValidSubscription")
    if (!hasValidSubscription && user.role !== 'admin') {
      // console.log(`Subscription expired for user: ${email}`);
      return sendUnauthorized(res, "Company subscription has expired");
    }

    
    
    // Verify password using bcrypt directly
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      
      // console.log(`Password verification result: ${isValidPassword}`);
      if (!isValidPassword) {
        // console.log('Password verification failed. Stored password hash:', user.password);
      }
    } catch (err) {
      console.error(`Error during password verification: ${err.message}`);
      console.error('Error details:', err);
      return sendError(res, "Error during password verification");
    }

    if (!isValidPassword) {
      return sendBadRequest(res, "Invalid credentials");
    }

    // Get role-specific config or use defaults
    const roleInfo = roleConfig[user.role] || {
      loginMessage: "Login successful",
      dashboardRedirect: "/dashboard"
    };


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
    // Set the authentication cookie
    res.setHeader("Set-Cookie", serialize("token", token, COOKIE_OPTIONS));
    
    // Return success response with role-specific message
    return sendSuccess(res, roleInfo.loginMessage, {
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId._id,
      companyName: user.companyId.name,
      store: (["storeMan", "barMan"].includes(user.role) && user.store && user.store._id) ? user.store._id : "",
      storeName: (["storeMan", "barMan"].includes(user.role) && user.store && user.store.name) ? user.store.name : "",
      dashboard: roleInfo.dashboardRedirect,
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
    console.log(now, expiryDate)
    return now < expiryDate;
  }
  
  // Free plan is always valid
  if (subscription.plan === 'free') {
    return true;
  }
  
  return true; // Default to valid if no specific checks apply
}


