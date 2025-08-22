import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionMiddleware.js";

import {createPlantController,linkPlantToUserController,getAllPlantsController,getPlantByIdController,updatePlantController,deletePlantController,} from "../controllers/plant.js";

const router = express.Router();

router.post("/plant" , createPlantController); // Create a new plant
router.get("/getallplants", getAllPlantsController); // Get all plants with details
router.get("/plant/:id", getPlantByIdController); // Get plant details by ID
router.put("/plant/:id", updatePlantController); // Update plant details by ID
router.delete("/plant/:id", deletePlantController); // Delete plant by ID
router.put("/user/link-plant", authMiddleware,  checkPermission(" Link Plant "), linkPlantToUserController); // Link a plant to a user (requires auth)

export default router;
