import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionMiddleware.js";
import {
  createPlantController,
  linkPlantToUserController,
  getAllPlantsController,
  getPlantByIdController,
  updatePlantController,
  deletePlantController,
} from "../controllers/plant.js"; // Standardized file naming

const router = express.Router();

// --- Define routes individually ---

// POST /api/plants - Create a new plant
router.post("/",  createPlantController);

// GET /api/plants - Get all plants
router.get("/", getAllPlantsController);

// GET /api/plants/:id - Get a single plant by its ID
router.get("/:id", getPlantByIdController);

// PUT /api/plants/:id - Update a plant by its ID
router.put("/update/:id", authMiddleware,  updatePlantController);

// DELETE /api/plants/:id - Delete a plant by its ID
router.delete("/:id", authMiddleware,  deletePlantController);


router.put("/link-user", authMiddleware, linkPlantToUserController);


export default router;
