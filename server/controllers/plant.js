import * as Plant from '../models/Plant.js';
import { findOrCreateAddress } from '../models/Address.js';


 // Controller: Create a new plant
 
export const createPlantController = async (req, res) => {
  const { name, address, status } = req.body;

  // Basic validation for mandatory fields
  if (!name || !address) {
    return res.status(400).json({ message: "Plant name and address are required" });
  }

  try {
    // Validate required address fields
    if (!address.city || !address.state || !address.pincode || !address.country_code) {
      return res.status(400).json({
        message: "Incomplete address details."
      });
    }

    // Save or retrieve the address from DB
    const savedAddress = await findOrCreateAddress(address);
    if (!savedAddress?.id) {
      throw new Error("Address insert failed — no ID returned");
    }

    // Create plant record
    const newPlant = await Plant.createPlant({
      name,
      status: Boolean(status),
      address_id: savedAddress.id
    });

    res.status(201).json({ message: "Plant created successfully", data: newPlant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating plant", error: err.message });
  }
};

/**
 * Controller: Link a plant to a user
 * Checks if plant exists, then assigns it to the logged-in user.
 */
export const linkPlantToUserController = async (req, res) => {
  const { plantId } = req.body;
  const userId = req.user.id; // Extracted from JWT middleware

  // Validate input
  if (!plantId) {
    return res.status(400).json({ message: "Plant ID is required." });
  }

  try {
    // Ensure plant exists
    const plantExists = await Plant.getPlantById(plantId);
    if (!plantExists) {
      return res.status(404).json({ message: "Plant not found." });
    }

    // Link plant to user
    const updatedUser = await Plant.linkPlantToUser(userId, plantId);
    if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
    }
    
    res.status(200).json({ message: "Plant linked to user successfully.", user: updatedUser });
  } catch (err) {
    console.error("Link Plant Error:", err);
    res.status(500).json({ message: "Server error while assigning plant." });
  }
};

/**
 * Controller: Get all plants
 * Retrieves a list of all plants from the database.
 */
export const getAllPlantsController = async (req, res) => {
  try {
    const plants = await Plant.getAllPlants();
    res.status(200).json({ data: plants });
  } catch (err) {
    res.status(500).json({ message: "Error fetching plants", error: err.message });
  }
};

//  Controller: Get a single plant by ID 
export const getPlantByIdController = async (req, res) => {
  try {
    const plant = await Plant.getPlantById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }
    res.status(200).json({ data: plant });
  } catch (err) {
    res.status(500).json({ message: "Error fetching plant", error: err.message });
  }
};

// Controller: Update plant details
 
export const updatePlantController = async (req, res) => {
  const { id } = req.params;
  const { name, status, address } = req.body;

  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;

    // If address provided, save or find it
    if (address) {
      const savedAddress = await findOrCreateAddress(address);
      updateData.address_id = savedAddress.id;
    }
    
    // Ensure there is something to update
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update data provided." });
    }

    // Update plant record
    const updatedPlant = await Plant.updatePlant(id, updateData);
    if (!updatedPlant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    // Fetch and return updated record
    const finalPlantData = await Plant.getPlantById(id);
    res.status(200).json({ message: "Plant updated successfully", data: finalPlantData });
  } catch (err) {
    res.status(500).json({ message: "Error updating plant", error: err.message });
  }
};

// Controller: Delete a plant by ID

export const deletePlantController = async (req, res) => {
  try {
    const deletedPlant = await Plant.deletePlant(req.params.id);
    if (!deletedPlant) {
      return res.status(404).json({ message: "Plant not found" });
    }
    res.status(200).json({ message: "Plant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting plant", error: err.message });
  }
};
