import express from "express"; // imports express framework for building web applications
import authentication from "../middleware/auth.js"; // imports authentication middleware for protecting routes
import {
  addCottonPickingData,
  getAllCottonPicking,
  getCottonPickingData,
  updateCottonPickingData,
  deleteCottonPickingData,
} from "../controllers/cottonPickingController.js"; // imports cotton picking controller functions

const router = express.Router(); // creates a new router instance
router.post(
  "/addcottonpickingdata",
  authentication("field_facilitator"),
  addCottonPickingData
); // route to add cotton picking data, protected by authentication
router.get(
  "/getcottonpickingdata/:farmer_id",
  authentication(["admin", "field_facilitator"]),
  getCottonPickingData
); // route to get cotton picking data by farmer_id, protected by authentication
router.get(
  "/getallcottonpicking",
  authentication(["admin", "field_facilitator"]),
  getAllCottonPicking
); // route to get all cotton picking data, protected by authentication
router.put(
  "/updatecottonpickingdata/:id",
  authentication("field_facilitator"),
  updateCottonPickingData
); // route to update cotton picking data by id, protected by authentication
router.delete(
  "/deletecottonpickingdata/:id",
  authentication("field_facilitator"),
  deleteCottonPickingData
); // route to delete cotton picking data by id, protected by authentication
export default router; // exports the router to be used in the main server file
