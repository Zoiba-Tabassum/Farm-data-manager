import db from "../db/connection.js"; // Use ES module import
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation
import configDotenv from "dotenv";

configDotenv.config();

//--------------------
//SIGNUP FUNCTION
//--------------------

const signup = async (req, res) => {
  const { name, phone, password, user_name, role, village, tehsil } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt rounds of 10
    const query =
      "INSERT INTO users (name, phone, password, user_name, role, village, tehsil) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      name,
      phone,
      hashedPassword,
      user_name,
      role,
      village,
      tehsil,
    ];

    await db.promise().query(query, values);
    res.status(201).json({ message: "User Registered Successfully." });
  } catch (err) {
    console.log("Error during signup:", err);
    res.status(500).json({ error: "Internal server Error" });
  }
};

//--------------------
//LOGIN FUNCTION
//--------------------

const login = async (req, res) => {
  // Implement login logic here
  const { user_name, password } = req.body;
  const query = "SELECT * FROM users WHERE user_name = ?"; // SQL query to find user by username
  try {
    const [user] = await db.promise().query(query, [user_name]); // Execute the query
    if (!user || user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user[0].password); // Compare provided password with hashed password
    if (!isMatch) {
      res.status(401).json({ error: "Invalid password" }); // If password doesn't match, return 401
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET, // Use secret from environment variables
      { expiresIn: process.env.JWT_EXPIRATION } // Token expiration time
    );

    //Send response with user data and token
    res.status(200).json({
      message: "LOGIN SUCCESSFUL",
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        role: user[0].role,
        village: user[0].village,
      },
    });
  } catch (err) {
    console.log("Error during login:", err);
    res.status(500).json({ error: "Internal server error" }); // Return a 500 status for server errors
  }
};

//--------------------
//GET ALL USERS FUNCTION
//--------------------

const getUsers = async (req, res) => {
  const query = "SELECT * FROM users"; // SQL query to select all users

  try {
    const [result] = await db.promise().query(query); // Execute the query
    if (result.length === 0) {
      return res.status(404).json({ message: "No users available" }); // If no users found, return 404
    }
    res.status(200).json({
      success: true,
      data: result,
    }); // Return the list of users with a 200 status
  } catch (err) {
    console.error("Error fetching users:", err); // Log any errors
    res.status(500).json({ message: "Internal server error" }); // Return a 500 status for server errors
  }
};

//---------------------
//ADD FARMER FUNCTION
//---------------------

export { getUsers, login, signup };
