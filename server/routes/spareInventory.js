import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionMiddleware.js";
import {
  handleTransactionController,
  getHistoryController,
} from "../controllers/spareInventory.js";

const router = express.Router();

// Route for handling inventory transactions
router.post("/transaction", authMiddleware, handleTransactionController);

// Route for getting the history of a specific inventory item
router.get("/:id/history", authMiddleware, getHistoryController);

export default router;
