import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import Role from "./Role.js";
import Permission from "./Permission.js";

const RolePermission = sequelize.define("RolePermission", {
  role_id: { type: DataTypes.INTEGER, primaryKey: true },
  permission_id: { type: DataTypes.INTEGER, primaryKey: true },
}, {
  tableName: "role_has_permissions",
  timestamps: false,
});

// Many-to-many relation
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "role_id" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permission_id" });

export default RolePermission;
