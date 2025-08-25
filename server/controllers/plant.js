import sequelize from "../sequelize.js"; // Make sure to import your sequelize instance
import Plant from "../models/Plant.js";
import Address from "../models/Address.js";
import User from "../models/User.js";

// -------------------- Create Plant --------------------
export const createPlantController = async (req, res) => {
  const { name, address, status } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: "Plant name and address are required." });
  }

  // Validate address fields
  const { city, state, pincode, country_code } = address;
  if (!city || !state || !pincode || !country_code) {
    return res.status(400).json({ message: "Incomplete address details." });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // 1. Find or create the address using Sequelize's built-in method
      const [savedAddress] = await Address.findOrCreate({
        where: address,
        defaults: address,
        transaction: t,
      });

      // 2. Create the plant
      const newPlant = await Plant.create({
        name,
        status: Boolean(status),
        address_id: savedAddress.id,
      }, { transaction: t });

      return newPlant;
    });

    return res.status(201).json({ message: "Plant created successfully", data: result });
  } catch (err) {
    console.error("Create Plant Error:", err);
    return res.status(500).json({ message: "Error creating plant", error: err.message });
  }
};

// -------------------- Link Plant to User --------------------
export const linkPlantToUserController = async (req, res) => {
  const { plantId } = req.body;
  const userId = req.user?.id;

  if (!plantId || !userId) {
    return res.status(400).json({ message: "User ID and Plant ID are required." });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const plant = await Plant.findByPk(plantId);
    if (!plant) {
        return res.status(404).json({ message: "Plant not found." });
    }

    // Use Sequelize mixin to associate the plant (assuming user.addPlant exists)
    await user.addPlant(plant);

    return res.status(200).json({ message: "Plant linked successfully." });
  } catch (err) {
    console.error("Link Plant Error:", err);
    return res.status(500).json({ message: "Server error while linking plant.", error: err.message });
  }
};

// -------------------- Get All Plants --------------------
export const getAllPlantsController = async (req, res) => {
  try {
    const plants = await Plant.findAll({
      include: [{
        model: Address,
        as: 'address'
      }]
    });
    
    return res.status(200).json({ data: plants });
  } catch (err) {
    console.error("Fetch Plants Error:", err); 
    return res.status(500).json({ message: "Error fetching plants", error: err.message });
  }
};


// -------------------- Get Plant by ID --------------------
export const getPlantByIdController = async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id, { include: [Address] });
    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }
    return res.status(200).json({ data: plant });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching plant", error: err.message });
  }
};

// -------------------- Update Plant --------------------
export const updatePlantController = async (req, res) => {
  const { id } = req.params;
  const { name, status, address } = req.body;

  try {
    const plant = await Plant.findByPk(id);
    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }
    
    if (name !== undefined) plant.name = name;
    if (status !== undefined) plant.status = Boolean(status);

    if (address) {
      const [savedAddress] = await Address.findOrCreate({
        where: address,
        defaults: address,
      });
      
      plant.address_id = savedAddress.id;
    }

    await plant.save();
    
    const updatedPlantData = await Plant.findByPk(id, {
      include: [{
        model: Address,
        as: 'address' 
      }]
    });
    
    return res.status(200).json({ message: "Plant updated successfully", data: updatedPlantData });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error updating plant", error: err.message });
  }
};

// -------------------- Delete Plant --------------------
export const deletePlantController = async (req, res) => {
  try {
    const deleted = await Plant.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Plant not found" });
    }
    return res.status(200).json({ message: "Plant deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting plant", error: err.message });
  }
};
