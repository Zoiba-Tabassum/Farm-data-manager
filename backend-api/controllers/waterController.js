import db from "../db/connection.js"; // Use ES module import

// Add new water data entry (facilitator restricted)
const addWaterData = async (req, res) => {
  const {
    farmer_id,
    source,
    irrigation_date,
    quantity_per_acre,
    time,
    cost_per_acre,
  } = req.body;

  const facilitatorId = req.user.id;

  try {
    // Verify that the farmer belongs to this facilitator
    const [farmerCheck] = await db
      .promise()
      .query(`SELECT id FROM farmers WHERE id = ? AND facilitator_id = ?`, [
        farmer_id,
        facilitatorId,
      ]);

    if (farmerCheck.length === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to add data for this farmer" });
    }

    const query = `
      INSERT INTO water_data (farmer_id, source, irrigation_date, quantity_per_acre, time, cost_per_acre)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db
      .promise()
      .query(query, [
        farmer_id,
        source,
        irrigation_date,
        quantity_per_acre,
        time,
        cost_per_acre,
      ]);

    res.status(201).json({ message: "Water data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add water data" });
  }
};

// Get water data for a specific farmer
const getWaterData = async (req, res) => {
  const { farmer_id } = req.params;
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin can view any farmer's water data
      query = `
        SELECT wd.*, f.name AS farmer_name, f.facilitator_id
        FROM water_data wd
        JOIN farmers f ON wd.farmer_id = f.id
        WHERE wd.farmer_id = ?
      `;
      params = [farmer_id];
    } else {
      // Facilitator can only see their own farmers
      query = `
        SELECT wd.*, f.name AS farmer_name
        FROM water_data wd
        JOIN farmers f ON wd.farmer_id = f.id
        WHERE wd.farmer_id = ? AND f.facilitator_id = ?
      `;
      params = [farmer_id, user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No water data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve water data" });
  }
};

// Get all water data
const getAllWaterData = async (req, res) => {
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin sees all water data across all facilitators
      query = `
        SELECT wd.*, f.name AS farmer_name, f.facilitator_id
        FROM water_data wd
        JOIN farmers f ON wd.farmer_id = f.id
      `;
      params = [];
    } else {
      // Facilitator only their farmers' water data
      query = `
        SELECT wd.*, f.name AS farmer_name
        FROM water_data wd
        JOIN farmers f ON wd.farmer_id = f.id
        WHERE f.facilitator_id = ?
      `;
      params = [user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No water data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve water data" });
  }
};

// Update water data by ID (facilitator restricted)
const updateWaterData = async (req, res) => {
  const { id } = req.params;
  const { source, irrigation_date, quantity_per_acre, time, cost_per_acre } =
    req.body;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `UPDATE water_data wd
       JOIN farmers f ON wd.farmer_id = f.id
       SET wd.source = ?, wd.irrigation_date = ?, wd.quantity_per_acre = ?, wd.time = ?, wd.cost_per_acre = ?
       WHERE wd.id = ? AND f.facilitator_id = ?`,
      [
        source,
        irrigation_date,
        quantity_per_acre,
        time,
        cost_per_acre,
        id,
        facilitatorId,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Water data not found or not authorized" });
    }

    res.status(200).json({ message: "Water data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update water data" });
  }
};

// Delete water data by ID (facilitator restricted)
const deleteWaterData = async (req, res) => {
  const { id } = req.params;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `DELETE wd FROM water_data wd
       JOIN farmers f ON wd.farmer_id = f.id
       WHERE wd.id = ? AND f.facilitator_id = ?`,
      [id, facilitatorId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Water data not found or not authorized" });
    }

    res.status(200).json({ message: "Water data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete water data" });
  }
};

export {
  addWaterData,
  getWaterData,
  getAllWaterData,
  deleteWaterData,
  updateWaterData,
};
