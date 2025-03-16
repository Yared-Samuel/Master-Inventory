#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chalk from 'chalk'; // Optional, for colored output

// Setup env
dotenv.config();

// Get the current script's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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