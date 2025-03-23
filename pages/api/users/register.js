import { generateToken } from "@/actions/jwt";
import connect from "@/lib/db";
import { getUserModel, getCompanyModel, getTokenModel } from "@/lib/models";
import { sendSuccess, sendError, sendBadRequest, sendConflict } from "@/lib/utils/responseHandler";
import { serialize } from "cookie";
import mongoose from "mongoose";

const User = getUserModel();
const Company = getCompanyModel();
const Token = getTokenModel();

export default async function Register(req, res) {
  const { name, email, password, role, companyName, companyId } = req.body;

  // Basic input validation
  if (!name || !email || !password || !role) {
    return sendBadRequest(res, "Please fill all required fields");
  }

  // For new company registration
  if (role === 'company_admin' && !companyName && !companyId) {
    return sendBadRequest(res, "Company name is required for company admin registration");
  }

  // For joining existing company
  if (role !== 'admin' && role !== 'company_admin' && !companyId) {
    return sendBadRequest(res, "Company ID is required for user registration");
  }

  // Start a MongoDB transaction session to ensure data consistency
  // This allows us to perform multiple database operations atomically
  // If any operation fails, all changes will be rolled back
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connect();    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      await session.abortTransaction();
      session.endSession();
      return sendConflict(res, "Email already exists!");
    }

    let userCompanyId = companyId;

    // If registering as company admin with new company
    if (role === 'company_admin' && companyName && !companyId) {
      // Create a new company
      const newCompany = new Company({
        name: companyName,
        email: email, // Use admin email as initial company email
        createdBy: null // Will update this after user creation
      });
      
      // Save the new company document to the database within the transaction session
      const company = await newCompany.save({ session });
      // Get the generated _id from the saved company and store it for the user
      userCompanyId = company._id;
    } 
    // If joining existing company, verify it exists
    else if (companyId) {
      const existingCompany = await Company.findById(companyId);
      if (!existingCompany) {
        await session.abortTransaction();
        session.endSession();
        return sendBadRequest(res, "Company not found");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password : hashedPassword,
      role,
      companyId: userCompanyId,
      isActive: true,
      lastLogin: new Date()
    });
    
    // Save the user to the database    
    const user = await newUser.save({ session });
    
    
    // If this is a company admin creating a new company, update the company's createdBy field
    if (role === 'company_admin' && companyName && !companyId) {
      await Company.findByIdAndUpdate(
        userCompanyId,
        { createdBy: user._id },
        { session }
      );
    }

    // Generate a token with user and company information
    const token = generateToken(user._id, userCompanyId, role);

    // Create token record
    const tokenRecord = new Token({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day expiration
    });

    // Save the token to the database
    await tokenRecord.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Serialize the token for cookie
    const serialized = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/"
    });

    // Send the response
    res.setHeader("Set-Cookie", serialized);
    return sendSuccess(res, "Registration successful", {
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: userCompanyId
    }, 201);
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    return sendError(res, error);
  }
}
