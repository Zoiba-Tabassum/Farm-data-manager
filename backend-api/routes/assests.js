import express from "express"; // imports express framework for building web applications
import authentication from "../middleware/auth";
import {
  addAsset,
  getAsset,
  deleteAsset,
  updateAsset,
  getAllAssets,
} from "../controllers/assetsController.js"; // Import asset controller functions

const router = express.Router(); // Create a new router instance

// Route to add a new asset
router.post("/add", authentication("field_facilitator"), addAsset); // Protected route, requires authentication
router.get(
  "/get/:farmer_id",
  authentication(["admin", "field_facilitator"]),
  getAsset
);
router.delete(
  "/delete/:asset_id",
  authentication("field_facilitator"),
  deleteAsset
);
router.put(
  "/update/:farmer_id",
  authentication("field_facilitator"),
  updateAsset
);
router.get(
  "/getall",
  authentication(["admin", "field_facilitator"]),
  getAllAssets
);
export default router;
