import db from "../db/connection.js"; // Use ES module import

// Add pesticide usage
const addPesticideUsage = async (req, res) => {
  const { farmer_id, name, quantity_per_ltr, spray_date, type } = req.body;

  try {
    const query = `
      INSERT INTO pesticide_usage (farmer_id, name, quantity_per_ltr, spray_date, type)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db
      .promise()
      .query(query, [farmer_id, name, quantity_per_ltr, spray_date, type]);

    res
      .status(201)
      .json({ message: "Pesticide usage data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add pesticide usage data" });
  }
};

// Get pesticide usage for a specific farmer
const getPesticideUsage = async (req, res) => {
  const { farmer_id } = req.params;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM pesticide_usage WHERE farmer_id = ?", [farmer_id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No pesticide usage data found for this farmer" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve pesticide usage data" });
  }
};

// Get all pesticide usage data
const getAllPesticideUsage = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM pesticide_usage");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No pesticide usage data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve pesticide usage data" });
  }
};

// Update pesticide usage data by ID
const updatePesticideUsage = async (req, res) => {
  const { id } = req.params;
  const { name, quantity_per_ltr, spray_date, type } = req.body;

  try {
    const [result] = await db.promise().query(
      `UPDATE pesticide_usage
       SET name = ?, quantity_per_ltr = ?, spray_date = ?, type = ?
       WHERE id = ?`,
      [name, quantity_per_ltr, spray_date, type, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Pesticide usage data not found" });
    }

    res
      .status(200)
      .json({ message: "Pesticide usage data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update pesticide usage data" });
  }
};

// Delete pesticide usage data by ID
const deletePesticideUsage = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM pesticide_usage WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Pesticide usage data not found" });
    }

    res
      .status(200)
      .json({ message: "Pesticide usage data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete pesticide usage data" });
  }
};

export {
  addPesticideUsage,
  getPesticideUsage,
  getAllPesticideUsage,
  updatePesticideUsage,
  deletePesticideUsage,
}; // Export all functions for use in routes
