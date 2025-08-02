import db from "../db/connection.js"; // Use ES module import for database connection

// Add new land preparation record
const addLandPreparation = async (req, res) => {
  const { farmer_id, factor, cost_per_acre } = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO land_preparation (farmer_id, factor, cost_per_acre)
       VALUES (?, ?, ?)`,
      [farmer_id, factor, cost_per_acre]
    );

    res
      .status(201)
      .json({ message: "Land preparation record added", id: result.insertId });
  } catch (error) {
    console.error("Add Error:", error);
    res.status(500).json({ error: "Failed to add land preparation record" });
  }
};

// Get all land preparation records
const getAllLandPreparation = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM land_preparation");

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No land preparation records found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get All Error:", error);
    res.status(500).json({ error: "Failed to retrieve records" });
  }
};

// Get land preparation records by farmer_id
const getLandPreparation = async (req, res) => {
  const { farmer_id } = req.params;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM land_preparation WHERE farmer_id = ?", [farmer_id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No records found for this farmer" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get Error:", error);
    res.status(500).json({ error: "Failed to retrieve record" });
  }
};

// Update a specific land preparation record by ID
const updateLandPreparation = async (req, res) => {
  const { id } = req.params;
  const { factor, cost_per_acre } = req.body;

  try {
    const [result] = await db.promise().query(
      `UPDATE land_preparation
       SET factor = ?, cost_per_acre = ?
       WHERE id = ?`,
      [factor, cost_per_acre, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Land preparation record not found" });
    }

    res.status(200).json({ message: "Land preparation record updated" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update land preparation record" });
  }
};

// Delete a land preparation record by ID
const deleteLandPreparation = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM land_preparation WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Land preparation record not found" });
    }

    res.status(200).json({ message: "Land preparation record deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete land preparation record" });
  }
};

module.exports = {
  addLandPreparation,
  getAllLandPreparation,
  getLandPreparation,
  updateLandPreparation,
  deleteLandPreparation,
};
