import db from "../db/connection.js"; // Use ES module import

// Add Farmer
const addfarmer = async (req, res) => {
  const { name, cnic, phone, village, tehsil, code } = req.body;
  const facilitator_id = req.user.id;

  const query = `
    INSERT INTO farmers (name, cnic, phone, village, tehsil, facilitator_id, code)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [name, cnic, phone, village, tehsil, facilitator_id, code];

  try {
    await db.promise().query(query, values);
    return res.status(201).json({ message: "Farmer added successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Farmer already exists" });
    }
    console.error("Error adding farmer:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Farmer (only if belongs to facilitator)
const deletefarmer = async (req, res) => {
  const { code } = req.params;
  const facilitator_id = req.user.id;

  const query = "DELETE FROM farmers WHERE code = ? AND facilitator_id = ?";
  try {
    const [result] = await db.promise().query(query, [code, facilitator_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Farmer not found or not yours" });
    }
    return res.status(200).json({ message: "Farmer deleted successfully." });
  } catch (err) {
    console.error("Error deleting farmer:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update Farmer (only if belongs to facilitator)
const updatefarmer = async (req, res) => {
  const { code } = req.params;
  const { name, cnic, phone, village, tehsil } = req.body;
  const facilitator_id = req.user.id;

  const query = `
    UPDATE farmers
    SET name = ?, cnic = ?, phone = ?, village = ?, tehsil = ?
    WHERE code = ? AND facilitator_id = ?
  `;
  const values = [name, cnic, phone, village, tehsil, code, facilitator_id];

  try {
    const [result] = await db.promise().query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Farmer not found or not yours" });
    }
    return res.status(200).json({ message: "Farmer updated successfully." });
  } catch (err) {
    console.error("Error updating farmer:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get Farmer
const getfarmer = async (req, res) => {
  const { code } = req.params;
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin can see any farmer
      query = "SELECT * FROM farmers WHERE code = ?";
      params = [code];
    } else {
      // Facilitator can only see their own farmer
      query = "SELECT * FROM farmers WHERE code = ? AND facilitator_id = ?";
      params = [code, user.id];
    }

    const [result] = await db.promise().query(query, params);

    if (result.length === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error retrieving farmer:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Farmers
const getallfarmers = async (req, res) => {
  const user = req.user;

  try {
    let query, params;

    if (user.role === "admin") {
      // Admin gets all farmers
      query = "SELECT * FROM farmers";
      params = [];
    } else {
      // Facilitator only their own
      query = "SELECT * FROM farmers WHERE facilitator_id = ?";
      params = [user.id];
    }

    const [rows] = await db.promise().query(query, params);
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error retrieving farmers:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { addfarmer, getfarmer, deletefarmer, updatefarmer, getallfarmers };
