# Setting Up Admin User in Inventory Management System

After implementing multi-tenancy in the application, you'll need to set up an initial super admin user to manage companies and users. This document explains the different ways to create this user.

## Default Admin Credentials

The default admin user will be created with the following credentials:

- **Email**: `admin@system.com`
- **Password**: `Admin@123` 
- **Role**: `admin`
- **Company**: `System Administration`

**IMPORTANT**: Change this password immediately after your first login!

## Method 1: Using the Seed Script (Recommended)

The easiest way to create the admin user is to use the provided seed script.

```bash
# Make sure you're in the project root directory
npm run seed:admin

# Or run it directly
node scripts/seedAdmin.mjs
```

This script will:
1. Connect to your database (using the MONGODB_URI from your .env file)
2. Create a default company if it doesn't exist
3. Create the admin user if it doesn't exist
4. Print the credentials to the console
5. Save the credentials in a text file (`scripts/admin-credentials.txt`)

## Method 2: Using the API Endpoint

If you prefer to create the admin user via an API call, you can use the provided endpoint:

```bash
# Using curl
curl -X POST http://localhost:3000/api/seed/admin \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "seed-inventory-app-securely"}'

# Using Postman or similar tool
POST http://localhost:3000/api/seed/admin
Content-Type: application/json

{
  "secretKey": "seed-inventory-app-securely"
}
```

Note: The secret key is defined in `pages/api/seed/admin.js` and can be changed by setting the `SEED_SECRET_KEY` environment variable.

## Method 3: Using MongoDB Shell

If you're comfortable with MongoDB, you can create the admin user directly in the database using the provided MongoDB shell script:

```bash
# Connect to your MongoDB instance
mongosh "mongodb://your-connection-string" --file scripts/mongodb-seed.js
```

## Verifying Your Setup

You can run the verification script to check if your database and admin user are set up correctly:

```bash
npm run verify:setup
```

This script will:
1. Check your MongoDB connection
2. Verify that all required models are working
3. Check if the admin user exists
4. Provide guidance on next steps

## Troubleshooting

If you encounter issues while setting up the admin user:

1. **Database Connection**: Make sure your MONGODB_URI in .env is correct
2. **Model Errors**: Check that all model files are correctly set up
3. **Import Errors**: You may need to install additional dependencies: `npm install dotenv bcryptjs mongoose`
4. **Path Errors**: Make sure the script is run from the project root directory

If you have persistent issues, you can view the error logs in the console or modify the scripts to add more detailed logging. 