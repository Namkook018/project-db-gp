// Saturday Timetable — Google Apps Script Backend
// วิธี deploy:
//  1. ไปที่ script.google.com → New Project
//  2. วาง Code นี้ทั้งหมด
//  3. Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  4. Copy Deployment URL → วางใน saturday_timetable_V2 (ปุ่ม ☁ off)

const PROP_KEY = 'SAT_TIMETABLE_DB';
const MAX_BYTES = 480000; // ~480 KB (PropertiesService limit 500 KB)

function doGet(e) {
  try {
    const store = PropertiesService.getScriptProperties();
    const data  = store.getProperty(PROP_KEY) || '{}';
    return ContentService.createTextOutput(data)
      .setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body = e.postData.contents;
    if (!body) throw new Error('Empty body');
    if (body.length > MAX_BYTES) throw new Error('Data too large (' + body.length + ' bytes)');

    // Validate JSON
    JSON.parse(body);

    const store = PropertiesService.getScriptProperties();
    store.setProperty(PROP_KEY, body);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── ล้างข้อมูลทั้งหมด (รันใน Apps Script editor ถ้าต้องการ reset) ──
function clearDb() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_KEY);
  Logger.log('Cleared.');
}

// ── ดูขนาดข้อมูลปัจจุบัน (รันใน Apps Script editor) ──
function checkSize() {
  const data = PropertiesService.getScriptProperties().getProperty(PROP_KEY) || '';
  Logger.log('Size: ' + data.length + ' / ' + MAX_BYTES + ' bytes');
}
