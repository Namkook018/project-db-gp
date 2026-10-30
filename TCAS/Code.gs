// ============================================================
//  TCAS Score Manager — Google Apps Script Backend (v2)
//  วิธีใช้งาน:
//  1. ไปที่ script.google.com → เปิดโปรเจกต์เดิม
//  2. แทนที่ Code.gs และ index.html ด้วยไฟล์ใหม่
//  3. Deploy → Manage deployments → Edit → New version → Deploy
//     - Execute as: Me
//     - Who has access: Anyone
//  (ข้อมูลเดิมใน Google Sheet ยังอยู่ครบ ไม่ต้องย้าย)
// ============================================================

// ← เปลี่ยนรหัสผ่านที่นี่ (หรือไปตั้งใน Project Settings → Script properties ชื่อ ADMIN_PW)
const ADMIN_PW_DEFAULT = 'tcas2025';
const TOKEN_TTL = 21600; // 6 ชั่วโมง

function _adminPw() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_PW') || ADMIN_PW_DEFAULT;
}

// ── SERVE HTML ───────────────────────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('TCAS Score Manager')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── SPREADSHEET SETUP ────────────────────────────────────────
function _sheet() {
  const p = PropertiesService.getScriptProperties();
  const ssId = p.getProperty('TCAS_SS_ID');

  if (ssId) {
    try {
      const ss = SpreadsheetApp.openById(ssId);
      return ss.getSheetByName('Students') || _setupSheet(ss);
    } catch (_) {}
  }
  const ss = SpreadsheetApp.create('TCAS Score Manager — Data');
  p.setProperty('TCAS_SS_ID', ss.getId());
  return _setupSheet(ss);
}

function _setupSheet(ss) {
  let sh = ss.getSheetByName('Students');
  if (sh && sh.getLastRow() > 0) return sh; // มีข้อมูลอยู่แล้ว ห้ามล้าง
  if (!sh) sh = ss.insertSheet('Students');

  const headers = ['id', 'name', 'grade', 'scores', 'nscores', 'created_at', 'updated_at'];
  sh.appendRow(headers);
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('@'); // เก็บ id เป็นข้อความ กัน Sheets แปลงเป็นตัวเลข

  const hRange = sh.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
  sh.setColumnWidth(1, 160).setColumnWidth(2, 200).setColumnWidth(3, 80)
    .setColumnWidth(4, 500).setColumnWidth(5, 500)
    .setColumnWidth(6, 180).setColumnWidth(7, 180);
  return sh;
}

// ── HELPERS ──────────────────────────────────────────────────
function _normName(s) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, 100); }

function _num(v) {
  const n = Number(v);
  return (isFinite(n) && n >= 0 && n <= 100) ? Math.round(n * 100) / 100 : null;
}

function _cleanScores(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(k => {
    if (!/^[a-z0-9_]+$/i.test(k)) return;
    const n = _num(obj[k]);
    if (n !== null) out[k] = n;
  });
  return out;
}

function _cleanNScores(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(r => {
    if (!/^[0-3]$/.test(r)) return;
    out[r] = _cleanScores(obj[r]);
  });
  return out;
}

function _parse(str) {
  try { return JSON.parse(str || '{}'); } catch (_) { return {}; }
}

function _isAdmin(token) {
  return !!token && CacheService.getScriptCache().get('adm_' + token) === '1';
}

function _withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

// ── GET ALL STUDENTS ─────────────────────────────────────────
function getAllStudents() {
  try {
    const sh = _sheet();
    const vals = sh.getDataRange().getValues();
    if (vals.length < 2) return { ok: true, data: [] };

    const data = vals.slice(1)
      .filter(r => r[0])
      .map(r => ({
        id:      String(r[0]),
        name:    String(r[1]),
        grade:   String(r[2] || ''),
        scores:  _parse(r[3]),
        nscores: _parse(r[4]),
      }));
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── SAVE STUDENT (INSERT OR UPDATE) ─────────────────────────
function saveStudent(d) {
  try {
    return _withLock(() => {
      const name = _normName(d.name);
      if (!name) return { ok: false, error: 'กรุณากรอกชื่อ' };

      const sh     = _sheet();
      const vals   = sh.getDataRange().getValues();
      const now    = new Date().toISOString();
      const grade  = String(d.grade || '').slice(0, 20);
      const sj     = JSON.stringify(_cleanScores(d.scores));
      const nj     = JSON.stringify(_cleanNScores(d.nscores));

      // UPDATE existing
      if (d.id) {
        for (let i = 1; i < vals.length; i++) {
          if (String(vals[i][0]) === String(d.id)) {
            sh.getRange(i + 1, 1, 1, 7)
              .setValues([[String(d.id), name, grade, sj, nj, vals[i][5], now]]);
            return { ok: true, id: String(d.id) };
          }
        }
      }

      // กันชื่อซ้ำตอนสร้างใหม่
      for (let i = 1; i < vals.length; i++) {
        if (_normName(vals[i][1]) === name) {
          return { ok: false, error: 'มีชื่อ "' + name + '" ในระบบแล้ว — กรุณาเลือกชื่อเดิมจากรายการ' };
        }
      }

      // INSERT new
      const id = String(Date.now());
      sh.appendRow([id, name, grade, sj, nj, now, now]);
      return { ok: true, id };
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── DELETE (admin only) ──────────────────────────────────────
function deleteStudent(a) {
  try {
    if (!a || !_isAdmin(a.token)) return { ok: false, error: 'ไม่มีสิทธิ์ (กรุณาเข้าสู่ระบบ Admin ใหม่)' };
    return _withLock(() => {
      const sh = _sheet();
      const vals = sh.getDataRange().getValues();
      for (let i = vals.length - 1; i >= 1; i--) {
        if (String(vals[i][0]) === String(a.id)) {
          sh.deleteRow(i + 1);
          return { ok: true };
        }
      }
      return { ok: false, error: 'ไม่พบนักเรียน' };
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function deleteAllStudents(token) {
  try {
    if (!_isAdmin(token)) return { ok: false, error: 'ไม่มีสิทธิ์ (กรุณาเข้าสู่ระบบ Admin ใหม่)' };
    return _withLock(() => {
      const sh = _sheet();
      const last = sh.getLastRow();
      if (last > 1) sh.deleteRows(2, last - 1);
      return { ok: true };
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── ADMIN AUTH ───────────────────────────────────────────────
function verifyAdmin(pw) {
  if (pw !== _adminPw()) return { ok: false };
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('adm_' + token, '1', TOKEN_TTL);
  return { ok: true, token };
}

// ── GET SPREADSHEET URL (admin only) ─────────────────────────
function getSheetUrl(token) {
  try {
    if (!_isAdmin(token)) return { ok: false, error: 'ไม่มีสิทธิ์' };
    const ssId = PropertiesService.getScriptProperties().getProperty('TCAS_SS_ID');
    return { ok: true, url: ssId ? 'https://docs.google.com/spreadsheets/d/' + ssId : null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}


// ── ผูกสคริปต์กับ Google Sheet ที่มีข้อมูลอยู่แล้ว ───────────────
// วิธีใช้: เลือกฟังก์ชัน setSpreadsheetId แล้วกด Run (ครั้งเดียว)
function setSpreadsheetId() {
  const SS_ID = '1vw7SBMZjazO25tPghDpp_5miSKT1QNz8j4XmvPeuSFw'; // ← ID จากลิงก์ชีตของคุณ
  const ss = SpreadsheetApp.openById(SS_ID);
  const sh = ss.getSheetByName('Students');
  if (!sh) throw new Error('ไม่พบแท็บชื่อ "Students" ในชีตนี้');
  PropertiesService.getScriptProperties().setProperty('TCAS_SS_ID', SS_ID);
  Logger.log('ผูกชีตแล้ว: ' + ss.getName() + ' | จำนวนแถวข้อมูล: ' + (sh.getLastRow() - 1));
}

// ตรวจสอบว่าสคริปต์กำลังอ่านชีตไหน (Run แล้วดูที่ Execution log)
function diagnose() {
  const id = PropertiesService.getScriptProperties().getProperty('TCAS_SS_ID');
  Logger.log('TCAS_SS_ID = ' + id);
  const r = getAllStudents();
  Logger.log('ok=' + r.ok + ' | จำนวนนักเรียน=' + (r.data ? r.data.length : r.error));
}
