import db from "../db/connection.js"; // Use ES module import

// Add new fertilizer data
const addFertilizerData = async (req, res) => {
  const { farmer_id, type, name, quantity, cost_per_acre } = req.body;

  try {
    const query = `
      INSERT INTO fertilizer_data (farmer_id, type, name, quantity, cost_per_acre)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db
      .promise()
      .query(query, [farmer_id, type, name, quantity, cost_per_acre]);

    res.status(201).json({ message: "Fertilizer data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add fertilizer data" });
  }
};

// Get fertilizer data for a specific farmer
const getFertilizerData = async (req, res) => {
  const { farmer_id } = req.params;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM fertilizer_data WHERE farmer_id = ?", [farmer_id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No fertilizer data found for this farmer" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve fertilizer data" });
  }
};

// Get all fertilizer data
const getAllFertilizerData = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM fertilizer_data");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No fertilizer data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve fertilizer data" });
  }
};

// Update fertilizer data by ID
const updateFertilizerData = async (req, res) => {
  const { id } = req.params;
  const { type, name, quantity, cost_per_acre } = req.body;

  try {
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

// Delete fertilizer data by ID
const deleteFertilizerData = async (req, res) => {
  const { id } = req.params;

  try {
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

export default {
  addFertilizerData,
  getAllFertilizerData,
  getFertilizerData,
  updateFertilizerData,
  deleteFertilizerData,
};
