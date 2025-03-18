import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import readline from 'readline';

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
  warn: '\x1b[33m%s\x1b[0m',     // Yellow
  highlight: '\x1b[35m%s\x1b[0m' // Purple
};

// Helper functions for logging
const success = (msg) => console.log(styles.success, `✓ ${msg}`);
const error = (msg) => console.error(styles.error, `✗ ${msg}`);
const info = (msg) => console.log(styles.info, `ℹ ${msg}`);
const warn = (msg) => console.log(styles.warn, `⚠ ${msg}`);
const highlight = (msg) => console.log(styles.highlight, `➤ ${msg}`);

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  error('MONGO_URI is not defined in environment variables');
  console.log('Please check your .env file and ensure MONGO_URI is defined correctly');
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Fix all user passwords
async function fixUserPasswords() {
  try {
    info('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    success('Connected to MongoDB successfully');

    // Define user schema directly here - this is just for the script
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, required: true },
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
      isActive: { type: Boolean, default: true }
    });

    // Add password comparison method
    userSchema.methods.comparePassword = async function(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Find all users
    info('Finding all users...');
    const users = await User.find({}).select('+password');
    
    info(`Found ${users.length} users in the database`);

    // Group users by role for better reporting
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = acc[user.role] || [];
      acc[user.role].push(user);
      return acc;
    }, {});

    // Display summary of users by role
    highlight('Users by role:');
    Object.entries(usersByRole).forEach(([role, users]) => {
      console.log(`  ${role}: ${users.length} users`);
    });

    // Ask for confirmation before proceeding
    const answer = await question('\nThis will reset passwords for ALL users. Continue? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      info('Operation canceled by user');
      rl.close();
      await mongoose.disconnect();
      return;
    }

    // Default passwords by role
    const defaultPasswords = {
      'admin': 'Admin@123',
      'company_admin': 'Admin@123',
      'storeMan': 'Store@123',
      'barMan': 'Bar@123',
      'finance': 'Finance@123',
      'user': 'User@123'
    };

    // Process users
    highlight('\nUpdating user passwords...');
    
    const results = {
      success: 0,
      failed: 0,
      byRole: {}
    };

    for (const user of users) {
      info(`Processing user: ${user.email} (${user.role})`);
      
      try {
        // Get the appropriate default password for this role
        const defaultPassword = defaultPasswords[user.role] || 'Password@123';
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        
        // Update the user record
        await User.findByIdAndUpdate(
          user._id,
          { 
            password: hashedPassword,
            updatedAt: new Date()
          }
        );
        
        // Record success
        results.success++;
        results.byRole[user.role] = (results.byRole[user.role] || 0) + 1;
        
        success(`Updated password for ${user.email} (${user.role})`);
      } catch (err) {
        // Record failure
        results.failed++;
        error(`Error updating user ${user.email}: ${err.message}`);
      }
    }

    // Display summary
    highlight('\nPassword Reset Summary:');
    console.log(`  Total users processed: ${users.length}`);
    console.log(`  Successful updates: ${results.success}`);
    console.log(`  Failed updates: ${results.failed}`);
    
    highlight('Updates by role:');
    Object.entries(results.byRole).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users updated`);
    });

    // Display login instructions
    highlight('\nLogin Instructions:');
    info('You can now log in with the following credentials:');
    Object.entries(defaultPasswords).forEach(([role, password]) => {
      console.log(`  ${role}: [email] / ${password}`);
    });
    info('Please change these passwords after login for security reasons!');
    
  } catch (err) {
    error(`Error: ${err.message}`);
    console.error(err);
  } finally {
    rl.close();
    if (mongoose.connection.readyState !== 0) {
      info('Closing database connection...');
      await mongoose.disconnect();
      success('Database connection closed');
    }
  }
}

// Run the fix function
fixUserPasswords().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
}); 