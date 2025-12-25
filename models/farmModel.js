const pool = require('../config/db');

async function getFarmForUpdate(conn, farmId) {
  const [rows] = await conn.query(
    'SELECT farm_id, color FROM farms WHERE farm_id = ? FOR UPDATE',
    [farmId]
  );
  return rows[0] || null;
}

async function getFarm(conn, farmId) {
  const [rows] = await conn.query(
    'SELECT farm_id, color FROM farms WHERE farm_id = ?',
    [farmId]
  );
  return rows[0] || null;
}

async function setFarmColor(conn, farmId, color) {
  await conn.query('UPDATE farms SET color = ? WHERE farm_id = ?', [color, farmId]);
}

async function getFarmSummary() {
  // แสดงฟาร์มทุกฟาร์ม พร้อมสีที่ฟาร์มรับ และจำนวนวัว
  const [rows] = await pool.query(`
    SELECT f.farm_id,
           f.color AS farm_color,
           COUNT(c.cow_id) AS cow_count,
           COALESCE(MAX(c.color), f.color) AS cows_color
    FROM farms f
    LEFT JOIN cows c ON c.farm_id = f.farm_id
    GROUP BY f.farm_id, f.color
    ORDER BY f.farm_id ASC
  `);
  return rows;
}

module.exports = {
  getFarmForUpdate,
  getFarm,
  setFarmColor,
  getFarmSummary,
};
