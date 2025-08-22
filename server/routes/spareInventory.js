import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionMiddleware.js";
import {handleTransactionController,getHistoryController } from "../controllers/spareInventory.js";

const router = express.Router();

router.post("/inventory/transaction",authMiddleware, handleTransactionController); 
router.get("/inventory/:id/history", authMiddleware,checkPermission("Transaction History "), getHistoryController);
export default router;
