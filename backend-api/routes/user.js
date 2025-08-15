import express from "express";
import authentication from "../middleware/auth.js";
import {
  getAllUsers,
  login,
  signup,
  deleteUser,
  getUserByUserName,
  getAllFacilitators,
  getAllAdmins,
  getAdminAnalytics,
  getFacilitatorAnalytics,
} from "../controllers/userController.js";

const router = express.Router();

// router.post("/", createUser); // Create user
router.get("/get", authentication("admin"), getAllUsers); // Get all users
router.post("/login", login); // User login
router.post("/signup", authentication("admin"), signup); // User signup
router.delete("/delete/:user_name", authentication("admin"), deleteUser); // Delete user by username
router.get("/getuser/:user_name", authentication("admin"), getUserByUserName); // Get user by username
router.get("/facilitators", authentication("admin"), getAllFacilitators); // Get all facilitators
router.get("/admins", authentication("admin"), getAllAdmins); // Get all admins
router.get(
  "/analytics/facilitator",
  authentication("field_facilitator"),
  getFacilitatorAnalytics
);
router.get("/analytics/admin", authentication("admin"), getAdminAnalytics); // Get admin analytics
export default router; // Export the router to be used in the main server file
