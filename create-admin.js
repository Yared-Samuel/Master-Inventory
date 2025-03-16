// Simple script to create admin user - CommonJS version
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin user details
const ADMIN_USER = {
  name: 'System Administrator',
  email: 'admin@system.com',
  password: 'Admin@123',
  role: 'admin'
};

// Company details
const ADMIN_COMPANY = {
  name: 'System Administration',
  email: ADMIN_USER.email,
  address: 'System Default',
  isActive: true
};

// Connect to MongoDB
async function run() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MONGO_URI not defined in environment variables!');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!');
    
    // Define schemas - IMPORTANT: Define schemas BEFORE referencing them
    const companySchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String },
      address: { type: String },
      isActive: { type: Boolean, default: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      subscription: {
        plan: { type: String, default: 'free' },
        expiresAt: { type: Date }
      }
    }, { timestamps: true });
    
    // Create models - IMPORTANT: Create Company model BEFORE referencing it in User schema
    // Check if model already exists before creating
    let Company;
    try {
      Company = mongoose.model('Company');
    } catch (e) {
      Company = mongoose.model('Company', companySchema);
    }
    
    // Now define the user schema after Company model is registered
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
      role: { type: String, required: true },
      isActive: { type: Boolean, default: true },
      lastLogin: { type: Date }
    }, { timestamps: true });
    
    // Create User model
    let User;
    try {
      User = mongoose.model('User');
    } catch (e) {
      User = mongoose.model('User', userSchema);
    }
    
    // Check if admin already exists
    console.log('Checking if admin user already exists...');
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      await mongoose.disconnect();
      return;
    }
    
    // Create company
    console.log('Creating admin company...');
    let company = await Company.findOne({ name: ADMIN_COMPANY.name });
    
    if (!company) {
      company = new Company(ADMIN_COMPANY);
      await company.save();
      console.log('Admin company created!');
    } else {
      console.log('Admin company already exists!');
    }
    
    // Create admin user
    console.log('Creating admin user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, salt);
    
    const adminUser = new User({
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: hashedPassword,
      role: ADMIN_USER.role,
      companyId: company._id,
      isActive: true,
      lastLogin: new Date()
    });
    
    await adminUser.save();
    
    // Update company with admin reference
    company.createdBy = adminUser._id;
    await company.save();
    
    console.log('\n====================================');
    console.log('🔐 ADMIN USER CREATED SUCCESSFULLY 🔐');
    console.log('====================================');
    console.log(`Email: ${ADMIN_USER.email}`);
    console.log(`Password: ${ADMIN_USER.password}`);
    console.log(`Company: ${ADMIN_COMPANY.name}`);
    console.log('====================================');
    console.log('PLEASE CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);  // Print full stack trace for better debugging
    process.exit(1);
  }
}

// Run the script
run(); 