import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
  
   handleTransactionController,getHistoryController 
} from "../controllers/spareInventory.js";

const router = express.Router();

 // Delete Inventory by ID
router.post("/inventory/transaction",authMiddleware, handleTransactionController); 
router.get("/inventory/:id/history", getHistoryController);
export default router;
