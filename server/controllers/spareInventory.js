import sequelize from "../sequelize.js"; // Make sure to import your sequelize instance
import Inventory from "../models/SpareInventory.js"; // Corrected import
import InventoryTransaction from "../models/InventoryTransaction.js"; // Corrected import
import User from "../models/User.js";

// -------------------- Handle Inventory Transaction --------------------
export const handleTransactionController = async (req, res) => {
  const { name, category, machinename, plantname, transaction_type, quantity, uom, notes } = req.body;
  const userId = req.user.id;

  // --- Validation ---
  if (!name || !category || !machinename || !plantname || !transaction_type || !quantity) {
    return res.status(400).json({ message: "Missing required fields for transaction." });
  }

  if (!["IN", "OUT"].includes(transaction_type)) {
    return res.status(400).json({ message: "transaction_type must be 'IN' or 'OUT'." });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // 1. Find or create the inventory item
      const [inventoryItem, created] = await Inventory.findOrCreate({ // Using correct model
        where: { name, category, machinename, plantname },
        // FIX: Use 'current_quantity' to match the model definition
        defaults: { name, category, machinename, plantname, current_quantity: 0, uom },
        transaction: t,
      });

      // 2. Check stock for 'OUT' transactions
      // FIX: Use 'current_quantity' to check stock
      if (transaction_type === "OUT" && inventoryItem.current_quantity < quantity) {
        throw new Error("Insufficient stock for this transaction.");
      }

      // 3. Update the quantity
      // FIX: Use 'current_quantity' for calculation and assignment
      const newQuantity = transaction_type === "IN"
          ?Number(inventoryItem.current_quantity) + Number(quantity)
          :Number(inventoryItem.current_quantity) - Number(quantity);
      inventoryItem.current_quantity = newQuantity;
      await inventoryItem.save({ transaction: t });

      // 4. Record the transaction in the history table
      const user = await User.findByPk(userId, { transaction: t });
      const historyLog = await InventoryTransaction.create( // Using correct model
        {
          // FIX: Use 'inventory_id' and 'inventoryItem.id' (lowercase 'i')
          inventory_id: inventoryItem.id,
          transaction_type,
          quantity_change: Number(quantity), 
          employee_name: user ? user.name : "Unknown User",
          notes,
        },
        { transaction: t }
      );

      return { inventoryItem, historyLog };
    });

    res.status(200).json({ message: "Transaction completed successfully", data: result });
  } catch (err) {
    console.error("Transaction Error:", err);
    res.status(500).json({ message: "Error processing transaction", error: err.message });
  }
};

// -------------------- Get Transaction History for an Item --------------------
export const getHistoryController = async (req, res) => {
  const { id } = req.params; // The ID of the Inventory item

  try {
    const history = await InventoryTransaction.findAll({ // Using correct model
      // FIX: Assuming the foreign key in InventoryTransaction is 'inventory_id'
      where: { inventory_id: id },
      order: [[ "id"]],
    });

    if (!history.length) {
      return res.status(404).json({ message: "No transaction history found for this item." });
    }
    res.status(200).json({ data: history });
  } catch (err) {
    console.error("Get History Error:", err);
    res.status(500).json({ message: "Error fetching transaction history", error: err.message });
  }
};
