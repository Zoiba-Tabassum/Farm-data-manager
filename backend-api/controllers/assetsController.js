import db from "../db/connection.js"; // Use ES module import

// Helper to check facilitator access
const checkFarmerOwnership = async (farmer_id, user) => {
  if (user.role === "admin") return true;

  const [rows] = await db
    .promise()
    .query("SELECT 1 FROM farmers WHERE id = ? AND facilitator_id = ?", [
      farmer_id,
      user.id,
    ]);
  return rows.length > 0;
};

const addAssets = async (req, res) => {
  const { farmer_id, area_acres, soil_type, irrigation_type, livestock } =
    req.body;
  const user = req.user;

  try {
    // Access control
    const allowed = await checkFarmerOwnership(farmer_id, user);
    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this farmer" });
    }

    const connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // 1️⃣ Check if farm_data already exists
    const [existingFarm] = await connection.query(
      "SELECT id FROM farm_data WHERE farmer_id = ?",
      [farmer_id]
    );

    if (existingFarm.length === 0) {
      // 2️⃣ Insert farm_data if not exists
      await connection.query(
        `INSERT INTO farm_data (farmer_id, area_acres, soil_type, irrigation_type)
         VALUES (?, ?, ?, ?)`,
        [farmer_id, area_acres, soil_type, irrigation_type]
      );
    }
    // else → skip farm insert/update, only livestock will be added

    // 3️⃣ Insert livestock if provided
    if (Array.isArray(livestock) && livestock.length > 0) {
      for (const animal of livestock) {
        await connection.query(
          `INSERT INTO livestock (farmer_id, animal_type, quantity, shelter, clean_water, trained, vaccinated)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            farmer_id,
            animal.animal_type,
            animal.quantity,
            animal.shelter || 0,
            animal.clean_water || 0,
            animal.trained || 0,
            animal.vaccinated || 0,
          ]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Assets added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add assets" });
  }
};

const getAssets = async (req, res) => {
  const { farmer_id } = req.params;
  const user = req.user;

  try {
    const allowed = await checkFarmerOwnership(farmer_id, user);
    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this farmer" });
    }

    const [farmRows] = await db
      .promise()
      .query("SELECT * FROM farm_data WHERE farmer_id = ?", [farmer_id]);

    const [livestockRows] = await db
      .promise()
      .query("SELECT * FROM livestock WHERE farmer_id = ?", [farmer_id]);

    if (farmRows.length === 0 && livestockRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No assets found for this farmer" });
    }

    res.status(200).json({
      farm_data: farmRows[0] || null,
      livestock: livestockRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve assets" });
  }
};

const getAllAssets = async (req, res) => {
  const user = req.user;

  try {
    let farmQuery = "SELECT * FROM farm_data";
    let livestockQuery = "SELECT * FROM livestock";
    let params = [];

    if (user.role === "field_facilitator") {
      farmQuery = `
        SELECT fd.* FROM farm_data fd
        JOIN farmers f ON f.id = fd.farmer_id
        WHERE f.facilitator_id = ?
      `;
      livestockQuery = `
        SELECT l.* FROM livestock l
        JOIN farmers f ON f.id = l.farmer_id
        WHERE f.facilitator_id = ?
      `;
      params = [user.id];
    }

    const [farmRows] = await db.promise().query(farmQuery, params);
    const [livestockRows] = await db.promise().query(livestockQuery, params);

    if (farmRows.length === 0 && livestockRows.length === 0) {
      return res.status(404).json({ message: "No assets found" });
    }

    const farmerMap = {};
    for (const farm of farmRows) {
      farmerMap[farm.farmer_id] = { farm_data: farm, livestock: [] };
    }
    for (const animal of livestockRows) {
      if (!farmerMap[animal.farmer_id]) {
        farmerMap[animal.farmer_id] = { farm_data: null, livestock: [] };
      }
      farmerMap[animal.farmer_id].livestock.push(animal);
    }

    res.status(200).json(Object.values(farmerMap));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve assets" });
  }
};

const updateAssets = async (req, res) => {
  const { farmer_id } = req.params;
  const { area_acres, soil_type, irrigation_type, livestock } = req.body;
  const user = req.user;

  try {
    const allowed = await checkFarmerOwnership(farmer_id, user);
    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this farmer" });
    }

    const connection = await db.promise().getConnection();
    await connection.beginTransaction();

    await connection.query(
      `UPDATE farm_data
       SET area_acres = ?, soil_type = ?, irrigation_type = ?
       WHERE farmer_id = ?`,
      [area_acres, soil_type, irrigation_type, farmer_id]
    );

    if (Array.isArray(livestock)) {
      await connection.query(`DELETE FROM livestock WHERE farmer_id = ?`, [
        farmer_id,
      ]);

      for (const animal of livestock) {
        await connection.query(
          `INSERT INTO livestock (farmer_id, animal_type, quantity, shelter, clean_water, trained, vaccinated)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            farmer_id,
            animal.animal_type,
            animal.quantity,
            animal.shelter,
            animal.clean_water,
            animal.trained,
            animal.vaccinated,
          ]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Assets updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update assets" });
  }
};

const deleteAssets = async (req, res) => {
  const { farmer_id } = req.params;
  const user = req.user;

  try {
    const allowed = await checkFarmerOwnership(farmer_id, user);
    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this farmer" });
    }

    const connection = await db.promise().getConnection();
    await connection.beginTransaction();

    await connection.query(`DELETE FROM livestock WHERE farmer_id = ?`, [
      farmer_id,
    ]);
    await connection.query(`DELETE FROM farm_data WHERE farmer_id = ?`, [
      farmer_id,
    ]);

    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Assets deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete assets" });
  }
};

export { addAssets, getAssets, getAllAssets, updateAssets, deleteAssets };
