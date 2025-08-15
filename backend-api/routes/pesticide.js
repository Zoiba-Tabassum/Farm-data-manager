import express from "express"; // imports express framework for building web applications
import authentication from "../middleware/auth.js"; // imports authentication middleware for protecting routes
import {
  addPesticideUsage,
  getPesticideUsage,
  getAllPesticideUsage,
  updatePesticideUsage,
  deletePesticideUsage,
} from "../controllers/pesticideController.js"; // imports pesticide controller functions

const router = express.Router(); // creates a new router instance
router.post(
  "/addpesticideusage",
  authentication("field_facilitator"),
  addPesticideUsage
); // route to add pesticide usage data, protected by authentication
router.get(
  "/getpesticideusage/:id",
  authentication("admin", "field_facilitator"),
  getPesticideUsage
); // route to get pesticide usage data by ID, protected by authentication
router.get(
  "/getallpesticideusage",
  authentication("admin", "field_facilitator"),
  getAllPesticideUsage
); // route to get all pesticide usage data, protected by authentication
router.put(
  "/updatepesticideusage/:id",
  authentication("field_facilitator"),
  updatePesticideUsage
); // route to update pesticide usage data by ID, protected by authentication
router.delete(
  "/deletepesticideusage/:id",
  authentication("field_facilitator"),
  deletePesticideUsage
); // route to delete pesticide usage data by ID, protected by authentication
export default router; // exports the router to be used in the main server file
