import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * This file explicitly registers all mongoose models
 * to prevent "Schema hasn't been registered" errors
 */

// Cache for compiled models
const models = {};

// Company Schema
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
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
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

// Register Company model
models.Company = mongoose.models.Company || mongoose.model('Company', companySchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"]
  },
  email: {
    type: String,
    required: [true, "Please add a email"],
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
  assignedStores: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'StoreList',
    default: []
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

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add product name"],
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "Company ID is required"],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ["finished", "forSale", "raw", "fixed", "use-and-throw", "others"],
    required: [true, "Please assign type"],
  },
  measurment_name: {
    type: String,
    trim: true,
    required: [true, "Please add a measurment name"],
  },
  sub_measurment_name: {
    type: String,
    trim: true,
    default: null,
  },
  sub_measurment_value: {
    type: Number,
    default: 1, // Default to 1 if no sub-measurement ratio is specified
  },
  used_products: {
    type: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        // Required if quantity is not null
        required: function() {
          return this.quantity != null;
        }
      },
      quantity: {
        type: Number,
         // Required if productId is not null
        required: function() {
          return this.productId != null;
        }
      }
    }],
    // Required if type is forSale
    required: function() {
      return this.type === 'forSale';
    }
  },
  selling_price: [{
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreList',
      required: true
    },
    price_sub_measurment: {
      type: Number,
      required: true
    },
    price_main_measurment: {
      type: Number,
      default: null
    }
  }],

  sku: { type: String, trim: true },
  barcode: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// StoreList Schema
const storeListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Store name is required!"],
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "Company ID is required"],
    index: true
  },
  Sprice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprice'
  },
  operator: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  mainStore: {
    type: Boolean,
    required: [true, "Please configure operation"],
  },
  subStore: {
    type: Boolean,
    required: [true, "Please configure transfer"],
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Selling Price Schema
const sellingPriceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Price list name is required"],
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "Company ID is required"],
    index: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sellingPrice: {
      type: Number,
      required: true
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Inventory Transaction Schema
const transactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ['purchase','use','sale','send','receive','waste'],
    required: [true, "Trasnaction type is required"],        
  },    
  status: {
    type: String,
    enum: ['pending', 'done'],
    required: [true, "Type is required!"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    trim: true
  },
  totalPrice: {
    type: Number,
    trim: true
  },
  remainingBeforeTransfer: {
    type: Number,
    default: 0,
  },       
  remaining: {
    type: Number,
    default: 0,
    required: [true, "Balance is required!"]
  },       
  fromStore: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreList",
    required: [true, "store is required!"]      
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Product is required"],
    ref: "Product"
  },    
  tin: {
    type: Number,
    default: null
  },
  date: {
    type: Date,
    required: [true, "Date is required"]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "Company ID is required"],
    index: true
  },
}, { timestamps: true });

// Token Schema
const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600
  }
});

// Product Category Schema
const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "Company ID is required"],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Map schema names to schema objects
const schemas = {
  Company: companySchema,
  User: userSchema,
  Product: productSchema,
  StoreList: storeListSchema,
  Sprice: sellingPriceSchema,
  Transaction: transactionSchema,
  Token: tokenSchema,
  ProductCategory: productCategorySchema
};

/**
 * Get mongoose model with proper registration
 * @param {string} modelName - Name of the model (e.g., 'User', 'Company', 'Product')
 * @returns Mongoose model
 */
export function getModel(modelName) {
  if (models[modelName]) {
    return models[modelName];
  }
  
  if (!schemas[modelName]) {
    throw new Error(`Schema for model ${modelName} not found`);
  }
  
  // Try to get existing model or create a new one
  models[modelName] = mongoose.models[modelName] || mongoose.model(modelName, schemas[modelName]);
  return models[modelName];
}

// Convenience functions for getting specific models
export function getCompanyModel() { return getModel('Company'); }
export function getUserModel() { return getModel('User'); }
export function getProductModel() { return getModel('Product'); }
export function getStoreListModel() { return getModel('StoreList'); }
export function getSellingPriceModel() { return getModel('Sprice'); }
export function getInventoryModel() { return getModel('Transaction'); }
export function getTokenModel() { return getModel('Token'); }
export function getProductCategoryModel() { return getModel('ProductCategory'); }

// Get all models at once (useful for scripts)
export function getModels() {
  return {
    Company: getCompanyModel(),
    User: getUserModel(),
    Product: getProductModel(),
    StoreList: getStoreListModel(),
    Sprice: getSellingPriceModel(),
    Transaction: getInventoryModel(),
    Token: getTokenModel(),
    ProductCategory: getProductCategoryModel()
  };
} 