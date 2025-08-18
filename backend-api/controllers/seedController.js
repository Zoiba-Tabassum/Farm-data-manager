import db from "../db/connection.js"; // Use ES module import

// Add seed data (facilitator restricted)
const addSeedData = async (req, res) => {
  const { farmer_id, variety_name, acres, seed_per_acre, price_per_kg } =
    req.body;
  const facilitatorId = req.user.id;

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
        .json({ error: "Not authorized to add data for this farmer" });
    }

    const query = `
      INSERT INTO seed_data (farmer_id, variety_name, acres, seed_per_acre, price_per_kg)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db
      .promise()
      .query(query, [
        farmer_id,
        variety_name,
        acres,
        seed_per_acre,
        price_per_kg,
      ]);

    res.status(201).json({ message: "Seed data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add seed data" });
  }
};
// Get seed data for a specific farmer
const getSeedData = async (req, res) => {
  const { farmer_id } = req.params;
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin can view any farmer's seed data
      query = `
        SELECT sd.*, f.name AS farmer_name, f.facilitator_id
        FROM seed_data sd
        JOIN farmers f ON sd.farmer_id = f.id
        WHERE sd.farmer_id = ?
      `;
      params = [farmer_id];
    } else {
      // Facilitator can only view their farmers' data
      query = `
        SELECT sd.*, f.name AS farmer_name
        FROM seed_data sd
        JOIN farmers f ON sd.farmer_id = f.id
        WHERE sd.farmer_id = ? AND f.facilitator_id = ?
      `;
      params = [farmer_id, user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No seed data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve seed data" });
  }
};

// Get all seed data
const getAllSeedData = async (req, res) => {
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin gets everything
      query = `
        SELECT sd.*, f.name AS farmer_name, f.facilitator_id
        FROM seed_data sd
        JOIN farmers f ON sd.farmer_id = f.id
      `;
      params = [];
    } else {
      // Facilitator only their farmers
      query = `
        SELECT sd.*, f.name AS farmer_name
        FROM seed_data sd
        JOIN farmers f ON sd.farmer_id = f.id
        WHERE f.facilitator_id = ?
      `;
      params = [user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No seed data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve seed data" });
  }
};

// Update seed data by ID (facilitator restricted)
const updateSeedData = async (req, res) => {
  const { id } = req.params;
  const { variety_name, acres, seed_per_acre, price_per_kg } = req.body;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `UPDATE seed_data sd
       JOIN farmers f ON sd.farmer_id = f.id
       SET sd.variety_name = ?, sd.acres = ?, sd.seed_per_acre = ?, sd.price_per_kg = ?
       WHERE sd.id = ? AND f.facilitator_id = ?`,
      [variety_name, acres, seed_per_acre, price_per_kg, id, facilitatorId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Seed data not found or not authorized" });
    }

    res.status(200).json({ message: "Seed data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update seed data" });
  }
};

// Delete seed data by ID (facilitator restricted)
const deleteSeedData = async (req, res) => {
  const { id } = req.params;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `DELETE sd FROM seed_data sd
       JOIN farmers f ON sd.farmer_id = f.id
       WHERE sd.id = ? AND f.facilitator_id = ?`,
      [id, facilitatorId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Seed data not found or not authorized" });
    }

    res.status(200).json({ message: "Seed data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete seed data" });
  }
};

export {
  addSeedData,
  getAllSeedData,
  updateSeedData,
  deleteSeedData,
  getSeedData,
};
