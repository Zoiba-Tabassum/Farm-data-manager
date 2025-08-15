import express from "express"; // imports express framework for building web applications
import authentication from "../middleware/auth.js"; // imports authentication middleware for securing routes
import {
  addLandPreparation,
  getAllLandPreparation,
  getLandPreparation,
  updateLandPreparation,
  deleteLandPreparation,
} from "../controllers/preprationController.js"; // imports preparation controller functions

const router = express.Router(); // creates a new router instance
router.post(
  "/addpreparation",
  authentication("field_facilitator"),
  addLandPreparation
); // route to add a new land preparation record, protected by authentication
router.get(
  "/getpreparation/:farmer_id",
  authentication("admin", "field_facilitator"),
  getLandPreparation
); // route to get land preparation records by farmer_id, protected by authentication
router.delete(
  "/deletepreparation/:id",
  authentication("field_facilitator"),
  deleteLandPreparation
); // route to delete a land preparation record by id, protected by authentication
router.put(
  "/updatepreparation/:id",
  authentication("field_facilitator"),
  updateLandPreparation
); // route to update a land preparation record by id, protected by authentication
router.get(
  "/getallpreparations",
  authentication("admin", "field_facilitator"),
  getAllLandPreparation
); // route to get all land preparation records, protected by authentication
export default router; // exports the router to be used in the main server file
