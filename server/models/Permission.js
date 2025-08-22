// models/permissionModel.js
import sql from "../db.js";

// Create tables if not exist
export async function initPermissionTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS role_has_permissions (
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );
  `;
}

// Get all permissions
export async function getPermissions() {
  return await sql`SELECT * FROM permissions ORDER BY id`;
}

// Add new permission
export async function createPermission(name) {
  return await sql`
    INSERT INTO permissions (name) VALUES (${name})
    RETURNING *;
  `;
}

// Assign permissions to a role
export async function assignPermissionsToRole(roleId, permissionIds) {
  const values = permissionIds.map((pid) => ({
    role_id: roleId,
    permission_id: pid,
  }));
  return await sql`
    INSERT INTO role_has_permissions ${sql(values)}
    ON CONFLICT DO NOTHING
  `;
}

// Remove permission from a role
export async function removePermissionFromRole(roleId, permissionId) {
  return await sql`
    DELETE FROM role_has_permissions
    WHERE role_id = ${roleId} AND permission_id = ${permissionId}
  `;
}

// Get all permissions of a role
export async function getRolePermissions(roleId) {
  return await sql`
    SELECT p.* 
    FROM permissions p
    INNER JOIN role_has_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = ${roleId};
  `;
}
