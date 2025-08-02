import db from "../db/connection.js"; // Use ES module import

// Add new water data entry
const addWaterData = async (req, res) => {
  const {
    farmer_id,
    source,
    irrigation_date,
    quantity_per_acre,
    time,
    cost_per_acre,
  } = req.body;

  try {
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

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM water_data WHERE farmer_id = ?", [farmer_id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No water data found for this farmer" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve water data" });
  }
};

// Get all water data
const getAllWaterData = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM water_data");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No water data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve water data" });
  }
};

// Update water data by ID
const updateWaterData = async (req, res) => {
  const { id } = req.params;
  const { source, irrigation_date, quantity_per_acre, time, cost_per_acre } =
    req.body;

  try {
    const [result] = await db.promise().query(
      `UPDATE water_data
       SET source = ?, irrigation_date = ?, quantity_per_acre = ?, time = ?, cost_per_acre = ?
       WHERE id = ?`,
      [source, irrigation_date, quantity_per_acre, time, cost_per_acre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Water data not found" });
    }

    res.status(200).json({ message: "Water data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update water data" });
  }
};

// Delete water data by ID
const deleteWaterData = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM water_data WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Water data not found" });
    }

    res.status(200).json({ message: "Water data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete water data" });
  }
};

export default {
  addWaterData,
  getWaterData,
  getAllWaterData,
  deleteWaterData,
  updateWaterData,
};
