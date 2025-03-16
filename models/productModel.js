import mongoose from 'mongoose'

import User from './userModel';
// import Company from "./tenantModel";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add product name"],
      trim: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Company ID is required"],
      ref: 'Company',
      index: true // Add index for faster queries
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    type: {
      type: String,
      enum: ["finished","forSale", "raw", "fixed", "use-and-throw", "others"],
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
    },
    sub_measurment_value: {
      type: Number,
      default: 1,
    },
    sku: {
      type: String,
      trim: true
    },
    barcode: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique products per company
productSchema.index({ name: 1, companyId: 1 }, { unique: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
export default Product;
