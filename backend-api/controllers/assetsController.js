import db from "../db/connection.js"; // Use ES module import

const addAssets = async (req, res) => {
  const { farmer_id, area_acres, soil_type, irrigation_type, livestock } =
    req.body;

  const connection = await db.promise().getConnection(); // optional for transaction

  try {
    await connection.beginTransaction();

    // Insert into farm_data (replace to avoid UNIQUE constraint error)
    const farmQuery = `
      INSERT INTO farm_data (farmer_id, area_acres, soil_type, irrigation_type)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        area_acres = VALUES(area_acres),
        soil_type = VALUES(soil_type),
        irrigation_type = VALUES(irrigation_type)
    `;
    await connection.query(farmQuery, [
      farmer_id,
      area_acres,
      soil_type,
      irrigation_type,
    ]);

    // Insert livestock entries
    if (Array.isArray(livestock)) {
      for (const animal of livestock) {
        const livestockQuery = `
          INSERT INTO livestock (farmer_id, animal_type, quantity, shelter, clean_water, trained, vaccinated)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(livestockQuery, [
          farmer_id,
          animal.animal_type,
          animal.quantity,
          animal.shelter,
          animal.clean_water,
          animal.trained,
          animal.vaccinated,
        ]);
      }
    }

    await connection.commit();
    res.status(200).json({ message: "Assets added successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to add assets" });
  } finally {
    connection.release();
  }
};

const getAssets = async (req, res) => {
  const { farmer_id } = req.params;

  try {
    // Get farm_data
    const [farmRows] = await db
      .promise()
      .query("SELECT * FROM farm_data WHERE farmer_id = ?", [farmer_id]);

    // Get livestock
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
  try {
    const [farmRows] = await db.promise().query("SELECT * FROM farm_data");
    const [livestockRows] = await db.promise().query("SELECT * FROM livestock");

    if (farmRows.length === 0 && livestockRows.length === 0) {
      return res.status(404).json({ message: "No assets found" });
    }

    // Combine assets per farmer
    const farmerMap = {};

    // Add farm_data
    for (const farm of farmRows) {
      farmerMap[farm.farmer_id] = {
        farm_data: farm,
        livestock: [],
      };
    }

    // Add livestock
    for (const animal of livestockRows) {
      if (!farmerMap[animal.farmer_id]) {
        farmerMap[animal.farmer_id] = {
          farm_data: null,
          livestock: [],
        };
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

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    // Update farm_data (if exists, otherwise ignore)
    await connection.query(
      `UPDATE farm_data
       SET area_acres = ?, soil_type = ?, irrigation_type = ?
       WHERE farmer_id = ?`,
      [area_acres, soil_type, irrigation_type, farmer_id]
    );

    if (Array.isArray(livestock)) {
      // Optional: delete old livestock records
      await connection.query(`DELETE FROM livestock WHERE farmer_id = ?`, [
        farmer_id,
      ]);

      // Insert new livestock entries
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
    res.status(200).json({ message: "Assets updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to update assets" });
  } finally {
    connection.release();
  }
};

const deleteAssets = async (req, res) => {
  const { farmer_id } = req.params;

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    // Delete livestock first (due to foreign key)
    await connection.query(`DELETE FROM livestock WHERE farmer_id = ?`, [
      farmer_id,
    ]);

    // Then delete farm_data
    await connection.query(`DELETE FROM farm_data WHERE farmer_id = ?`, [
      farmer_id,
    ]);

    await connection.commit();
    res.status(200).json({ message: "Assets deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to delete assets" });
  } finally {
    connection.release();
  }
};

export { addAssets, getAssets, getAllAssets, updateAssets, deleteAssets };
