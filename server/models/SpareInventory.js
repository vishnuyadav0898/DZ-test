import sql from "../db.js";

export async function handleStockTransaction({
  name,
  category,
  machinename,
  plantname,
  transaction_type,
  quantity,
  uom,
  employeename,
  notes
}) {
  return sql.begin(async (sql) => {
    let inventoryItem;

    // Step 1: Find if an item with these unique characteristics already exists.
    const [existingItem] = await sql`
      SELECT id, current_quantity FROM inventory
      WHERE name = ${name}
        AND category = ${category}
        AND machinename = ${machinename}
        AND plantname = ${plantname}
    `;

    if (existingItem) {
      // --- ITEM EXISTS: UPDATE IT ---
      let newQuantity;
      if (transaction_type === 'IN') {
        newQuantity = Number(existingItem.current_quantity) + quantity;
      } else { // 'OUT'
        if (Number(existingItem.current_quantity) < quantity) {
          throw new Error('Insufficient stock for this transaction.');
        }
        newQuantity =Number(existingItem.current_quantity) - quantity;
      }

      // Update the quantity and timestamp, then store the result.
      const [updatedItem] = await sql`
        UPDATE inventory
        SET
          current_quantity = ${newQuantity},
          last_updated_by = ${employeename},
          updated_at = NOW()
        WHERE id = ${existingItem.id}
        RETURNING *
      `;
      inventoryItem = updatedItem;

    } else {
      // --- ITEM DOES NOT EXIST: CREATE IT (only if transaction is 'IN') ---
      if (transaction_type === 'OUT') {
        throw new Error('Cannot perform stock-out on a non-existent item.');
      }

      // Insert the new item record and store the result.
      const [newItem] = await sql`
        INSERT INTO inventory (
          name, category, machinename, plantname,
          current_quantity, uom, last_updated_by
        ) VALUES (
          ${name}, ${category}, ${machinename}, ${plantname}, 
          ${quantity}, ${uom}, ${employeename}
        )
        RETURNING *
      `;
      inventoryItem = newItem;
    }


    if (inventoryItem) {
      await sql`
        INSERT INTO inventory_transactions (
          inventory_id,
          transaction_type,
          quantity_change,
          employeename,
          notes
        ) VALUES (
          ${inventoryItem.id},
          ${transaction_type},
          ${quantity},
          ${employeename},
          ${notes}
        )
      `;
    }

    // Return the main inventory item's data.
    return inventoryItem;
  });
}


export async function getTransactionHistory(inventory_id) {
  return sql`
    SELECT
      id,
      transaction_type,
      quantity_change,
      employeename,
      notes,
      created_at
    FROM inventory_transactions
    WHERE inventory_id = ${inventory_id}
    ORDER BY created_at DESC
  `;
}
