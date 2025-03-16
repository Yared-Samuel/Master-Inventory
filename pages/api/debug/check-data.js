import connect from "@/lib/db";
import { getProductModel, getSellingPriceModel } from "@/lib/models";
import { sendSuccess } from "@/lib/utils/responseHandler";

export default async function handler(req, res) {
  try {
    await connect();
    const Product = getProductModel();
    const Sprice = getSellingPriceModel();
    
    // Count all records
    const productCount = await Product.countDocuments({});
    const priceCount = await Sprice.countDocuments({});
    
    // Get a sample of each
    const sampleProduct = await Product.findOne({}).lean();
    const samplePrice = await Sprice.findOne({}).lean();
    
    return sendSuccess(res, "Data check complete", {
      products: {
        count: productCount,
        sample: sampleProduct || null
      },
      prices: {
        count: priceCount,
        sample: samplePrice || null
      },
      models: {
        productModel: !!Product,
        priceModel: !!Sprice
      }
    });
  } catch (error) {
    console.error("Data check error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking data",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 