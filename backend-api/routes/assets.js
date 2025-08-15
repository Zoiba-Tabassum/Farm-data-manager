import express from "express"; // imports express framework for building web applications
import authentication from "../middleware/auth.js";
import {
  addAssets,
  getAssets,
  deleteAssets,
  updateAssets,
  getAllAssets,
} from "../controllers/assetsController.js"; // Import asset controller functions

const router = express.Router(); // Create a new router instance

// Route to add a new asset
router.post("/add", authentication("field_facilitator"), addAssets); // Protected route, requires authentication
router.get(
  "/get/:farmer_id",
  authentication("admin", "field_facilitator"),
  getAssets
);
router.delete(
  "/delete/:asset_id",
  authentication("field_facilitator"),
  deleteAssets
);
router.put(
  "/update/:farmer_id",
  authentication("field_facilitator"),
  updateAssets
);
router.get(
  "/getall",
  authentication("admin", "field_facilitator"),
  getAllAssets
);
export default router;
