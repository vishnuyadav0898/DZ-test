import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import Address from "./Address.js";

const Plant = sequelize.define("Plant", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "plants",
  timestamps: false,
});

Plant.belongsTo(Address, { foreignKey: "address_id",as: 'address'  });
export default Plant;
