import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Address = sequelize.define("Address", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  street: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  country_code: { type: DataTypes.STRING, allowNull: false },
  pincode: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "addresses",
  timestamps: false,
});

export default Address;
