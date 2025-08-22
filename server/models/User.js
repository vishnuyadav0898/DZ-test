import sql from '../db.js';

// Find a user by either email or contact number.

export async function findUserByContactOrEmail(identifier) {
  const [result] = await sql`
    SELECT * FROM users WHERE email = ${identifier} OR contact = ${identifier}
  `;
  return result;
}

// Get all users with their associated role, address, and plant details.
export async function findAllUsersWithDetails() {
  const users = await sql`
    SELECT 
      u.id AS user_id,
      u.name AS user_name,
      u.email,
      u.contact,
      u.is_active,
       u.designation,
      u.created_at AS user_created_at,
     
    
      r.name AS role,

      -- Address
      json_build_object(
        'street', a.street,
        'city', a.city,
        'state', a.state,
        'pincode', a.pincode,
        'country', a.country_code
      ) AS address,

      -- Plant (fetch by plant_id from JSON details column)
      CASE 
        WHEN (u.details->>'plant_id') IS NOT NULL THEN
          json_build_object(
            'id', p.id,
            'name', p.name,
            'address', json_build_object(
              'street', pa.street,
              'city', pa.city,
              'state', pa.state,
              'pincode', pa.pincode,
              'country', pa.country_code
            )
          )
        ELSE NULL
      END AS plant

    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN addresses a ON u.address_id = a.id
    LEFT JOIN plants p ON p.id = (u.details->>'plant_id')::uuid
    LEFT JOIN addresses pa ON p.address_id = pa.id
    ORDER BY u.created_at DESC;
  `;
  return users;
}



// Get a specific user by ID, including their role, address, and plant details.

export async function findUserWithDetailsById(id) {
  const [user] = await sql`
    SELECT 
      u.id ,
      u.name as user_name ,
      u.email,
      u.contact,
      u.is_active,
      u.designation,
      u.created_at,
      u.has_admin_access,
      r.name as role,
      
      -- User Address
      json_build_object(
        'street', a.street,
        'city', a.city,
        'state', a.state,
        'pincode', a.pincode,
        'country', a.country_code
      ) AS address,

      CASE 
        WHEN (u.details->>'plant_id') IS NOT NULL THEN
          json_build_object(
            'id', p.id,
            'name', p.name,
            'address', json_build_object(
              'street', pa.street,
              'city', pa.city,
              'state', pa.state,
              'pincode', pa.pincode,
              'country', pa.country_code
            )
          )
        ELSE NULL
      END AS plant

    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN addresses a ON u.address_id = a.id
    LEFT JOIN plants p ON (u.details->>'plant_id')::uuid = p.id
    LEFT JOIN addresses pa ON p.address_id = pa.id
    WHERE u.id = ${id};
  `;

  return user || null;
}


// Update a user's active/inactive status.

export async function updateUserStatus(userId, isActive) {
  const [result] = await sql`
    UPDATE users SET is_active = ${isActive} WHERE id = ${userId} RETURNING id
  `;
  return result;
}

// Create a new user record in the database.
export async function createUser(userData) {
  const {
    name, email, password, contact, details, address_id,
    is_active, role_id,designation,has_admin_access
  } = userData;


  const [result] = await sql`
    INSERT INTO users (
      name, email, password, contact,  address_id,details, is_active ,role_id ,designation,has_admin_access
    ) VALUES (
      ${name}, ${email}, ${password}, ${contact},  ${address_id},${details},${is_active} ,${role_id},${designation},${has_admin_access}
    ) RETURNING id, name, email, contact,  address_id,details, is_active ,designation,has_admin_access
  `;
  return result;
}


