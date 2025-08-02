import express from "express"; // imports express framework for building web applications
import authentication from "../middleware/auth.js"; // imports authentication middleware for protecting routes
import {
  addSeedData,
  getSeedData,
  deleteSeedData,
  updateSeedData,
  getAllSeedData,
} from "../controllers/seedController.js"; // imports seed controller functions
const router = express.Router(); // creates a new router instance
router.post("/addseeddata", authentication("field_facilitator"), addSeedData); // route to add seed data, protected by authentication
router.get(
  "/getseeddata/:farmer_id",
  authentication(["admin", "field_facilitator"]),
  getSeedData
); // route to get seed data by farmer_id, protected by authentication
router.delete(
  "/deleteseeddata/:id",
  authentication("field_facilitator"),
  deleteSeedData
); // route to delete seed data by id, protected by authentication
router.put(
  "/updateseeddata/:id",
  authentication("field_facilitator"),
  updateSeedData
); // route to update seed data by id, protected by authentication
router.get(
  "/getallseeddata",
  authentication(["admin", "field_facilitator"]),
  getAllSeedData
); // route to get all seed data, protected by authentication

export default router; // exports the router to be used in the main server file
