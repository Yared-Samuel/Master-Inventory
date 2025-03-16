import { checkInventoryAvailability } from "@/lib/inventory/inventoryUtils";

// Check inventory levels
const inventory = await checkInventoryAvailability(productId, storeId, 0);
if (inventory.success) {
  return res.status(200).json({
    available: inventory.remaining,
    lastTransaction: inventory.latestTransaction
  });
} 