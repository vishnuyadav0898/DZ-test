import sql from "../db.js";

export async function findOrCreateAddress(addressInput) {
  const addresses = Array.isArray(addressInput) ? addressInput : [addressInput];
  const results = [];

  for (const address of addresses) {
    const { street, city, state, country_code, pincode } = address;

    if (!city || !state || !pincode || !country_code) {
      throw new Error("Incomplete address details");
    }

    // Try to find existing
    const [existing] = await sql`
      SELECT id FROM addresses
      WHERE street = ${street || null}
        AND city = ${city}
        AND state = ${state}
        AND country_code = ${country_code}
        AND pincode = ${pincode}
    `;

    if (existing) {
      results.push(existing);
      continue;
    }

    // Insert new
    const [inserted] = await sql`
      INSERT INTO addresses (street, city, state, country_code, pincode)
      VALUES (${street || null}, ${city}, ${state}, ${country_code}, ${pincode})
      RETURNING id
    `;

    results.push(inserted);
  }

  return Array.isArray(addressInput) ? results : results[0];
}
