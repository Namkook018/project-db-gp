import { GAS_URL, USE_MOCK } from './config';
import type { User } from './auth';

// ─────────────────────────────────────────────
// Mock data for offline / demo mode
// ─────────────────────────────────────────────
const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', role: 'admin',   name: 'สมชาย', surname: 'ผู้ดูแล', profilePic: '' },
  { id: '2', username: 'teacher1', role: 'teacher', name: 'วิภา',  surname: 'ครูใจดี', roomAdvisor: 'ม.5/9', profilePic: '' },
  { id: '3', username: 'stu001',   role: 'student', name: 'พลอย',  surname: 'รักเรียน', class: 'ม.5/9', profilePic: '' },
  { id: '4', username: 'stu002',   role: 'student', name: 'ธนาวุธ', surname: 'ขยันดี',  class: 'ม.5/9', profilePic: '' },
  { id: '5', username: 'stu003',   role: 'student', name: 'กานต์',  surname: 'สุขใจ',   class: 'ม.4/9', profilePic: '' },
];

const MOCK_PASSWORDS: Record<string, string> = {
  admin: 'admin1234', teacher1: 'teacher1234',
  stu001: 'student1234', stu002: 'student1234', stu003: 'student1234',
};

export const MOCK_STUDENT_PROFILES: Record<string, StudentProfile> = {
  '3': {
    id: '3', username: 'stu001', role: 'student', name: 'พลอย', surname: 'รักเรียน', class: 'ม.5/9',
    gender: 'หญิง', prefix: 'น.ส.', idCard: '1234567890123', englishName: 'Ploy Reklean',
    ethnicity: 'ไทย', nationality: 'ไทย', religion: 'พุทธ', birthdate: '2007-05-15',
    bloodType: 'A', weight: '52', height: '160', specialAbility: 'วาดภาพ',
    prevSchool: 'โรงเรียนตัวอย่าง', prevProvince: 'กรุงเทพมหานคร', prevGrade: 'ม.3',
    favoriteSubject: 'ภาษาอังกฤษ', leastFavoriteSubject: 'ฟิสิกส์',
    houseNo: '123', moo: '5', alley: 'สุขุมวิท', road: 'สุขุมวิท',
    subdistrict: 'คลองเตย', district: 'คลองเตย', province: 'กรุงเทพมหานคร',
    postalCode: '10110', homePhone: '02-123-4567', mobilePhone: '081-234-5678',
    email: 'ploy@example.com', birthPlace: 'กรุงเทพมหานคร', birthDistrict: 'บางรัก',
    birthProvince: 'กรุงเทพมหานคร', hospital: 'โรงพยาบาลกรุงเทพ',
    siblings: '1', siblingsInSchool: '0',
    fatherName: 'วิชัย รักเรียน', fatherIdCard: '1234567890124',
    fatherOccupation: 'พนักงานบริษัท', fatherIncome: '50000',
    fatherPhone: '081-111-2222', fatherStatus: 'อยู่ด้วยกัน',
    motherName: 'สุดา รักเรียน', motherIdCard: '1234567890125',
    motherOccupation: 'แม่บ้าน', motherIncome: '20000',
    motherPhone: '081-333-4444', motherStatus: 'อยู่ด้วยกัน',
    guardianName: '', guardianRelation: '', guardianPhone: '',
    profilePic: '',
  },
};

const MOCK_ALL_PROFILES: StudentProfile[] = [
  { ...MOCK_STUDENT_PROFILES['3'] },
  { id:'4', username:'stu002', role:'student', name:'ธนาวุธ', surname:'ขยันดี', class:'ม.5/9',
    gender:'ชาย', prefix:'นาย', idCard:'9876543210123', englishName:'Thanawut Khayandee',
    ethnicity:'ไทย', nationality:'ไทย', religion:'พุทธ', birthdate:'2007-08-20',
    bloodType:'B', weight:'65', height:'172', prevSchool:'โรงเรียนตัวอย่าง 2', prevProvince:'นนทบุรี',
    prevGrade:'ม.3', favoriteSubject:'คณิตศาสตร์', leastFavoriteSubject:'ภาษาไทย',
    houseNo:'456', moo:'2', email:'thanawut@ex.com', province:'นนทบุรี',
    specialAbility:'เล่นดนตรี', alley:'', road:'', subdistrict:'บางใหญ่', district:'บางใหญ่',
    postalCode:'11140', homePhone:'', mobilePhone:'082-222-3333', birthPlace:'นนทบุรี',
    birthDistrict:'บางใหญ่', birthProvince:'นนทบุรี', hospital:'โรงพยาบาลนนทบุรี',
    siblings:'2', siblingsInSchool:'0', fatherName:'ประเสริฐ ขยันดี', fatherIdCard:'',
    fatherOccupation:'ค้าขาย', fatherIncome:'60000', fatherPhone:'081-555-6666',
    fatherStatus:'อยู่ด้วยกัน', motherName:'สมจิตร ขยันดี', motherIdCard:'',
    motherOccupation:'พนักงานบริษัท', motherIncome:'45000', motherPhone:'081-777-8888',
    motherStatus:'อยู่ด้วยกัน', guardianName:'', guardianRelation:'', guardianPhone:'', profilePic:'' },
  { id:'5', username:'stu003', role:'student', name:'กานต์', surname:'สุขใจ', class:'ม.4/9',
    gender:'ชาย', prefix:'นาย', idCard:'5555555555555', englishName:'Kan Sukjai',
    ethnicity:'ไทย', nationality:'ไทย', religion:'พุทธ', birthdate:'2007-01-10',
    bloodType:'O', weight:'60', height:'168', prevSchool:'โรงเรียนตัวอย่าง 3', prevProvince:'เชียงใหม่',
    prevGrade:'ม.3', favoriteSubject:'ชีววิทยา', leastFavoriteSubject:'สังคมศึกษา',
    houseNo:'789', moo:'', email:'kan@ex.com', province:'เชียงใหม่',
    specialAbility:'', alley:'', road:'', subdistrict:'สุเทพ', district:'เมือง',
    postalCode:'50200', homePhone:'', mobilePhone:'083-444-5555', birthPlace:'เชียงใหม่',
    birthDistrict:'เมือง', birthProvince:'เชียงใหม่', hospital:'โรงพยาบาลเชียงใหม่',
    siblings:'0', siblingsInSchool:'0', fatherName:'', fatherIdCard:'', fatherOccupation:'',
    fatherIncome:'', fatherPhone:'', fatherStatus:'บิดาถึงแก่กรรม', motherName:'',
    motherIdCard:'', motherOccupation:'', motherIncome:'', motherPhone:'',
    motherStatus:'อยู่ด้วยกัน', guardianName:'สมบูรณ์ สุขใจ', guardianRelation:'ลุง',
    guardianPhone:'085-999-0000', profilePic:'' },
];

const MOCK_SCORES: ScoreRecord[] = [
  { id:'s1', studentId:'3', studentName:'พลอย รักเรียน', class:'ม.5/9', subject:'คณิตศาสตร์', score:78, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s2', studentId:'3', studentName:'พลอย รักเรียน', class:'ม.5/9', subject:'ฟิสิกส์',    score:65, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s3', studentId:'3', studentName:'พลอย รักเรียน', class:'ม.5/9', subject:'เคมี',       score:70, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s4', studentId:'3', studentName:'พลอย รักเรียน', class:'ม.5/9', subject:'ชีววิทยา',   score:88, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s5', studentId:'3', studentName:'พลอย รักเรียน', class:'ม.5/9', subject:'ภาษาอังกฤษ', score:92, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s6', studentId:'3', studentName:'พลอย รักเรียน', class:'ม.5/9', subject:'ภาษาไทย',    score:85, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s7', studentId:'3', studentName:'พลอย รักเรียน', class:'ม.5/9', subject:'สังคมศึกษา', score:80, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s8', studentId:'4', studentName:'ธนาวุธ ขยันดี', class:'ม.5/9', subject:'คณิตศาสตร์', score:90, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s9', studentId:'4', studentName:'ธนาวุธ ขยันดี', class:'ม.5/9', subject:'ฟิสิกส์',    score:82, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s10', studentId:'4', studentName:'ธนาวุธ ขยันดี', class:'ม.5/9', subject:'เคมี',      score:75, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s11', studentId:'4', studentName:'ธนาวุธ ขยันดี', class:'ม.5/9', subject:'ชีววิทยา',  score:68, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s12', studentId:'4', studentName:'ธนาวุธ ขยันดี', class:'ม.5/9', subject:'ภาษาอังกฤษ',score:71, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s13', studentId:'4', studentName:'ธนาวุธ ขยันดี', class:'ม.5/9', subject:'ภาษาไทย',   score:79, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s14', studentId:'4', studentName:'ธนาวุธ ขยันดี', class:'ม.5/9', subject:'สังคมศึกษา',score:84, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s15', studentId:'5', studentName:'กานต์ สุขใจ',  class:'ม.4/9', subject:'คณิตศาสตร์', score:55, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
  { id:'s16', studentId:'5', studentName:'กานต์ สุขใจ',  class:'ม.4/9', subject:'ชีววิทยา',   score:91, maxScore:100, term:'1', year:'2567', examType:'กลางภาค', examRound:'1' },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id:'a1', title:'ยินดีต้อนรับสู่ระบบบริหารจัดการโรงเรียน', content:'ระบบนี้พัฒนาขึ้นเพื่อความสะดวกในการบริหารจัดการข้อมูลนักเรียน ครู และผลการเรียน', date:'2567-03-15', authorId:'1', pinned:true },
  { id:'a2', title:'กำหนดการสอบกลางภาค ภาคเรียนที่ 1/2567', content:'กำหนดการสอบกลางภาคจะมีขึ้นในวันที่ 1-5 กรกฎาคม 2567 ณ ห้องสอบตามที่กำหนด นักเรียนโปรดเตรียมตัวให้พร้อม', date:'2567-03-10', authorId:'1', pinned:false },
  { id:'a3', title:'รับสมัครนักเรียนเพื่อเข้าร่วมค่ายวิทยาศาสตร์', content:'โรงเรียนเปิดรับสมัครนักเรียนชั้น ม.4-5 เพื่อเข้าร่วมค่ายวิทยาศาสตร์ สมัครได้ที่ห้องแนะแนว ภายในวันที่ 31 มีนาคม 2567', date:'2567-03-08', authorId:'1', pinned:false },
];

// ─────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────
export interface StudentProfile extends User {
  prefix?: string; gender?: string; idCard?: string; englishName?: string;
  ethnicity?: string; nationality?: string; religion?: string; birthdate?: string;
  bloodType?: string; weight?: string; height?: string; specialAbility?: string;
  prevSchool?: string; prevProvince?: string; prevGrade?: string;
  favoriteSubject?: string; leastFavoriteSubject?: string;
  houseNo?: string; moo?: string; alley?: string; road?: string;
  subdistrict?: string; district?: string; province?: string; postalCode?: string;
  homePhone?: string; mobilePhone?: string; email?: string;
  birthPlace?: string; birthDistrict?: string; birthProvince?: string; hospital?: string;
  siblings?: string; siblingsInSchool?: string;
  fatherName?: string; fatherIdCard?: string; fatherOccupation?: string;
  fatherIncome?: string; fatherPhone?: string; fatherStatus?: string;
  motherName?: string; motherIdCard?: string; motherOccupation?: string;
  motherIncome?: string; motherPhone?: string; motherStatus?: string;
  guardianName?: string; guardianRelation?: string; guardianPhone?: string;
}

export interface ScoreRecord {
  id: string; studentId: string; studentName: string; class: string;
  subject: string; score: number; maxScore: number;
  term: string; year: string; examType: string; examRound?: string;
}

export interface Announcement {
  id: string; title: string; content: string;
  date: string; authorId: string; pinned: boolean;
}

export interface DriveFile {
  id: string; name: string; mimeType: string; size: string;
  webViewLink: string; downloadUrl: string; createdTime: string;
}

// ─────────────────────────────────────────────
// GAS API helper
// ─────────────────────────────────────────────
async function gasRequest(action: string, data?: Record<string, unknown>) {
  try {
    const url = `${GAS_URL}?action=${action}`;
    const res = await fetch(url, {
      method: data ? 'POST' : 'GET',
      body: data ? JSON.stringify(data) : undefined,
    });
    const json = await res.json();
    if (json && json.error) {
      console.warn(`GAS API Error [${action}]:`, json.error);
      if (['getUsers', 'getScores', 'getAnnouncements', 'listFiles'].includes(action)) return [];
      if (action === 'getClassStats') return {};
      return { success: false, message: json.error };
    }
    return json;
  } catch (err) {
    console.warn('Network or API Error:', err instanceof Error ? err.message : err);
    if (['getUsers', 'getScores', 'getAnnouncements', 'listFiles'].includes(action)) return [];
    if (action === 'getClassStats') return {};
    return { success: false, message: 'การเชื่อมต่อขัดข้อง' };
  }
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export async function apiLogin(username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
  if (USE_MOCK) {
    const found = MOCK_USERS.find(u => u.username === username);
    if (found && MOCK_PASSWORDS[username] === password)
      return { success: true, user: found };
    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  }
  return gasRequest('login', { username, password });
}

export async function apiRegister(data: Record<string, unknown>): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) return { success: true, message: 'ลงทะเบียนสำเร็จ (Demo Mode)' };
  return gasRequest('register', data);
}

export async function apiUploadProfilePic(fileName: string, mimeType: string, base64Data: string, userId?: string, oldUrl?: string): Promise<{ success: boolean; url?: string; error?: string }> {
  if (USE_MOCK) return { success: true, url: 'https://via.placeholder.com/150' };
  return gasRequest('uploadProfilePic', { fileName, mimeType, base64Data, userId, oldUrl });
}

// ─────────────────────────────────────────────
// Users / Profiles
// ─────────────────────────────────────────────
export async function apiGetUsers(): Promise<StudentProfile[]> {
  if (USE_MOCK) return MOCK_ALL_PROFILES;
  return gasRequest('getUsers');
}

export async function apiGetStudentProfile(id: string): Promise<StudentProfile | null> {
  if (USE_MOCK) return MOCK_ALL_PROFILES.find(p => p.id === id) || null;
  return gasRequest('getProfile', { id });
}

export async function apiUpdateProfile(id: string, data: Partial<StudentProfile>): Promise<{ success: boolean }> {
  if (USE_MOCK) return { success: true };
  return gasRequest('updateProfile', { id, ...data });
}

export async function apiDeleteUser(id: string): Promise<{ success: boolean }> {
  if (USE_MOCK) return { success: true };
  return gasRequest('deleteUser', { id });
}

export async function apiGetClassStats(): Promise<Record<string, number>> {
  if (USE_MOCK) {
    const stats: Record<string, number> = {};
    MOCK_ALL_PROFILES.forEach(p => { if (p.class) stats[p.class] = (stats[p.class] || 0) + 1; });
    return stats;
  }
  return gasRequest('getClassStats');
}

// ─────────────────────────────────────────────
// Scores
// ─────────────────────────────────────────────
export async function apiGetScores(filters?: { studentId?: string; class?: string; term?: string; year?: string }): Promise<ScoreRecord[]> {
  if (USE_MOCK) {
    let scores = MOCK_SCORES;
    if (filters?.studentId) scores = scores.filter(s => String(s.studentId) === String(filters.studentId));
    if (filters?.class)     scores = scores.filter(s => String(s.class) === String(filters.class));
    return scores;
  }
  return gasRequest('getScores', filters);
}

export async function apiUpdateScore(scoreId: string, score: number): Promise<{ success: boolean }> {
  if (USE_MOCK) return { success: true };
  return gasRequest('updateScore', { scoreId, score });
}

export async function apiImportScores(records: Omit<ScoreRecord, 'id'>[]): Promise<{ success: boolean; count?: number }> {
  if (USE_MOCK) return { success: true, count: records.length };
  return gasRequest('importScores', { records });
}

// ─────────────────────────────────────────────
// Announcements
// ─────────────────────────────────────────────
export async function apiGetAnnouncements(): Promise<Announcement[]> {
  if (USE_MOCK) return MOCK_ANNOUNCEMENTS;
  return gasRequest('getAnnouncements');
}

export async function apiAddAnnouncement(data: Omit<Announcement, 'id'>): Promise<{ success: boolean }> {
  if (USE_MOCK) return { success: true };
  return gasRequest('addAnnouncement', data as Record<string, unknown>);
}

export async function apiUpdateAnnouncement(id: string, data: Partial<Announcement>): Promise<{ success: boolean }> {
  if (USE_MOCK) return { success: true };
  return gasRequest('updateAnnouncement', { id, ...data });
}

export async function apiDeleteAnnouncement(id: string): Promise<{ success: boolean }> {
  if (USE_MOCK) return { success: true };
  return gasRequest('deleteAnnouncement', { id });
}

// ─────────────────────────────────────────────
// Knowledge Repository (Google Drive)
// ─────────────────────────────────────────────
const MOCK_FILES: DriveFile[] = [
  { id:'f1', name:'แบบฝึกหัดคณิตศาสตร์ ม.5.pdf', mimeType:'application/pdf', size:'2.4 MB', webViewLink:'#', downloadUrl:'#', createdTime:'2567-02-10' },
  { id:'f2', name:'สรุปเนื้อหาฟิสิกส์ บท 1-3.pdf', mimeType:'application/pdf', size:'1.8 MB', webViewLink:'#', downloadUrl:'#', createdTime:'2567-02-08' },
  { id:'f3', name:'ข้อสอบเก่าเคมี 10 ปี.pdf', mimeType:'application/pdf', size:'5.2 MB', webViewLink:'#', downloadUrl:'#', createdTime:'2567-02-01' },
];

export async function apiListFiles(folderId: string): Promise<DriveFile[]> {
  if (USE_MOCK || folderId === 'demo') return MOCK_FILES;
  return gasRequest('listFiles', { folderId });
}

export async function apiDeleteFile(fileId: string): Promise<{ success: boolean }> {
  if (USE_MOCK) return { success: true };
  return gasRequest('deleteFile', { fileId });
}
