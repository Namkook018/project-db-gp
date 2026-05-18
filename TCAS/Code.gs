// ============================================================
//  TCAS Score Manager — Google Apps Script Backend
//  วิธีใช้งาน:
//  1. ไปที่ script.google.com → New Project
//  2. วาง Code.gs และ index.html ลงไป
//  3. Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  4. Copy URL ไปใช้งาน
// ============================================================

const ADMIN_PW = 'tcas2025'; // ← เปลี่ยนรหัสผ่าน Admin ที่นี่

// ── SERVE HTML ───────────────────────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('TCAS Score Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── SPREADSHEET SETUP ────────────────────────────────────────
function _sheet() {
  const p = PropertiesService.getScriptProperties();
  let ssId = p.getProperty('TCAS_SS_ID');

  if (ssId) {
    try {
      const ss = SpreadsheetApp.openById(ssId);
      return ss.getSheetByName('Students') || _setupSheet(ss);
    } catch (_) {}
  }

  // สร้าง Spreadsheet ใหม่
  const ss = SpreadsheetApp.create('TCAS Score Manager — Data');
  p.setProperty('TCAS_SS_ID', ss.getId());
  return _setupSheet(ss);
}

function _setupSheet(ss) {
  let sh = ss.getSheetByName('Students');
  if (!sh) sh = ss.getActiveSheet().setName('Students');

  sh.clearContents();
  const headers = ['id', 'name', 'grade', 'scores', 'nscores', 'created_at', 'updated_at'];
  sh.appendRow(headers);
  sh.setFrozenRows(1);

  const hRange = sh.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
  sh.setColumnWidth(1, 160).setColumnWidth(2, 200).setColumnWidth(3, 80)
    .setColumnWidth(4, 500).setColumnWidth(5, 500)
    .setColumnWidth(6, 180).setColumnWidth(7, 180);

  return sh;
}

// ── GET ALL STUDENTS ─────────────────────────────────────────
function getAllStudents() {
  try {
    const sh   = _sheet();
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
    const sh    = _sheet();
    const vals  = sh.getDataRange().getValues();
    const now   = new Date().toISOString();
    const grade = d.grade || '';
    const sj    = JSON.stringify(d.scores  || {});
    const nj    = JSON.stringify(d.nscores || {});

    // UPDATE existing
    if (d.id) {
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(d.id)) {
          sh.getRange(i + 1, 1, 1, 7)
            .setValues([[d.id, d.name, grade, sj, nj, vals[i][5], now]]);
          return { ok: true, id: d.id };
        }
      }
    }

    // INSERT new
    const id = String(Date.now());
    sh.appendRow([id, d.name, grade, sj, nj, now, now]);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── DELETE STUDENT ───────────────────────────────────────────
function deleteStudent(id) {
  try {
    const sh   = _sheet();
    const vals = sh.getDataRange().getValues();

    for (let i = vals.length - 1; i >= 1; i--) {
      if (String(vals[i][0]) === String(id)) {
        sh.deleteRow(i + 1);
        return { ok: true };
      }
    }
    return { ok: false, error: 'ไม่พบนักเรียน' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── ADMIN AUTH ───────────────────────────────────────────────
function verifyAdmin(pw) {
  return { ok: pw === ADMIN_PW };
}

// ── GET SPREADSHEET URL (for admin reference) ────────────────
function getSheetUrl() {
  try {
    const p    = PropertiesService.getScriptProperties();
    const ssId = p.getProperty('TCAS_SS_ID');
    return { ok: true, url: ssId ? 'https://docs.google.com/spreadsheets/d/' + ssId : null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── UTILS ────────────────────────────────────────────────────
function _parse(str) {
  try { return JSON.parse(str || '{}'); } catch (_) { return {}; }
}
