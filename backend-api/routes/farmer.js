import express from "express";
import authentication from "../middleware/auth.js";
import {
  addfarmer,
  getfarmer,
  deletefarmer,
  updatefarmer,
  getallfarmers,
} from "../controllers/farmerController.js"; // Import addfarmer function

const router = express.Router();

router.post("/addfarmer", authentication("field_facilitator"), addfarmer); // Add farmer (protected route, requires authentication)
router.get(
  "/getfarmer/:code",
  authentication("admin", "field_facilitator"),
  getfarmer
); // Get farmer by code
router.delete(
  "/deletefarmer/:code",
  authentication("field_facilitator"),
  deletefarmer
); // Delete farmer by code
router.put(
  "/updatefarmer/:code",
  authentication("field_facilitator"),
  updatefarmer
); // Update farmer by code
router.get(
  "/getallfarmers",
  authentication("admin", "field_facilitator"),
  getallfarmers
); // Get all farmers

export default router;
// Export the router to be used in the main server file
