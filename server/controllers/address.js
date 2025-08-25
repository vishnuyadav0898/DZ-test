import Address from "../models/Address.js";
export const findOrCreateAddressController = async (req, res) => {
  const addressData = req.body;

  const { street, city, state, pincode, country_code } = addressData;
  if (!city || !state || !pincode || !country_code) {
    return res.status(400).json({
      message: "Incomplete address. Required fields are: city, state, pincode, country_code.",
    });
  }

  try {
  
    const [address, created] = await Address.findOrCreate({
      where: {
        street: street || null, 
        city,
        state,
        pincode,
        country_code,
      },
      defaults: addressData, 
    });

    
    return res.status(200).json({
      message: created ? "New address created successfully." : "Existing address found.",
      created: created, 
      address: address, 
    });

  } catch (err) {
    console.error("Find/Create Address Error:", err);
    return res.status(500).json({
      message: "Server error during find or create address operation.",
      error: err.message,
    });
  }
};
