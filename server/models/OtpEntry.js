import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const OtpEntry = sequelize.define("OtpEntry", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  contact: { type: DataTypes.STRING, unique: true },
  otp: { type: DataTypes.STRING, allowNull: false },
  otp_expires_at: { type: DataTypes.DATE, allowNull: false },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "otp_entries",
  timestamps: false, // Set this to false
});

export default OtpEntry;
