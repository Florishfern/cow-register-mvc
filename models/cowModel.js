const pool = require('../config/db');

async function cowExists(conn, cowId) {
  const [rows] = await conn.query('SELECT cow_id FROM cows WHERE cow_id = ?', [cowId]);
  return rows.length > 0;
}

async function getCow(conn, cowId) {
  const [rows] = await conn.query('SELECT * FROM cows WHERE cow_id = ?', [cowId]);
  return rows[0] || null;
}

async function insertCow(conn, cow) {
  const {
    cow_id, color, farm_id,
    age_years, age_months,
    mother_id,
    owner_firstName, owner_lastName
  } = cow;

  await conn.query(
    `INSERT INTO cows
      (cow_id, color, farm_id, age_years, age_months, mother_id, owner_firstName, owner_lastName)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [cow_id, color, farm_id, age_years, age_months, mother_id, owner_firstName, owner_lastName]
  );
}

module.exports = {
  cowExists,
  getCow,
  insertCow,
};
