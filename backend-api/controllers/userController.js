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
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "User already exists" }); // If user already exists, return 400
    }
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
      return res.status(401).json({ error: "Invalid password" }); // If password doesn't match, return 401
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user[0].id,
        role: user[0].role,
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
//RESET PASSWORD
//--------------------

//--------------------
//GET ALL USERS FUNCTION
//--------------------

const getAllUsers = async (req, res) => {
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

//--------------------
//GET USER BY user_name
//--------------------
const getUserByUserName = async (req, res) => {
  const { user_name } = req.params;
  const query = "Select *from users where user_name=?";

  try {
    const [result] = await db.promise().query(query, [user_name]);
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: result[0], // Return the first user found
    });
  } catch (err) {
    console.log("Error fetching all userss");
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all facilitators
const getAllFacilitators = async (req, res) => {
  const query = "SELECT * FROM users WHERE role = 'field_facilitator'"; // SQL query to select all facilitators
  try {
    const [result] = await db.promise().query(query); // Execute the query
    if (result.length === 0) {
      return res.status(404).json({ message: "No facilitators available" }); // If no facilitators found, return 404
    }
    res.status(200).json({
      success: true,
      data: result,
    }); // Return the list of facilitators with a 200 status
  } catch (err) {
    console.error("Error fetching facilitators:", err); // Log any errors
    res.status(500).json({ message: "Internal server error" }); // Return a 500 status for server errors
  }
};

//get all admins
const getAllAdmins = async (req, res) => {
  const query = "SELECT * FROM users WHERE role = 'admin'"; // SQL query to select all admins
  try {
    const [result] = await db.promise().query(query); // Execute the query
    if (result.length === 0) {
      return res.status(404).json({ message: "No admins available" }); // If no admins found, return 404
    }
    res.status(200).json({
      success: true,
      data: result,
    }); // Return the list of admins with a 200 status
  } catch (err) {
    console.error("Error fetching admins:", err); // Log any errors
    res.status(500).json({ message: "Internal server error" }); // Return a 500 status for server errors
  }
};

//----------------------
//DELETE USER
//---------------------
const deleteUser = async (req, res) => {
  const { user_name } = req.params; // Get the user_name from request parameters
  const query = "DELETE FROM users WHERE user_name = ?"; // SQL query to delete user by user_name

  try {
    const [result] = await db.promise().query(query, [user_name]); // Execute the query
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" }); // If no rows affected, return 404
    }
    res.status(200).json({ message: "User deleted successfully" }); // Return success message with 200 status
  } catch (err) {
    console.error("Error deleting user:", err); // Log any errors
    res.status(500).json({ message: "Internal server error" }); // Return a 500 status for server errors
  }
};

// ADMIN ANALYTICS
const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Number of farmers per facilitator
    const [farmersPerFacilitator] = await db.promise().query(`
        SELECT u.name AS facilitator_name, COUNT(f.id) AS farmer_count
        FROM users u
        LEFT JOIN farmers f ON u.id = f.facilitator_id
        WHERE u.role = 'field_facilitator'
        GROUP BY u.id
      `);

    // 2. Total area managed per facilitator
    const [areaPerFacilitator] = await db.promise().query(`
        SELECT u.name AS facilitator_name, SUM(fd.area_acres) AS total_area
        FROM users u
        JOIN farmers f ON u.id = f.facilitator_id
        JOIN farm_data fd ON f.id = fd.farmer_id
        WHERE u.role = 'field_facilitator'
        GROUP BY u.id
      `);

    // 3. Cotton picking revenue vs cost for all farmers
    const [cottonPicking] = await db.promise().query(`
        SELECT f.name AS farmer_name, cp.total_earning, cp.total_cost
        FROM cotton_picking cp
        JOIN farmers f ON cp.farmer_id = f.id
      `);
    if (
      farmersPerFacilitator.length === 0 &&
      areaPerFacilitator.length === 0 &&
      cottonPicking.length === 0
    ) {
      return res.status(404).json({ message: "No analytics data available" });
    }
    res.status(200).json({
      data: {
        totalFacilitators: farmersPerFacilitator.length,
        totalFarmers: farmersPerFacilitator.reduce(
          (sum, f) => sum + f.farmer_count,
          0
        ),
        totalCottonRevenue: parseFloat(
          cottonPicking.reduce((sum, c) => sum + (c.total_earning || 0), 0)
        ).toFixed(2),
        totalManagedArea: areaPerFacilitator
          .reduce((sum, a) => sum + Number(a.total_area || 0), 0)
          .toFixed(2),
        farmersPerFacilitator: farmersPerFacilitator.map((f) => ({
          facilitator: f.facilitator_name,
          count: f.farmer_count,
        })),
        areaPerFacilitator: areaPerFacilitator.map((a) => ({
          facilitator: a.facilitator_name,
          total_area: a.total_area,
        })),
        cottonRevenueVsCost: cottonPicking.map((c) => ({
          farmer: c.farmer_name,
          total_earning: c.total_earning,
          total_cost: c.total_cost,
        })),
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// FACILITATOR ANALYTICS
const getFacilitatorAnalytics = async (req, res) => {
  const facilitatorId = req.user.id;
  try {
    // 1. Farm area per farmer
    const [areaPerFarmer] = await db.promise().query(
      `
        SELECT f.name AS farmer_name, fd.area_acres
        FROM farmers f
        JOIN farm_data fd ON f.id = fd.farmer_id
        WHERE f.facilitator_id = ?
      `,
      [facilitatorId]
    );

    // 2. Livestock distribution (kept for charts, even if not used in cards now)
    const [livestockDist] = await db.promise().query(
      `
        SELECT l.animal_type, SUM(l.quantity) AS total
        FROM livestock l
        JOIN farmers f ON l.farmer_id = f.id
        WHERE f.facilitator_id = ?
        GROUP BY l.animal_type
      `,
      [facilitatorId]
    );

    // 3. Irrigation activities (date vs quantity)
    const [irrigationData] = await db.promise().query(
      `
        SELECT wd.irrigation_date, SUM(wd.quantity_per_acre) AS total_quantity
        FROM water_data wd
        JOIN farmers f ON wd.farmer_id = f.id
        WHERE f.facilitator_id = ?
        GROUP BY wd.irrigation_date
        ORDER BY wd.irrigation_date
      `,
      [facilitatorId]
    );

    // === Aggregate Totals for Cards ===
    const totalFarmers = new Set(areaPerFarmer.map((a) => a.farmer_name)).size;
    const totalManagedArea = Number(
      areaPerFarmer
        .reduce((sum, a) => sum + Number(a.area_acres || 0), 0)
        .toFixed(2)
    );

    // Current month irrigation only
    const currentMonth = new Date().getMonth() + 1; // JS month (1–12)
    const totalIrrigationQuantity = Number(
      irrigationData
        .filter(
          (i) => new Date(i.irrigation_date).getMonth() + 1 === currentMonth
        )
        .reduce((sum, i) => sum + Number(i.total_quantity || 0), 0)
        .toFixed(2)
    );

    const irrigationEventCount = irrigationData.filter(
      (i) => new Date(i.irrigation_date).getMonth() + 1 === currentMonth
    ).length;

    // === Response ===
    res.status(200).json({
      data: {
        // For cards
        totalFarmers,
        totalManagedArea,
        totalIrrigationQuantity,
        irrigationEventCount,

        // For charts
        areaPerFarmer: areaPerFarmer.map((a) => ({
          farmer: a.farmer_name,
          area: a.area_acres,
        })),
        livestockDistribution: livestockDist.map((l) => ({
          animal_type: l.animal_type,
          total_quantity: l.total,
        })),
        irrigationActivities: irrigationData.map((i) => ({
          month: i.irrigation_date,
          total_quantity: i.total_quantity,
        })),
      },
    });
  } catch (error) {
    console.error("Facilitator analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  getAllUsers,
  login,
  signup,
  deleteUser,
  getUserByUserName,
  getAllFacilitators,
  getAllAdmins,
  getAdminAnalytics,
  getFacilitatorAnalytics,
}; // Export the functions for use in routes
