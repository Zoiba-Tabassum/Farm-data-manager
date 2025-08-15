import express from "express";
import authentication from "../middleware/auth.js"; // imports authentication middleware for protecting routes
import {
  addFertilizerData,
  getAllFertilizerData,
  getFertilizerData,
  updateFertilizerData,
  deleteFertilizerData,
} from "../controllers/fertilizerController.js"; // imports fertilizer controller functions

const router = express.Router();

router.post(
  "/addfertilizerusage",
  authentication("field_facilitator"),
  addFertilizerData
);
router.get(
  "/getfertilizerdata/:farmer_id",
  authentication("admin", "field_facilitator"),
  getFertilizerData
); // route to get fertilizer data by farmer_id, protected by
router.get(
  "/getallfertilizerdata",
  authentication("admin", "field_facilitator"),
  getAllFertilizerData
); // route to get all fertilizer data, protected by authentication
router.put(
  "/updatefertilizerdata/:id",
  authentication("field_facilitator"),
  updateFertilizerData
); // route to update fertilizer data by ID, protected by authentication
router.delete(
  "/deletefertilizerdata/:id",
  authentication("field_facilitator"),
  deleteFertilizerData
); // route to delete fertilizer data by ID, protected by authentication
export default router; // exports the router to be used in the main server file
