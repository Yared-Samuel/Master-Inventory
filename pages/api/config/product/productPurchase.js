import connect from "@/lib/db";
import Product from "@/models/productModel";
import { getIdFromToken } from "@/lib/getDataFromToken";

export default async function handler(req, res) {
    const {  cookies } = req;
  const token = cookies?.token
  await getIdFromToken(token)
  connect()
  try {
    // Find all products in the database without any filtering
    const products = await Product.find()
      .sort("-createdAt")
      
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database error. Please try again later.",
      data: error.message,
    });
  }
}
