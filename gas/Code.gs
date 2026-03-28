// Google Apps Script - School Management Backend
// Paste this code into Google Apps Script (script.google.com)
// Then Deploy > New Deployment > Web App (Execute as: Me, Access: Anyone)

const SPREADSHEET_ID = '1M66ZQLjDfpd8C0DlQf66KwjWWJqBQGpDAXiy0t8RRYY';
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

function doGet(e) {
  const action = e.parameter.action;
  const result = handleAction(action, e.parameter, null);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = e.parameter.action;
  const result = handleAction(action, e.parameter, body);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAction(action, params, body) {
  try {
    switch (action) {
      case 'login':           return login(body);
      case 'register':        return register(body);
      case 'getUsers':        return getUsers();
      case 'getProfile':      return getProfile(body.id);
      case 'updateProfile':   return updateProfile(body);
      case 'deleteUser':      return deleteUser(body.id);
      case 'getClassStats':   return getClassStats();
      case 'getScores':       return getScores(body);
      case 'updateScore':     return updateScore(body);
      case 'importScores':    return importScores(body.records);
      case 'getAnnouncements':return getAnnouncements();
      case 'addAnnouncement': return addAnnouncement(body);
      case 'updateAnnouncement': return updateAnnouncement(body);
      case 'deleteAnnouncement': return deleteAnnouncement(body.id);
      case 'listFiles':       return listFiles(body.folderId);
      case 'deleteFile':      return deleteFile(body.fileId);
      case 'uploadProfilePic': return uploadProfilePic(body);
      default:                return { error: 'Unknown action' };
    }
  } catch(e) {
    return { error: e.message };
  }
}

// ── Auth ──────────────────────────────────────────
function login({ username, password }) {
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    const row = Object.fromEntries(headers.map((h,j) => [h, data[i][j]]));
    if (row.username === username && row.password === password) {
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
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => data[h] || (h === 'id' ? id : ''));
  sheet.appendRow(row);
  return { success: true };
}

// ── Users / Profiles ──────────────────────────────
function getSheetData(sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => Object.fromEntries(headers.map((h,j) => [h, row[j]])));
}

function getUsers() { return getSheetData('Users'); }

function getProfile(id) {
  const users = getSheetData('Users');
  return users.find(u => u.id === id) || null;
}

function updateProfile(data) {
  const sheet = ss.getSheetByName('Users');
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('id');
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === data.id) {
      headers.forEach((h,j) => { if (data[h] !== undefined) sheet.getRange(i+1,j+1).setValue(data[h]); });
      return { success: true };
    }
  }
  return { success: false };
}

function deleteUser(id) {
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = data.length-1; i >= 1; i--) {
    if (data[i][idCol] === id) { sheet.deleteRow(i+1); return { success: true }; }
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
function getScores(filters) {
  let scores = getSheetData('Scores');
  if (filters?.studentId) scores = scores.filter(s => String(s.studentId) === String(filters.studentId));
  if (filters?.class)     scores = scores.filter(s => String(s.class) === String(filters.class));
  if (filters?.term)      scores = scores.filter(s => String(s.term) === String(filters.term));
  if (filters?.year)      scores = scores.filter(s => String(s.year) === String(filters.year));
  return scores;
}

function updateScore({ scoreId, score }) {
  const sheet = ss.getSheetByName('Scores');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  const scoreCol = headers.indexOf('score');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === scoreId) {
      sheet.getRange(i+1, scoreCol+1).setValue(score);
      return { success: true };
    }
  }
  return { success: false };
}

function importScores(records) {
  const sheet = ss.getSheetByName('Scores');
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  records.forEach(r => {
    const id = Utilities.getUuid();
    const row = headers.map(h => h === 'id' ? id : (r[h] || ''));
    sheet.appendRow(row);
  });
  return { success: true, count: records.length };
}

// ── Announcements ─────────────────────────────────
function getAnnouncements() { return getSheetData('Announcements'); }

function addAnnouncement(data) {
  const sheet = ss.getSheetByName('Announcements');
  const id = Utilities.getUuid();
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => h === 'id' ? id : (data[h] !== undefined ? data[h] : ''));
  sheet.appendRow(row);
  return { success: true };
}

function updateAnnouncement(data) {
  const sheet = ss.getSheetByName('Announcements');
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('id');
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === data.id) {
      headers.forEach((h,j) => { if (data[h] !== undefined) sheet.getRange(i+1,j+1).setValue(data[h]); });
      return { success: true };
    }
  }
  return { success: false };
}

function deleteAnnouncement(id) {
  const sheet = ss.getSheetByName('Announcements');
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = data.length-1; i >= 1; i--) {
    if (data[i][idCol] === id) { sheet.deleteRow(i+1); return { success: true }; }
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
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

function uploadProfilePic(body) {
  const { fileName, mimeType, base64Data, oldUrl } = body;

  // Delete old file if exists to save space
  if (oldUrl) {
    try {
      const oldId = extractFileIdFromUrl(oldUrl);
      if (oldId) DriveApp.getFileById(oldId).setTrashed(true);
    } catch(e) {}
  }

  const folderName = 'ProfilePictures';
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  
  const decodedData = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedData, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileId = file.getId();
  const directLink = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';
  
  return { success: true, url: directLink, fileId: fileId };
}

function extractFileIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/id=([^&]+)/);
  return match ? match[1] : null;
}

// ── Setup Helper ──────────────────────────────────
// Run this once to create all sheets with headers
function setupSheets() {
  const sheetsConfig = {
    Users: ['id','username','password','role','name','surname','prefix','gender','idCard','englishName',
      'ethnicity','nationality','religion','birthdate','bloodType','weight','height','specialAbility',
      'class','roomAdvisor','prevSchool','prevProvince','prevGrade','favoriteSubject','leastFavoriteSubject',
      'houseNo','moo','alley','road','subdistrict','district','province','postalCode',
      'homePhone','mobilePhone','email','birthPlace','birthDistrict','birthProvince','hospital',
      'siblings','siblingsInSchool','fatherName','fatherIdCard','fatherOccupation','fatherIncome','fatherPhone','fatherStatus',
      'motherName','motherIdCard','motherOccupation','motherIncome','motherPhone','motherStatus',
      'guardianName','guardianRelation','guardianPhone','profilePic'],
    Scores: ['id','studentId','studentName','class','subject','score','maxScore','term','year','examType','examRound'],
    Announcements: ['id','title','content','date','authorId','pinned'],
    Classes: ['id','name','level','teacherId'],
  };
  Object.entries(sheetsConfig).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  });
  return 'Setup complete!';
}
