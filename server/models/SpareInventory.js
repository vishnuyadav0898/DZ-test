import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Inventory = sequelize.define("Inventory", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  machinename: { type: DataTypes.STRING, allowNull: false },
  plantname: { type: DataTypes.STRING, allowNull: false },
  current_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  uom: { type: DataTypes.STRING },
  last_updated_by: { type: DataTypes.STRING },
}, {
  tableName: "inventory",
  timestamps: false,
});

export default Inventory;
