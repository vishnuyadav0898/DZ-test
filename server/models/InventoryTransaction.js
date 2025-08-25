import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import Inventory from "./SpareInventory.js";

const InventoryTransaction = sequelize.define("InventoryTransaction", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  transaction_type: { type: DataTypes.ENUM("IN", "OUT"), allowNull: false },
  quantity_change: { type: DataTypes.INTEGER, allowNull: false },
  employeename: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: "inventory_transactions",
  timestamps: false,
});

InventoryTransaction.belongsTo(Inventory, { foreignKey: "inventory_id" });

export default InventoryTransaction;
