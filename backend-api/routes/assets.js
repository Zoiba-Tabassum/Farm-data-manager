import express from "express";
import authentication from "../middleware/auth.js";
import {
  addAssets,
  getAssets,
  deleteAssets,
  updateAssets,
  getAllAssets,
} from "../controllers/assetsController.js";

const router = express.Router();

// Facilitator only
router.post("/add", authentication("field_facilitator"), addAssets);
router.put(
  "/update/:farmer_id",
  authentication("field_facilitator"),
  updateAssets
);
router.delete(
  "/delete/:farmer_id",
  authentication("field_facilitator"),
  deleteAssets
);

// Admin + Facilitator
router.get(
  "/get/:farmer_id",
  authentication("admin", "field_facilitator"),
  getAssets
);
router.get(
  "/getall",
  authentication("admin", "field_facilitator"),
  getAllAssets
);

export default router;
