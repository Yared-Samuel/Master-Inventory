import mongoose from "mongoose";

const transactionSchema =new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, "Company ID is required"],
        index: true // Add index for faster queries
    },
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
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Product is required"],
        ref: "Product"
    },    
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        trim: true
    },
    // Fields for handling measurement units
    originalQuantity: {
        type: Number,
        trim: true
    },
    measurementType: {
        type: String,
        enum: ['main', 'sub'],
        default: 'main'
    },
    measurementUnit: {
        type: String,
        trim: true
    },
    conversionRate: {
        type: Number,
        default: 1
    },
    totalPrice: { // for purchase only
        type: Number,
        // required: [true, "Total price is required!"],
        trim: true
    },
    remaining: {
        type: Number,
        default: 0,
        required: [true, "Balance is required!"]
    },       
    remainingAfterTransfer: {
        type: Number,
        default: 0,
        
    },       
    fromStore: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoreList",
        required: [true, "store is required!"]      
    },
    
    tin: { // for delivery only
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
},{
    timestamps: true
})

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema)
export default Transaction

