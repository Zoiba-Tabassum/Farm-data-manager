import db from "../db/connection.js";

// Helper: check if farmer belongs to facilitator
const verifyFarmerOwnership = async (farmer_id, facilitator_id) => {
  const [rows] = await db
    .promise()
    .query("SELECT id FROM farmers WHERE id = ? AND facilitator_id = ?", [
      farmer_id,
      facilitator_id,
    ]);
  return rows.length > 0;
};

// Add new fertilizer data
const addFertilizerData = async (req, res) => {
  const { farmer_id, type, name, quantity, cost_per_acre } = req.body;
  const facilitator_id = req.user.id;

  try {
    const ownsFarmer = await verifyFarmerOwnership(farmer_id, facilitator_id);
    if (!ownsFarmer) {
      return res.status(403).json({ error: "Unauthorized: Farmer not yours" });
    }

    await db.promise().query(
      `INSERT INTO fertilizer_data (farmer_id, type, name, quantity, cost_per_acre)
         VALUES (?, ?, ?, ?, ?)`,
      [farmer_id, type, name, quantity, cost_per_acre]
    );

    res.status(201).json({ message: "Fertilizer data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add fertilizer data" });
  }
};
// Get fertilizer data for a specific farmer
const getFertilizerData = async (req, res) => {
  const { farmer_id } = req.params;
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin can view any farmer's fertilizer data
      query = "SELECT * FROM fertilizer_data WHERE farmer_id = ?";
      params = [farmer_id];
    } else {
      // Facilitator restricted to own farmers
      query = `
        SELECT fd.*
        FROM fertilizer_data fd
        JOIN farmers f ON fd.farmer_id = f.id
        WHERE fd.farmer_id = ? AND f.facilitator_id = ?
      `;
      params = [farmer_id, user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No fertilizer data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve fertilizer data" });
  }
};

// Get all fertilizer data
const getAllFertilizerData = async (req, res) => {
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      query = `
        SELECT fd.*, f.name as farmer_name, f.facilitator_id
        FROM fertilizer_data fd
        JOIN farmers f ON fd.farmer_id = f.id
      `;
      params = [];
    } else {
      query = `
        SELECT fd.*, f.name as farmer_name
        FROM fertilizer_data fd
        JOIN farmers f ON fd.farmer_id = f.id
        WHERE f.facilitator_id = ?
      `;
      params = [user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No fertilizer data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve fertilizer data" });
  }
};

// Update fertilizer data (only if belongs to facilitator)
const updateFertilizerData = async (req, res) => {
  const { id } = req.params;
  const { type, name, quantity, cost_per_acre } = req.body;
  const facilitator_id = req.user.id;

  try {
    // Ensure record belongs to facilitator
    const [check] = await db.promise().query(
      `SELECT fd.id, fd.farmer_id
       FROM fertilizer_data fd
       JOIN farmers f ON fd.farmer_id = f.id
       WHERE fd.id = ? AND f.facilitator_id = ?`,
      [id, facilitator_id]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    const [result] = await db.promise().query(
      `UPDATE fertilizer_data
       SET type = ?, name = ?, quantity = ?, cost_per_acre = ?
       WHERE id = ?`,
      [type, name, quantity, cost_per_acre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Fertilizer data not found" });
    }

    res.status(200).json({ message: "Fertilizer data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update fertilizer data" });
  }
};

// Delete fertilizer data (only if belongs to facilitator)
const deleteFertilizerData = async (req, res) => {
  const { id } = req.params;
  const facilitator_id = req.user.id;

  try {
    const [check] = await db.promise().query(
      `SELECT fd.id
       FROM fertilizer_data fd
       JOIN farmers f ON fd.farmer_id = f.id
       WHERE fd.id = ? AND f.facilitator_id = ?`,
      [id, facilitator_id]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    const [result] = await db
      .promise()
      .query("DELETE FROM fertilizer_data WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Fertilizer data not found" });
    }

    res.status(200).json({ message: "Fertilizer data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete fertilizer data" });
  }
};

export {
  addFertilizerData,
  getAllFertilizerData,
  getFertilizerData,
  updateFertilizerData,
  deleteFertilizerData,
};
