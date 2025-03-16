import connect from "@/lib/db";
import Transaction from "@/models/inventoryModel";
import { getIdFromToken } from "@/lib/getDataFromToken";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import {
  checkInventoryAvailability,
  checkInventoryAvailabilityToStore,
  getSellingPrice,
} from "@/lib/inventory/inventoryUtils";

export default async function handler(req, res) {
  try {
    const { body, method, cookies } = req;
    const token = cookies?.token;
    const userId = await getIdFromToken(token);

    if (!userId.success) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    await connect();

    switch (method) {
      case "POST":
        return await handleTransferTransaction(body, userId.id, res);
      case "GET":
        return await getTransferTransactions( res);
      default:
        return res
          .status(405)
          .json({ success: false, message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Transaction API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

async function handleTransferTransaction(body, userId, res) {
  const { productId, quantity, fromStore, toStore, date } = body;

  // Validate input
  if (!validatePurchaseInput(productId, quantity, fromStore, toStore)) {
    return res.status(400).json({
      success: false,
      message: "All fields are required and must be valid!",
    });
  }

  // Check inventory availability
  const inventoryCheck = await checkInventoryAvailability(
    productId,
    fromStore,
    quantity
  );
  const inventoryCheckRecive = await checkInventoryAvailabilityToStore(
    productId,
    toStore
    
  );
  
  if (!inventoryCheck.success || !inventoryCheckRecive.success) {
    return res.status(400).json(inventoryCheck, inventoryCheckRecive);
  }

  // Get selling price
  const priceDetails = await getSellingPrice(toStore, productId);
  if (!priceDetails.success) {
    return res.status(400).json(priceDetails);
  }
  // Create transaction
  const send = await createTransferTransaction({
    productId,
    quantity,
    fromStore,
    totalPrice: priceDetails.price * quantity,
    remaining: inventoryCheck.remaining - quantity,
    date: date || new Date(),
    userId,
    transactionType: "send",
  });
  const receive = await createTransferTransaction({
    productId,
    quantity,
    fromStore: toStore,
    totalPrice: priceDetails.price * quantity,
    remaining: inventoryCheckRecive.remaining + quantity,
    date: date || new Date(),
    userId,
    transactionType: "receive",
  });

  return res.status(201).json({
    success: true,
    message: "Transaction added successfully!",
    data: { send, receive },
  });
}

async function getTransferTransactions(res) {
  try {
    const query = {
      transactionType:{ $in: ["send", "receive"]},
      status: "done",
    };

    // Get trtansaction
    const transactions = await Transaction.find(query)
      .sort("-createdAt")
      .populate("productId", "name")
      .populate("fromStore", "name")
      .populate("user", "name");
    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sales transactions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Helper functions
async function createTransferTransaction({
  productId,
  quantity,
  fromStore,
  totalPrice,
  remaining,
  date,
  userId,
  transactionType,
}) {
  const newTransfer = new Transaction({
    transactionType,
    status: "done",
    productId: new ObjectId(productId),
    quantity,
    fromStore: new ObjectId(fromStore),
    totalPrice,
    remaining,
    date,
    user: userId,
  });

  return await newTransfer.save();
}

// Helper functions
function validatePurchaseInput(productId, quantity, fromStore, toStore) {
  return (
    isValidObjectId(productId) &&
    isValidObjectId(fromStore) &&
    isValidObjectId(toStore) &&
    fromStore !== toStore &&
    typeof quantity == "number" &&
    quantity > 0
  );
}
