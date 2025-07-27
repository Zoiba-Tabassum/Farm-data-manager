import express from "express";
import { getUsers, login, signup } from "../controllers/userController.js";

const router = express.Router();

// router.post("/", createUser); // Create user
router.get("/", getUsers); // Get all users
router.post("/login", login); // User login
router.post("/signup", signup); // User signup

export default router;
// // Export the router to be used in the main server file
// // This file defines the user-related routes for the application
