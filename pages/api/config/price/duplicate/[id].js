import connect  from "@/lib/db";
import { getSellingPriceModel } from "@/lib/models";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connect();
    const Sprice = getSellingPriceModel();
    const companyId = req.body.companyId;
    const userRole = req.body.role;
    const companyFilter = userRole === 'admin' ? {} : { companyId: companyId };
    // Get the original price list
    const originalPriceList = await Sprice.findOne({
      _id: req.query.id,
      ...companyFilter
    }).populate('products.product');
    if (!originalPriceList) {
      return res.status(404).json({ success: false, message: 'Price list not found' });
    }

    // Create new price list object with copied data
    const newPriceList = new Sprice({
      name: `${originalPriceList.name} (Copy)`,
      companyId: companyId,
      products: originalPriceList.products.map(product => ({
        product: product.product._id,
        sellingPrice: product.sellingPrice
      })),
      user: originalPriceList.user // Maintain the same user reference
    });
    // Save the new price list
    await newPriceList.save();

    return res.status(200).json({
      success: true,
      message: 'Price list duplicated successfully',
      data: newPriceList
    });

  } catch (error) {
    console.error('Error duplicating price list:', error);
    return res.status(500).json({
      success: false,
      message: 'Error duplicating price list',
      error: error.message
    });
  }
}
