import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: resolve(rootDir, '.env') });

// Set up console styling
const styles = {
  success: '\x1b[32m%s\x1b[0m', // Green
  error: '\x1b[31m%s\x1b[0m',   // Red
  info: '\x1b[36m%s\x1b[0m',    // Cyan
  warn: '\x1b[33m%s\x1b[0m'     // Yellow
};

// Helper functions for logging
const success = (msg) => console.log(styles.success, `✓ ${msg}`);
const error = (msg) => console.error(styles.error, `✗ ${msg}`);
const info = (msg) => console.log(styles.info, `ℹ ${msg}`);
const warn = (msg) => console.log(styles.warn, `⚠ ${msg}`);

// MongoDB connection string - use MONGO_URI instead of MONGODB_URI
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  error('MONGO_URI is not defined in environment variables');
  console.log('Please check your .env file and ensure MONGO_URI is defined correctly');
  process.exit(1);
}

// Define schemas directly in this file to avoid import issues
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Please add a name"] 
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter valid email"
    ]
  },
  password: {
    type: String,
    required: [true, "Please add a Password"],
    minLength: [6, "Password must be up to 6 characters"],
    select: false,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "Company is required"],
  },
  role: {
    type: String,
    required: [true, "Please Select Role"],
    enum: ['admin', 'company_admin', 'storeMan', 'barMan', 'finance', 'user'],
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
  permissions: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true
  },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: {
    type: String,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter valid email"
    ]
  },
  logo: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'standard', 'premium'],
      default: 'free'
    },
    expiresAt: { type: Date }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Add password hashing method
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

async function seedAdmin() {
  try {
    info('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    success('Connected to MongoDB successfully');

    // Get or create models
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

    // Check if admin already exists
    info('Checking if admin user already exists...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      warn('Admin user already exists:');
      console.log({
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      await mongoose.disconnect();
      return;
    }

    // Create default company for admin
    info('Creating admin company...');
    const company = new Company({
      name: 'System Administration',
      email: 'admin@system.com',
      address: 'System Default',
      isActive: true,
      subscription: {
        plan: 'premium',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });
    
    await company.save();
    success('Admin company created successfully');
    
    // Create admin user with strong password
    info('Creating admin user...');
    const password = 'Admin@123';
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@system.com',
      password: password, // Will be hashed by the pre-save hook
      role: 'admin',
      companyId: company._id,
      isActive: true,
      lastLogin: new Date()
    });
    
    await adminUser.save();
    success('Admin user created successfully');
    
    // Update company with admin reference
    await Company.findByIdAndUpdate(company._id, { createdBy: adminUser._id });
    
    // Display admin credentials
    success('Admin setup completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log('------------------');
    console.log(`Email:    admin@system.com`);
    console.log(`Password: ${password}`);
    console.log('\nIMPORTANT: Please change this password after first login!\n');
    
  } catch (err) {
    error('Unhandled error in seeding process: ' + err.message);
    console.error(err);
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState !== 0) {
      info('Closing database connection...');
      await mongoose.disconnect();
      success('Database connection closed');
    }
  }
}

// Run the seed function
seedAdmin().catch(err => {
  error('Fatal error: ' + err.message);
  process.exit(1);
}); 