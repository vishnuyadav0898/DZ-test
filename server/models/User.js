import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import Role from "./Role.js";
import Address from "./Address.js";
import Plant from "./Plant.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  contact: { type: DataTypes.STRING, unique: true },
  designation: { type: DataTypes.STRING },
  details: { type: DataTypes.JSONB },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  has_admin_access: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "users",
  timestamps: true, // Keep this as true

  // --- Add these lines to map to your database's column names ---
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
User.hasMany(Plant, {foreignKey: 'id', as: 'plant'});


export default User;
