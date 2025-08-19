// Add this to controllers/spareInventory.js
import * as inventory from '../models/SpareInventory.js';

export const handleTransactionController = async (req, res) => {
  const {
    name,
    category,
    machinename,
    plantname,
    transaction_type,
    quantity,
    uom,
    employeename,
     notes
  } = req.body;

  // --- Validation ---
  if (!name || !category || !machinename || !plantname  || !transaction_type || !quantity) {
    return res.status(400).json({ message: "Missing required fields for transaction." });
  }

  if (transaction_type !== 'IN' && transaction_type !== 'OUT') {
    return res.status(400).json({ message: "transaction_type must be 'IN' or 'OUT'." });
  }

  try {
  

    // Call the model function to handle the transaction
    const result = await inventory.handleStockTransaction({
      name,
      category,
      machinename,
      plantname,
      transaction_type,
      quantity,
      uom,
      employeename,
       notes
    });

    res.status(200).json({ message: "Transaction completed successfully", data: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing transaction", error: err.message });
  }
};
// Add this to controllers/spareInventory.js

export const getHistoryController = async (req, res) => {
  const { id } = req.params; // The ID of the inventory item

  try {
    const history = await inventory.getTransactionHistory(id);
    if (!history || history.length === 0) {
      return res.status(404).json({ message: "No transaction history found for this item." });
    }
    res.status(200).json({ data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching transaction history", error: err.message });
  }
};

