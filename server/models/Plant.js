import sql from "../db.js";
import { findUserWithDetailsById } from "./User.js";

// Create a new plant
export async function createPlant({ name, status = false, address_id }) {
  if (!name) throw new Error("name is required for plant creation");
  if (!address_id) throw new Error("address_id is required for plant creation");

  const [result] = await sql`
    INSERT INTO plants (name, status, address_id)
    VALUES (${name}, ${status}, ${address_id})
    RETURNING *
  `;
  return result;
}

// Get all plants with address details
export async function getAllPlants() {
  return sql`
    SELECT 
      p.id, p.name, p.status, p.created_at,
      json_build_object(
        'id', a.id,
        'street', a.street,
        'city', a.city,
        'state', a.state,
        'country_code', a.country_code,
        'pincode', a.pincode
      ) as address
    FROM plants p
    LEFT JOIN addresses a ON p.address_id = a.id
    ORDER BY p.created_at DESC
  `;
}

// Get a single plant by ID with address details
export async function getPlantById(id) {
  const [result] = await sql`
    SELECT 
      p.id, p.name, p.status, p.created_at,
      json_build_object(
        'id', a.id,
        'street', a.street,
        'city', a.city,
        'state', a.state,
        'country_code', a.country_code,
        'pincode', a.pincode
      ) as address
    FROM plants p
    LEFT JOIN addresses a ON p.address_id = a.id
    WHERE p.id = ${id}
  `;
  return result;
}

// Link a plant to a user
export async function linkPlantToUser(userId, plantId) {
  await sql`
    UPDATE users
    SET details = jsonb_set(
      COALESCE(details, '{}'::jsonb),
      '{plant_id}',
      to_jsonb(${plantId}::text),
      true
    )
    WHERE id = ${userId}
  `;

  return findUserWithDetailsById(userId);
}


// Update a plant's details
export async function updatePlant(id, updateData) {
  // Get current plant data
  const [current] = await sql`SELECT * FROM plants WHERE id = ${id}`;
  if (!current) throw new Error("Plant not found");

  // Merge existing data with new data
  const updatedData = {
    name: updateData.name ?? current.name,
    status: updateData.status ?? current.status,
    address_id: updateData.address_id ?? current.address_id
  };

  const [result] = await sql`
    UPDATE plants
    SET ${sql(updatedData, "name", "status", "address_id")}
    WHERE id = ${id}
    RETURNING *
  `;
  return result;
}

// Delete a plant
export async function deletePlant(id) {
  const [result] = await sql`
    DELETE FROM plants WHERE id = ${id} RETURNING *
  `;
  return result;
}

