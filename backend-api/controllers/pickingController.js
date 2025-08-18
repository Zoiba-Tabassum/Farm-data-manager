import db from "../db/connection.js";

// Add cotton picking record
const addCottonPicking = async (req, res) => {
  const {
    farmer_id,
    average,
    total,
    rate,
    total_earning,
    total_cost,
    buyer_name,
  } = req.body;
  const facilitatorId = req.user.id; // facilitator's user ID from auth

  try {
    // Verify farmer belongs to facilitator
    const [farmerCheck] = await db
      .promise()
      .query(`SELECT id FROM farmers WHERE id = ? AND facilitator_id = ?`, [
        farmer_id,
        facilitatorId,
      ]);

    if (farmerCheck.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not allowed to add data for this farmer" });
    }

    await db.promise().query(
      `INSERT INTO cotton_picking 
       (farmer_id, average, total, rate, total_earning, total_cost, buyer_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [farmer_id, average, total, rate, total_earning, total_cost, buyer_name]
    );

    res
      .status(201)
      .json({ message: "Cotton picking record added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add cotton picking record" });
  }
};

// Get cotton picking records for a specific farmer
// Get cotton picking records for a specific farmer
const getCottonPicking = async (req, res) => {
  const { farmer_id } = req.params;
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin can see any farmer's cotton picking records
      query = `
        SELECT cp.*, f.name as farmer_name, f.facilitator_id
        FROM cotton_picking cp
        JOIN farmers f ON cp.farmer_id = f.id
        WHERE cp.farmer_id = ?
      `;
      params = [farmer_id];
    } else {
      // Facilitator restricted to own farmers
      query = `
        SELECT cp.*, f.name as farmer_name
        FROM cotton_picking cp
        JOIN farmers f ON cp.farmer_id = f.id
        WHERE cp.farmer_id = ? AND f.facilitator_id = ?
      `;
      params = [farmer_id, user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No cotton picking records found for this farmer" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve cotton picking records" });
  }
};

// Get all cotton picking records
const getAllCottonPicking = async (req, res) => {
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin gets all farmers' data
      query = `
        SELECT cp.*, f.name as farmer_name, f.facilitator_id
        FROM cotton_picking cp
        JOIN farmers f ON cp.farmer_id = f.id
      `;
      params = [];
    } else {
      // Facilitator gets only their farmers
      query = `
        SELECT cp.*, f.name as farmer_name
        FROM cotton_picking cp
        JOIN farmers f ON cp.farmer_id = f.id
        WHERE f.facilitator_id = ?
      `;
      params = [user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No cotton picking records found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve cotton picking records" });
  }
};

// Update cotton picking record by ID
const updateCottonPicking = async (req, res) => {
  const { id } = req.params;
  const { average, total, rate, total_earning, total_cost, buyer_name } =
    req.body;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `UPDATE cotton_picking cp
       JOIN farmers f ON cp.farmer_id = f.id
       SET cp.average = ?, cp.total = ?, cp.rate = ?, cp.total_earning = ?, cp.total_cost = ?, cp.buyer_name = ?
       WHERE cp.id = ? AND f.facilitator_id = ?`,
      [
        average,
        total,
        rate,
        total_earning,
        total_cost,
        buyer_name,
        id,
        facilitatorId,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Cotton picking record not found or not yours" });
    }

    res
      .status(200)
      .json({ message: "Cotton picking record updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update cotton picking record" });
  }
};

// Delete cotton picking record by ID
const deleteCottonPicking = async (req, res) => {
  const { id } = req.params;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `DELETE cp FROM cotton_picking cp
       JOIN farmers f ON cp.farmer_id = f.id
       WHERE cp.id = ? AND f.facilitator_id = ?`,
      [id, facilitatorId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Cotton picking record not found or not yours" });
    }

    res
      .status(200)
      .json({ message: "Cotton picking record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete cotton picking record" });
  }
};

export {
  addCottonPicking,
  getAllCottonPicking,
  getCottonPicking,
  updateCottonPicking,
  deleteCottonPicking,
};
