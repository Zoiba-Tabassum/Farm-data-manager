import db from "../db/connection.js"; // Use ES module import

// Add pesticide usage (only for facilitator's own farmer)
const addPesticideUsage = async (req, res) => {
  const { farmer_id, name, quantity_per_ltr, spray_date, type } = req.body;
  const facilitator_id = req.user.id;

  try {
    // Ensure farmer belongs to facilitator
    const [farmerCheck] = await db
      .promise()
      .query("SELECT id FROM farmers WHERE id = ? AND facilitator_id = ?", [
        farmer_id,
        facilitator_id,
      ]);

    if (farmerCheck.length === 0) {
      return res
        .status(403)
        .json({ error: "Unauthorized to add data for this farmer" });
    }

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

// Get pesticide usage for a specific farmer (Admin unrestricted, Facilitator restricted)
const getPesticideUsage = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin can view any pesticide usage by record ID
      query = "SELECT * FROM pesticide_usage WHERE id = ?";
      params = [id];
    } else {
      // Facilitator: must own the farmer related to this record
      query = `
        SELECT pu.*
        FROM pesticide_usage pu
        JOIN farmers f ON pu.farmer_id = f.id
        WHERE pu.id = ? AND f.facilitator_id = ?
      `;
      params = [id, user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No pesticide usage record found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve pesticide usage data" });
  }
};

// Get all pesticide usage data (Admin = all, Facilitator = own only)
const getAllPesticideUsage = async (req, res) => {
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      query = `
        SELECT pu.*, f.name as farmer_name, f.facilitator_id
        FROM pesticide_usage pu
        JOIN farmers f ON pu.farmer_id = f.id
      `;
      params = [];
    } else {
      query = `
        SELECT pu.*, f.name as farmer_name
        FROM pesticide_usage pu
        JOIN farmers f ON pu.farmer_id = f.id
        WHERE f.facilitator_id = ?
      `;
      params = [user.id];
    }

    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No pesticide usage data found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve pesticide usage data" });
  }
};

// Update pesticide usage data by ID (facilitator restriction)
const updatePesticideUsage = async (req, res) => {
  const { id } = req.params;
  const { name, quantity_per_ltr, spray_date, type } = req.body;
  const facilitator_id = req.user.id;

  try {
    // Ensure the record belongs to a farmer of this facilitator
    const [check] = await db.promise().query(
      `SELECT pu.id 
       FROM pesticide_usage pu
       JOIN farmers f ON pu.farmer_id = f.id
       WHERE pu.id = ? AND f.facilitator_id = ?`,
      [id, facilitator_id]
    );

    if (check.length === 0) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this record" });
    }

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

// Delete pesticide usage data by ID (facilitator restriction)
const deletePesticideUsage = async (req, res) => {
  const { id } = req.params;
  const facilitator_id = req.user.id;

  try {
    // Ensure the record belongs to this facilitator
    const [check] = await db.promise().query(
      `SELECT pu.id 
       FROM pesticide_usage pu
       JOIN farmers f ON pu.farmer_id = f.id
       WHERE pu.id = ? AND f.facilitator_id = ?`,
      [id, facilitator_id]
    );

    if (check.length === 0) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this record" });
    }

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
};
