import mongoose from "mongoose";

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
        index: true // Add index for faster queries
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
    mainStore: { // store that only store products
        type: Boolean,
        required: [true, "Please configure operation"],
    },
    subStore: {  // sub stores can sell and import products
        type: Boolean,
        required: [true, "Please configure transfer"],
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

// Create compound index for unique store names per company
storeListSchema.index({ name: 1, companyId: 1 }, { unique: true });

const StoreList = mongoose.models.StoreList || mongoose.model("StoreList", storeListSchema);
export default StoreList;