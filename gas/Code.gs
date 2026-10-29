// Google Apps Script - School Management Backend (v2)
// วางโค้ดนี้ที่ script.google.com แล้ว Deploy > New Deployment > Web App
// (Execute as: Me, Access: Anyone) — ทุกครั้งที่แก้โค้ดต้อง Deploy เป็นเวอร์ชันใหม่
//
// สิ่งที่เปลี่ยนจากเวอร์ชันเดิม
//  1) getScores กรอง examType / examRound ได้ และรองรับทั้ง GET (query string) และ POST
//  2) importScores: แก้บั๊กคะแนน 0 ถูกบันทึกเป็นค่าว่าง, เขียนทีเดียว (เร็วขึ้นมาก),
//     และมีตัวเลือก replace:true ลบคะแนนชุดเดิมของ ปี/ภาคเรียน/ประเภท/ครั้งที่/ห้อง เดียวกันก่อน กันข้อมูลซ้ำ
//  3) getScoreOptions: ส่งรายการ ปี/ภาคเรียน/ประเภทสอบ/ครั้งที่/ห้อง ที่มีในระบบ สำหรับทำ dropdown
//  4) ใช้ LockService กันเขียนชนกันเวลามีหลายคนใช้พร้อมกัน

const SPREADSHEET_ID = '1M66ZQLjDfpd8C0DlQf66KwjWWJqBQGpDAXiy0t8RRYY';
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

// ── Entry points ──────────────────────────────────
function doGet(e) {
  const result = handleAction(e.parameter.action, e.parameter, null);
  return json_(result);
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { body = {}; }
  const result = handleAction(e.parameter.action, e.parameter, body);
  return json_(result);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAction(action, params, body) {
  const b = body || {};
  try {
    switch (action) {
      case 'login':              return login(b);
      case 'register':           return withLock_(() => register(b));
      case 'getUsers':           return getUsers();
      case 'getProfile':         return getProfile(b.id || params.id);
      case 'updateProfile':      return withLock_(() => updateProfile(b));
      case 'deleteUser':         return withLock_(() => deleteUser(b.id));
      case 'getClassStats':      return getClassStats();
      case 'getScores':          return getScores(body || params);
      case 'getScoreOptions':    return getScoreOptions();
      case 'updateScore':        return withLock_(() => updateScore(b));
      case 'importScores':       return withLock_(() => importScores(b.records, b.replace === true));
      case 'getAnnouncements':   return getAnnouncements();
      case 'addAnnouncement':    return withLock_(() => addAnnouncement(b));
      case 'updateAnnouncement': return withLock_(() => updateAnnouncement(b));
      case 'deleteAnnouncement': return withLock_(() => deleteAnnouncement(b.id));
      case 'listFiles':          return listFiles(b.folderId);
      case 'deleteFile':         return deleteFile(b.fileId);
      case 'uploadProfilePic':   return uploadProfilePic(b);
      default:                   return { error: 'Unknown action' };
    }
  } catch (e) {
    return { error: e.message };
  }
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

// ── Auth ──────────────────────────────────────────
function login({ username, password }) {
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    const row = Object.fromEntries(headers.map((h, j) => [h, data[i][j]]));
    if (String(row.username) === String(username) && String(row.password) === String(password)) {
      return { success: true, user: {
        id: row.id, username: row.username, role: row.role,
        name: row.name, surname: row.surname,
        class: row.class || undefined,
        roomAdvisor: row.roomAdvisor || undefined,
        profilePic: row.profilePic || '',
      }};
    }
  }
  return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
}

function register(data) {
  const sheet = ss.getSheetByName('Users');
  const id = Utilities.getUuid();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => data[h] || (h === 'id' ? id : ''));
  sheet.appendRow(row);

  // บังคับ username / password เป็นข้อความ ไม่ให้ Sheets แปลงเป็นตัวเลข
  const newRow = sheet.getLastRow();
  const usernameCol = headers.indexOf('username') + 1;
  const passwordCol = headers.indexOf('password') + 1;
  if (usernameCol > 0) sheet.getRange(newRow, usernameCol).setNumberFormat('@STRING@');
  if (passwordCol > 0) sheet.getRange(newRow, passwordCol).setNumberFormat('@STRING@');

  return { success: true };
}

// ── Users / Profiles ──────────────────────────────
// ฟิลด์ที่ต้องส่งกลับเป็นข้อความเสมอ
const TEXT_FIELDS = new Set([
  'username', 'password', 'idCard',
  'homePhone', 'mobilePhone', 'fatherPhone', 'motherPhone', 'guardianPhone',
  'fatherIdCard', 'motherIdCard',
  'postalCode', 'birthPlace', 'siblings', 'siblingsInSchool',
  'studentId', 'class', 'term', 'year', 'examRound', 'examType',
]);

function getSheetData(sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row =>
    Object.fromEntries(headers.map((h, j) => [h, TEXT_FIELDS.has(h) ? String(row[j]) : row[j]]))
  );
}

function getUsers() { return getSheetData('Users'); }

function getProfile(id) {
  const users = getSheetData('Users');
  return users.find(u => u.id === id) || null;
}

function updateProfile(data) {
  const sheet = ss.getSheetByName('Users');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('id');
  const picCol = headers.indexOf('profilePic');
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === data.id) {
      // ลบไฟล์รูปเก่าใน Drive เมื่อ URL รูปเปลี่ยน
      if (data.profilePic !== undefined && picCol >= 0) {
        const oldPic = allData[i][picCol];
        if (oldPic && oldPic !== data.profilePic) {
          try {
            const oldId = extractFileIdFromUrl(String(oldPic));
            if (oldId) DriveApp.getFileById(oldId).setTrashed(true);
          } catch (e) {
            Logger.log('updateProfile: could not delete old pic: ' + e.message);
          }
        }
      }
      headers.forEach((h, j) => {
        if (data[h] !== undefined) sheet.getRange(i + 1, j + 1).setValue(data[h]);
      });
      return { success: true };
    }
  }
  return { success: false };
}

function deleteUser(id) {
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][idCol] === id) { sheet.deleteRow(i + 1); return { success: true }; }
  }
  return { success: false };
}

function getClassStats() {
  const users = getSheetData('Users');
  const stats = {};
  users.filter(u => u.role === 'student' && u.class).forEach(u => {
    stats[u.class] = (stats[u.class] || 0) + 1;
  });
  return stats;
}

// ── Scores ────────────────────────────────────────
// filters: studentId, class, term, year, examType, examRound (ใส่เฉพาะที่ต้องการกรอง)
function getScores(filters) {
  let scores = getSheetData('Scores');
  const f = filters || {};
  const has = k => f[k] !== undefined && f[k] !== null && f[k] !== '' && f[k] !== '*';
  ['studentId', 'class', 'term', 'year', 'examType', 'examRound'].forEach(k => {
    if (has(k)) scores = scores.filter(s => String(s[k]) === String(f[k]));
  });
  return scores;
}

// รายการตัวเลือกที่มีอยู่จริงในชีต Scores สำหรับทำ dropdown
function getScoreOptions() {
  const scores = getSheetData('Scores');
  const uniq = k => [...new Set(scores.map(s => String(s[k])).filter(v => v !== ''))]
    .sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));
  return {
    years: uniq('year'),
    terms: uniq('term'),
    examTypes: uniq('examType'),
    examRounds: uniq('examRound'),
    classes: uniq('class'),
  };
}

function updateScore({ scoreId, score }) {
  const sheet = ss.getSheetByName('Scores');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  const scoreCol = headers.indexOf('score');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === scoreId) {
      sheet.getRange(i + 1, scoreCol + 1).setValue(score);
      return { success: true };
    }
  }
  return { success: false };
}

// records: [{studentId, studentName, class, subject, score, maxScore, term, year, examType, examRound}, ...]
// replace=true: ลบคะแนนเดิมของ ปี|ภาคเรียน|ประเภท|ครั้งที่|ห้อง เดียวกับที่นำเข้า ก่อนเพิ่มใหม่ (กันข้อมูลซ้ำ)
function importScores(records, replace) {
  if (!Array.isArray(records) || records.length === 0) return { success: false, message: 'ไม่มีข้อมูล' };

  const sheet = ss.getSheetByName('Scores');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const keyOf = (y, t, ty, r, c) => [y, t, ty, r, c].map(v => String(v)).join('|');

  let removed = 0;
  if (replace) {
    const keys = new Set(records.map(r => keyOf(r.year, r.term, r.examType, r.examRound, r.class)));
    const all = sheet.getDataRange().getValues();
    const keep = all.slice(1).filter(row =>
      !keys.has(keyOf(row[idx.year], row[idx.term], row[idx.examType], row[idx.examRound], row[idx.class])));
    removed = all.length - 1 - keep.length;
    if (removed > 0) {
      if (all.length > 1) sheet.getRange(2, 1, all.length - 1, headers.length).clearContent();
      if (keep.length) sheet.getRange(2, 1, keep.length, headers.length).setValues(keep);
    }
  }

  // คะแนน 0 ต้องเก็บเป็น 0 (ของเดิมใช้ || ทำให้ 0 กลายเป็นค่าว่าง)
  const rows = records.map(r => headers.map(h => {
    if (h === 'id') return Utilities.getUuid();
    return (r[h] !== undefined && r[h] !== null) ? r[h] : '';
  }));

  const start = sheet.getLastRow() + 1;
  sheet.getRange(start, 1, rows.length, headers.length).setValues(rows);
  return { success: true, count: rows.length, removed: removed };
}

// ── Announcements ─────────────────────────────────
function getAnnouncements() { return getSheetData('Announcements'); }

function addAnnouncement(data) {
  const sheet = ss.getSheetByName('Announcements');
  const id = Utilities.getUuid();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => h === 'id' ? id : (data[h] !== undefined ? data[h] : ''));
  sheet.appendRow(row);
  return { success: true };
}

function updateAnnouncement(data) {
  const sheet = ss.getSheetByName('Announcements');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('id');
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === data.id) {
      headers.forEach((h, j) => {
        if (data[h] !== undefined) sheet.getRange(i + 1, j + 1).setValue(data[h]);
      });
      return { success: true };
    }
  }
  return { success: false };
}

function deleteAnnouncement(id) {
  const sheet = ss.getSheetByName('Announcements');
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][idCol] === id) { sheet.deleteRow(i + 1); return { success: true }; }
  }
  return { success: false };
}

// ── Google Drive ──────────────────────────────────
function listFiles(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const result = [];
  while (files.hasNext()) {
    const f = files.next();
    result.push({
      id: f.getId(),
      name: f.getName(),
      mimeType: f.getMimeType(),
      size: formatSize(f.getSize()),
      webViewLink: f.getUrl(),
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + f.getId(),
      createdTime: Utilities.formatDate(f.getDateCreated(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    });
  }
  return result;
}

function deleteFile(fileId) {
  DriveApp.getFileById(fileId).setTrashed(true);
  return { success: true };
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function uploadProfilePic(body) {
  const { fileName, mimeType, base64Data, userId, oldUrl } = body;

  const folderName = 'ProfilePictures';
  const folders = DriveApp.getFoldersByName(folderName);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

  const decodedData = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedData, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();
  const newUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';

  if (userId) {
    // อ่าน URL เก่าจาก Sheet, ลบไฟล์เก่า แล้วอัปเดต Sheet
    const sheet = ss.getSheetByName('Users');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const allData = sheet.getDataRange().getValues();
    const idCol = headers.indexOf('id');
    const picCol = headers.indexOf('profilePic');
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idCol] === userId) {
        const sheetOldUrl = String(allData[i][picCol] || '');
        if (sheetOldUrl && sheetOldUrl !== newUrl) {
          try {
            const oldId = extractFileIdFromUrl(sheetOldUrl);
            if (oldId) DriveApp.getFileById(oldId).setTrashed(true);
          } catch (e) {
            Logger.log('uploadProfilePic: could not delete old pic: ' + e.message);
          }
        }
        if (picCol >= 0) sheet.getRange(i + 1, picCol + 1).setValue(newUrl);
        break;
      }
    }
  } else if (oldUrl) {
    // ตอนสมัครสมาชิก (ยังไม่มี userId): ใช้ oldUrl จาก client
    try {
      const oldId = extractFileIdFromUrl(String(oldUrl));
      if (oldId && oldUrl !== newUrl) DriveApp.getFileById(oldId).setTrashed(true);
    } catch (e) {
      Logger.log('uploadProfilePic (register): could not delete old pic: ' + e.message);
    }
  }

  return { success: true, url: newUrl, fileId: fileId };
}

function extractFileIdFromUrl(url) {
  if (!url || !url.includes('drive.google.com')) return null;
  // รองรับ: .../thumbnail?id=FILE_ID&sz=w1000  และ  .../file/d/FILE_ID/view
  const match = url.match(/(?:\/d\/|[?&]id=)([\w-]{25,})/);
  return match ? match[1] : null;
}

// ── Setup Helper ──────────────────────────────────
// รันครั้งเดียวเพื่อสร้างชีตและหัวคอลัมน์ทั้งหมด
function setupSheets() {
  const sheetsConfig = {
    Users: ['id', 'username', 'password', 'role', 'name', 'surname', 'prefix', 'gender', 'idCard', 'englishName',
      'ethnicity', 'nationality', 'religion', 'birthdate', 'bloodType', 'weight', 'height', 'specialAbility',
      'class', 'roomAdvisor', 'prevSchool', 'prevProvince', 'prevGrade', 'favoriteSubject', 'leastFavoriteSubject',
      'houseNo', 'moo', 'alley', 'road', 'subdistrict', 'district', 'province', 'postalCode',
      'homePhone', 'mobilePhone', 'email', 'birthPlace', 'birthDistrict', 'birthProvince', 'hospital',
      'siblings', 'siblingsInSchool', 'fatherName', 'fatherIdCard', 'fatherOccupation', 'fatherIncome', 'fatherPhone', 'fatherStatus',
      'motherName', 'motherIdCard', 'motherOccupation', 'motherIncome', 'motherPhone', 'motherStatus',
      'guardianName', 'guardianRelation', 'guardianPhone', 'profilePic'],
    Scores: ['id', 'studentId', 'studentName', 'class', 'subject', 'score', 'maxScore', 'term', 'year', 'examType', 'examRound'],
    Announcements: ['id', 'title', 'content', 'date', 'authorId', 'pinned'],
    Classes: ['id', 'name', 'level', 'teacherId'],
  };
  Object.entries(sheetsConfig).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  });
  return 'Setup complete!';
}
