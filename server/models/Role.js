import sql from "../db.js";

// Function to create a new role
export async function createRole(roleName) {
  const result = await sql`
    INSERT INTO roles (role)
    VALUES (${roleName})
    RETURNING *
  `;
  return result[0];
}

// Function to get all roles
export async function getRoles() {
  const roles = await sql`
    SELECT * FROM roles
  `;
  return roles;
}
// common func to get role to use in users, and others routes
export async function getRoleById(id) {
  const result = await sql`
    SELECT * FROM roles WHERE id = ${id}
  `;
  return result[0];
}


