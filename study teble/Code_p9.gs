// ตารางสอนคาบ 9 — Google Apps Script Backend
// วิธี deploy:
//  1. script.google.com → New Project
//  2. วาง Code นี้ทั้งหมด
//  3. Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  4. Copy Deployment URL → วางในแอป (ปุ่ม ☁ off)

const PROP_KEY = 'P9_TIMETABLE_DB';

function doGet(e) {
  try {
    const data = PropertiesService.getScriptProperties().getProperty(PROP_KEY) || '{}';
    return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body = e.postData.contents;
    if (!body) throw new Error('Empty body');
    if (body.length > 480000) throw new Error('Data too large');
    JSON.parse(body); // validate
    PropertiesService.getScriptProperties().setProperty(PROP_KEY, body);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function clearDb() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_KEY);
  Logger.log('Cleared.');
}
