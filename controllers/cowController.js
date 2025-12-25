const pool = require('../config/db');
const farmModel = require('../models/farmModel');
const cowModel = require('../models/cowModel');
const {
  COLORS, normalizeColor, isValidCowId, isValidFarmId,
  parseIntSafe, isNonNegInt, isValidOwnerName
} = require('../utils/validators');

function colorKeyToDbColor(colorKey) {
  const k = String(colorKey || '').toLowerCase();
  if (k === 'white') return 'White';
  if (k === 'brown') return 'Brown';
  if (k === 'pink') return 'Pink';
  return null;
}

function dbColorToKey(dbColor) {
  const c = String(dbColor || '');
  return c.toLowerCase();
}

async function renderSummary(res, { message, error }) {
  const summary = await farmModel.getFarmSummary();
  return res.render('summary', { summary, message, error });
}

/**
 * WEB
 */
exports.showHome = (req, res) => {
  res.render('index', { error: null });
};

exports.chooseColor = (req, res) => {
  const color = normalizeColor(req.body.color);
  if (!color) {
    return res.status(400).render('index', { error: 'สีไม่ถูกต้อง (ต้องเป็น White/Brown/Pink)' });
  }
  return res.redirect(`/register/${dbColorToKey(color)}`);
};

exports.showRegisterForm = (req, res) => {
  const dbColor = colorKeyToDbColor(req.params.color);
  if (!dbColor) return res.status(404).send('Invalid color');

  const viewName = `register_${dbColor.toLowerCase()}`;
  res.render(viewName, { error: null, data: {} });
};

exports.registerCowWeb = async (req, res) => {
  const dbColor = colorKeyToDbColor(req.params.color);
  if (!dbColor) return res.status(404).send('Invalid color');

  const viewName = `register_${dbColor.toLowerCase()}`;

  const cowId = String(req.body.cow_id || '').trim();
  const farmId = String(req.body.farm_id || '').trim();

  const errors = [];
  if (!isValidCowId(cowId)) errors.push('cow_id ต้องเป็นตัวเลข 8 หลัก และหลักแรกห้ามเป็น 0');
  if (!isValidFarmId(farmId)) errors.push('farm_id ต้องเป็นตัวเลข 1 หลัก และห้ามเป็น 0 (1-9)');

  // สีขาว: อายุปี/เดือน
  let ageYears = null, ageMonths = null;
  // สีน้ำตาล: mother_id
  let motherId = null;
  // สีชมพู: owner names
  let ownerFirst = null, ownerLast = null;

  if (dbColor === 'White') {
    ageYears = parseIntSafe(req.body.age_years);
    ageMonths = parseIntSafe(req.body.age_months);
    if (ageYears === null || ageMonths === null) {
      errors.push('อายุ (ปี/เดือน) ต้องเป็นจำนวนเต็ม');
    } else {
      if (!isNonNegInt(ageYears) || ageYears > 10) errors.push('ปีต้องเป็นจำนวนเต็ม 0-10');
      if (!isNonNegInt(ageMonths) || ageMonths > 11) errors.push('เดือนต้องเป็นจำนวนเต็ม 0-11');
    }
  } else if (dbColor === 'Brown') {
    motherId = String(req.body.mother_id || '').trim();
    if (!isValidCowId(motherId)) errors.push('mother_id ต้องเป็นรหัสวัว 8 หลัก และหลักแรกห้ามเป็น 0');
    if (motherId === cowId) errors.push('mother_id ห้ามเท่ากับ cow_id');
  } else if (dbColor === 'Pink') {
    ownerFirst = String(req.body.owner_firstName || '').trim();
    ownerLast = String(req.body.owner_lastName || '').trim();
    if (!isValidOwnerName(ownerFirst)) errors.push('ชื่อเจ้าของ (firstName) ต้องเป็น a-z ตัวเล็ก ยาว 1-8 ตัว');
    if (!isValidOwnerName(ownerLast)) errors.push('นามสกุลเจ้าของ (lastName) ต้องเป็น a-z ตัวเล็ก ยาว 1-8 ตัว');
  }

  if (errors.length > 0) {
    return res.status(400).render(viewName, { error: errors.join('<br/>'), data: req.body });
  }

  // transaction: ตรวจสีฟาร์ม + insert cow
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const farm = await farmModel.getFarmForUpdate(conn, farmId);
    if (!farm) {
      await conn.rollback();
      return res.status(400).render(viewName, { error: 'ไม่พบฟาร์มนี้ในระบบ', data: req.body });
    }

    if (farm.color && farm.color !== dbColor) {
      await conn.rollback();
      return res.status(409).render(viewName, {
        error: `ฟาร์ม ${farmId} รับได้แค่สีเดียวเท่านั้น (ปัจจุบันเป็น ${farm.color})`,
        data: req.body
      });
    }

    // ถ้าฟาร์มยังไม่กำหนดสี ให้ตั้งสี
    if (!farm.color) {
      await farmModel.setFarmColor(conn, farmId, dbColor);
    }

    const exists = await cowModel.cowExists(conn, cowId);
    if (exists) {
      await conn.rollback();
      return res.status(409).render(viewName, { error: 'cow_id นี้ถูกใช้แล้ว', data: req.body });
    }

    if (dbColor === 'Brown') {
      const mother = await cowModel.getCow(conn, motherId);
      if (!mother) {
        await conn.rollback();
        return res.status(400).render(viewName, { error: 'ไม่พบ mother_id นี้ในระบบ', data: req.body });
      }
    }

    await cowModel.insertCow(conn, {
      cow_id: cowId,
      color: dbColor,
      farm_id: Number(farmId),
      age_years: dbColor === 'White' ? ageYears : null,
      age_months: dbColor === 'White' ? ageMonths : null,
      mother_id: dbColor === 'Brown' ? motherId : null,
      owner_firstName: dbColor === 'Pink' ? ownerFirst : null,
      owner_lastName: dbColor === 'Pink' ? ownerLast : null,
    });

    await conn.commit();

    return renderSummary(res, {
      message: `ลงทะเบียนสำเร็จ: วัวสี ${dbColor} รหัส ${cowId} เข้าฟาร์ม ${farmId}`,
      error: null
    });
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    // กรณี error จาก constraint ใน DB
    return res.status(500).render(viewName, { error: `เกิดข้อผิดพลาด: ${err.message}`, data: req.body });
  } finally {
    conn.release();
  }
};

exports.showSummary = async (req, res) => {
  return renderSummary(res, { message: null, error: null });
};

/**
 * API (JSON) - สำหรับทดสอบด้วย Postman/curl
 */
exports.registerCowApi = async (req, res) => {
  const dbColor = colorKeyToDbColor(req.params.color);
  if (!dbColor) return res.status(404).json({ ok: false, error: 'Invalid color' });

  const cowId = String(req.body.cow_id || '').trim();
  const farmId = String(req.body.farm_id || '').trim();

  const errors = [];
  if (!isValidCowId(cowId)) errors.push('cow_id invalid');
  if (!isValidFarmId(farmId)) errors.push('farm_id invalid');

  let ageYears = null, ageMonths = null, motherId = null, ownerFirst = null, ownerLast = null;

  if (dbColor === 'White') {
    ageYears = parseIntSafe(req.body.age_years);
    ageMonths = parseIntSafe(req.body.age_months);
    if (ageYears === null || ageMonths === null) errors.push('age_years/age_months must be integers');
    if (ageYears !== null && (!isNonNegInt(ageYears) || ageYears > 10)) errors.push('age_years must be 0-10');
    if (ageMonths !== null && (!isNonNegInt(ageMonths) || ageMonths > 11)) errors.push('age_months must be 0-11');
  } else if (dbColor === 'Brown') {
    motherId = String(req.body.mother_id || '').trim();
    if (!isValidCowId(motherId)) errors.push('mother_id invalid');
    if (motherId === cowId) errors.push('mother_id cannot equal cow_id');
  } else if (dbColor === 'Pink') {
    ownerFirst = String(req.body.owner_firstName || '').trim();
    ownerLast = String(req.body.owner_lastName || '').trim();
    if (!isValidOwnerName(ownerFirst)) errors.push('owner_firstName invalid');
    if (!isValidOwnerName(ownerLast)) errors.push('owner_lastName invalid');
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const farm = await farmModel.getFarmForUpdate(conn, farmId);
    if (!farm) {
      await conn.rollback();
      return res.status(400).json({ ok: false, error: 'farm not found' });
    }

    if (farm.color && farm.color !== dbColor) {
      await conn.rollback();
      return res.status(409).json({
        ok: false,
        error: 'farm accepts only one color',
        farm_id: farmId,
        farm_color: farm.color
      });
    }

    if (!farm.color) {
      await farmModel.setFarmColor(conn, farmId, dbColor);
    }

    const exists = await cowModel.cowExists(conn, cowId);
    if (exists) {
      await conn.rollback();
      return res.status(409).json({ ok: false, error: 'cow_id already exists' });
    }

    if (dbColor === 'Brown') {
      const mother = await cowModel.getCow(conn, motherId);
      if (!mother) {
        await conn.rollback();
        return res.status(400).json({ ok: false, error: 'mother_id not found' });
      }
    }

    await cowModel.insertCow(conn, {
      cow_id: cowId,
      color: dbColor,
      farm_id: Number(farmId),
      age_years: dbColor === 'White' ? ageYears : null,
      age_months: dbColor === 'White' ? ageMonths : null,
      mother_id: dbColor === 'Brown' ? motherId : null,
      owner_firstName: dbColor === 'Pink' ? ownerFirst : null,
      owner_lastName: dbColor === 'Pink' ? ownerLast : null,
    });

    await conn.commit();

    return res.json({ ok: true, message: 'registered', cow_id: cowId, color: dbColor, farm_id: Number(farmId) });
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    conn.release();
  }
};

exports.getFarmSummaryApi = async (req, res) => {
  const summary = await farmModel.getFarmSummary();
  res.json({ ok: true, summary });
};
