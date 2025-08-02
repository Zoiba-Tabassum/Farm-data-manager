import db from "../db/connection.js"; // Use ES module import

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

  try {
    const query = `
      INSERT INTO cotton_picking 
      (farmer_id, average, total, rate, total_earning, total_cost, buyer_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db
      .promise()
      .query(query, [
        farmer_id,
        average,
        total,
        rate,
        total_earning,
        total_cost,
        buyer_name,
      ]);

    res
      .status(201)
      .json({ message: "Cotton picking record added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add cotton picking record" });
  }
};

// Get cotton picking records for a specific farmer
const getCottonPicking = async (req, res) => {
  const { farmer_id } = req.params;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM cotton_picking WHERE farmer_id = ?", [farmer_id]);

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
  try {
    const [rows] = await db.promise().query("SELECT * FROM cotton_picking");

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

  try {
    const [result] = await db.promise().query(
      `
      UPDATE cotton_picking
      SET average = ?, total = ?, rate = ?, total_earning = ?, total_cost = ?, buyer_name = ?
      WHERE id = ?
      `,
      [average, total, rate, total_earning, total_cost, buyer_name, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Cotton picking record not found" });
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

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM cotton_picking WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Cotton picking record not found" });
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
