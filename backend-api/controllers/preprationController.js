import db from "../db/connection.js"; // Use ES module import for database connection

// Add new land preparation record (facilitator can only add for their own farmers)
const addLandPreparation = async (req, res) => {
  const { farmer_id, factor, cost_per_acre } = req.body;
  const facilitatorId = req.user.id; // from auth middleware

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

// Get all land preparation records for this facilitator
const getAllLandPreparation = async (req, res) => {
  const facilitatorId = req.user.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT lp.* 
       FROM land_preparation lp
       JOIN farmers f ON lp.farmer_id = f.id
       WHERE f.facilitator_id = ?`,
      [facilitatorId]
    );

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

// Get land preparation records by farmer_id (facilitator restricted)
const getLandPreparation = async (req, res) => {
  const { farmer_id } = req.params;
  const facilitatorId = req.user.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT lp.* 
       FROM land_preparation lp
       JOIN farmers f ON lp.farmer_id = f.id
       WHERE lp.farmer_id = ? AND f.facilitator_id = ?`,
      [farmer_id, facilitatorId]
    );

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

// Update a specific land preparation record by ID (facilitator restricted)
const updateLandPreparation = async (req, res) => {
  const { id } = req.params;
  const { factor, cost_per_acre } = req.body;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `UPDATE land_preparation lp
       JOIN farmers f ON lp.farmer_id = f.id
       SET lp.factor = ?, lp.cost_per_acre = ?
       WHERE lp.id = ? AND f.facilitator_id = ?`,
      [factor, cost_per_acre, id, facilitatorId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Record not found or not authorized" });
    }

    res.status(200).json({ message: "Land preparation record updated" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update land preparation record" });
  }
};

// Delete a land preparation record by ID (facilitator restricted)
const deleteLandPreparation = async (req, res) => {
  const { id } = req.params;
  const facilitatorId = req.user.id;

  try {
    const [result] = await db.promise().query(
      `DELETE lp FROM land_preparation lp
       JOIN farmers f ON lp.farmer_id = f.id
       WHERE lp.id = ? AND f.facilitator_id = ?`,
      [id, facilitatorId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Record not found or not authorized" });
    }

    res.status(200).json({ message: "Land preparation record deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete land preparation record" });
  }
};

export {
  addLandPreparation,
  getAllLandPreparation,
  getLandPreparation,
  updateLandPreparation,
  deleteLandPreparation,
};
