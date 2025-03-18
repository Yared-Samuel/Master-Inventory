#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import chalk from 'chalk'; // Optional, for colored output

// Setup env
dotenv.config({ path: resolve(__dirname, '..', '.env') });

// Get the current script's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Set colors for output
const success = (msg) => console.log(chalk?.green(msg) || `✅ ${msg}`);
const error = (msg) => console.log(chalk?.red(msg) || `❌ ${msg}`);
const info = (msg) => console.log(chalk?.blue(msg) || `ℹ️ ${msg}`);
const warning = (msg) => console.log(chalk?.yellow(msg) || `⚠️ ${msg}`);

/**
 * Verify MongoDB connection
 */
async function verifyMongoConnection() {
  info("Checking MongoDB connection...");
  
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      error("MONGO_URI not defined in environment variables!");
      return false;
    }
    
    await mongoose.connect(mongoUri);
    success("Successfully connected to MongoDB");
    return true;
  } catch (err) {
    error(`MongoDB connection failed: ${err.message}`);
    return false;
  }
}

/**
 * Import and verify models
 */
async function verifyModels() {
  info("Importing and verifying models...");
  const projectRoot = join(__dirname, '..');
  const modelsToVerify = [
    'userModel.js',
    'companyModel.js',
    'tokenModel.js',
    'productModel.js',
    'inventoryModel.js',
    'storeList.js'
  ];
  
  let allModelsValid = true;
  
  for (const modelFile of modelsToVerify) {
    try {
      const modelPath = join(projectRoot, 'models', modelFile);
      const modelModule = await import(`file://${modelPath}`);
      const Model = modelModule.default;
      
      // Check if it's a valid Mongoose model
      if (Model && Model.modelName && mongoose.model(Model.modelName) === Model) {
        success(`✓ ${modelFile}: Valid Mongoose model (${Model.modelName})`);
      } else {
        warning(`⚠ ${modelFile}: Not a valid Mongoose model or couldn't verify`);
        allModelsValid = false;
      }
    } catch (err) {
      error(`✗ ${modelFile}: ${err.message}`);
      allModelsValid = false;
    }
  }
  
  return allModelsValid;
}

/**
 * Check for existing admin
 */
async function checkForAdmin() {
  info("Checking for existing admin user...");
  
  try {
    // Dynamically import User model
    const projectRoot = join(__dirname, '..');
    const userModelPath = join(projectRoot, 'models', 'userModel.js');
    const userModule = await import(`file://${userModelPath}`);
    const User = userModule.default;
    
    const adminUser = await User.findOne({ email: 'admin@system.com' });
    
    if (adminUser) {
      success("Admin user exists!");
      info(`Admin email: ${adminUser.email}`);
      info(`Admin role: ${adminUser.role}`);
      info(`Last login: ${adminUser.lastLogin ? new Date(adminUser.lastLogin).toLocaleString() : 'Never'}`);
      return true;
    } else {
      warning("No admin user found. You should run the seed script to create one.");
      return false;
    }
  } catch (err) {
    error(`Error checking for admin: ${err.message}`);
    return false;
  }
}

/**
 * Verify login functionality
 */
async function verifySetup() {
  try {
    info("Starting system verification...");
    
    info("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    success("Connected to MongoDB successfully");

    // Define user schema for testing
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true, select: false },
      role: { type: String, required: true },
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
      isActive: { type: Boolean, default: true }
    });

    // Add comparePassword method for testing
    userSchema.methods.comparePassword = async function(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Test passwords for each role type
    const testPasswords = {
      'admin': 'Admin@123',
      'company_admin': 'Admin@123',
      'storeMan': 'Store@123',
      'barMan': 'Bar@123',
      'finance': 'Finance@123',
      'user': 'User@123'
    };

    // Check database connection
    info("\nVerifying database connection...");
    if (mongoose.connection.readyState === 1) {
      success("Database connection is active");
    } else {
      error("Database connection failed!");
      process.exit(1);
    }

    // Find users by role
    info("\nVerifying user accounts...");
    const usersByRole = {};
    
    for (const role of Object.keys(testPasswords)) {
      const users = await User.find({ role }).select('+password');
      usersByRole[role] = users;
      
      if (users.length > 0) {
        success(`Found ${users.length} users with role '${role}'`);
      } else {
        warn(`No users found with role '${role}'`);
      }
    }

    // Test password login for each role
    info("\nTesting password authentication...");
    
    for (const [role, users] of Object.entries(usersByRole)) {
      if (users.length === 0) continue;
      
      const testUser = users[0];
      const testPassword = testPasswords[role];
      
      info(`Testing login for ${testUser.email} (${role})...`);
      
      try {
        // Verify the comparePassword method exists
        if (typeof testUser.comparePassword !== 'function') {
          error(`User ${testUser.email} is missing the comparePassword method!`);
          continue;
        }
        
        // Test password comparison
        const passwordMatches = await testUser.comparePassword(testPassword);
        
        if (passwordMatches) {
          success(`Login test for ${role} role successful! (${testUser.email})`);
        } else {
          error(`Login test failed for ${role} role. Password mismatch.`);
          info(`Try running 'node scripts/fix-user-passwords.mjs' to reset the password.`);
        }
      } catch (err) {
        error(`Error testing login for ${role}: ${err.message}`);
      }
    }

    // Verify schema methods
    info("\nVerifying schema methods...");
    
    if (userSchema.methods.comparePassword) {
      success("User schema has comparePassword method");
    } else {
      error("User schema is missing comparePassword method!");
    }

    // Final verdict
    info("\nVerification complete!");
    info("If any tests failed, run the password reset script:");
    info("node scripts/fix-user-passwords.mjs");
    
  } catch (err) {
    error(`Error during verification: ${err.message}`);
    console.error(err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      info("Closing database connection...");
      await mongoose.disconnect();
      success("Database connection closed");
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log("\n===== INVENTORY APP SETUP VERIFICATION =====\n");
  
  // Step 1: Check MongoDB connection
  const dbConnected = await verifyMongoConnection();
  if (!dbConnected) {
    error("MongoDB connection failed. Please check your connection string and make sure MongoDB is running.");
    process.exit(1);
  }
  
  // Step 2: Verify models
  const modelsValid = await verifyModels();
  if (!modelsValid) {
    warning("Some models couldn't be verified. This might cause issues.");
  }
  
  // Step 3: Check for admin user
  const adminExists = await checkForAdmin();
  if (!adminExists) {
    info("To create an admin user, run one of these commands:");
    info("- With Node.js: node scripts/seedAdmin.mjs");
    info("- With API: POST to /api/seed/admin with { secretKey: 'seed-inventory-app-securely' }");
    info("- With MongoDB shell: mongosh your-connection-string --file scripts/mongodb-seed.js");
  }
  
  // Step 4: Verify login functionality
  await verifySetup();
  
  console.log("\n===== VERIFICATION COMPLETE =====\n");
  
  // Disconnect from MongoDB
  await mongoose.disconnect();
  info("Disconnected from MongoDB");
}

// Run the verification
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 