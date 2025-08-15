import express from "express";
import authentication from "../middleware/auth.js"; // imports authentication middleware for protecting routes
import {
  addWaterData,
  getAllWaterData,
  updateWaterData,
  deleteWaterData,
  getWaterData,
} from "../controllers/waterController.js"; // imports water controller functions

const router = express.Router(); // creates a new router instance

router.post("/addwaterdata", authentication("field_facilitator"), addWaterData); // route to add water usage data, protected by authentication
router.get(
  "/getwaterdata/:farmer_id",
  authentication("admin", "field_facilitator"),
  getWaterData
);
router.get(
  "/getallwaterdata",
  authentication("admin", "field_facilitator"),
  getAllWaterData
); // route to get all water usage data, protected by authentication
router.put(
  "/updatewaterdata/:id",
  authentication("field_facilitator"),
  updateWaterData
); // route to update water usage data by ID, protected by authentication
router.delete(
  "/deletewaterdata/:id",
  authentication("field_facilitator"),
  deleteWaterData
); // route to delete water usage data by ID, protected by authentication

export default router;
