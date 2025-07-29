import db from "../db/connection.js"; // Use ES module import

const addfarmer = async (req, res) => {
  const { name, cnic, phone, village, tehsil, code } = req.body;
  const facilitator_id = req.user.id; // Get the authenticated user's ID from the request object
  const query =
    "INSERT INTO farmers (name, cnic, phone, village, tehsil, facilitator_id,code) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [name, cnic, phone, village, tehsil, facilitator_id, code];
  try {
    await db.promise().query(query, values);
    res.status(201).json({ message: "Farmer added successfully." });
  } catch (err) {
    console.error("Error adding farmer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({ error: "Farmer already exists" }); // If farmer already exists, return 400
  }
};

const getfarmer = async (req, res) => {
  const { code } = req.params;
  const query = "SELECT * FROM farmers WHERE code = ?";
  try {
    await db.promise().query(query, [code]);
    res.status(200).json({ message: "Farmer retrieved successfully." });
  } catch (err) {
    console.error("Error retrieving farmer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletefarmer = async (req, res) => {
  const { code } = req.params;
  const query = "DELETE FROM farmers WHERE code = ?";
  try {
    await db.promise().query(query, [code]);
    res.status(200).json({ message: "Farmer deleted successfully." });
  } catch (err) {
    console.error("Error deleting farmer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatefarmer = async (req, res) => {
  const { code } = req.params;
  const { name, cnic, phone, village, tehsil } = req.body;
  const query =
    "UPDATE farmers SET name = ?, cnic = ?, phone = ?, village = ?, tehsil = ? WHERE code = ?";
  const values = [name, cnic, phone, village, tehsil, code];
  try {
    await db.promise().query(query, values);
    res.status(200).json({ message: "Farmer updated successfully." });
  } catch (err) {
    console.error("Error updating farmer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getallfarmers = async (req, res) => {
  const facilitator_id = req.user.id; // Get the authenticated user's ID from the request object
  const query = "SELECT * FROM farmers WHERE facilitator_id = ?";
  try {
    const [rows] = await db.promise().query(query, [facilitator_id]);
    res.status(200).json(rows); // Return the list of farmers
  } catch (err) {
    console.error("Error retrieving farmers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export { addfarmer, getfarmer, deletefarmer, updatefarmer, getallfarmers }; // Export the addfarmer function for use in routes
