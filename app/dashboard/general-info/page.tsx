'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, type User } from '../../lib/auth';
import { apiGetUsers, apiGetStudentProfile, apiUpdateProfile, apiDeleteUser, apiUploadProfilePic, type StudentProfile } from '../../lib/api';
import { getDirectImageUrl } from '../../lib/utils';

const SECTION_BG = '#f9fafb';

// ── Format Helpers ────────────────────────────────────────────
function formatDate(val: string) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Field Component ───────────────────────────────────────────
const F = ({ label, k, edit, readonly, options, form, profile, set, type }: {
  label: string; k: string; edit: boolean; readonly?: boolean; options?: string[];
  form: StudentProfile; profile: StudentProfile; set: (k: string, v: string) => void;
  type?: string;
}) => {
  const raw = edit ? ((form as unknown) as Record<string,string>)[k] : ((profile as unknown) as Record<string,string>)[k];
  const displayVal = k === 'birthdate' && !edit ? formatDate(raw) : (raw || '—');
  return (
    <div>
      <label className="form-label" style={{ fontSize:11 }}>{label}</label>
      {edit && !readonly ? (
        options ? (
          <select className="form-input" style={{ padding:'6px 10px', fontSize:13 }} value={((form as unknown) as Record<string,string>)[k]||''} onChange={e => set(k, e.target.value)}>
            <option value="">-- เลือก --</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type||'text'} className="form-input" style={{ padding:'6px 10px', fontSize:13 }} value={((form as unknown) as Record<string,string>)[k]||''} onChange={e => set(k, e.target.value)} />
        )
      ) : (
        <div style={{ fontSize:13, color:'#374151', padding:'5px 0', borderBottom:'1px solid #f3f4f6', minHeight:24 }}>
          {displayVal}
        </div>
      )}
    </div>
  );
};

// ── Upload Button ─────────────────────────────────────────────
const UploadButton = ({ onUpload, loading }: { onUpload: (file: File) => void; loading: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}>
      {loading ? '⌛ อัปโหลด...' : <><span style={{fontSize:16}}>🖼️</span> เปลี่ยนรูปโปรไฟล์</>}
      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={loading} onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </label>
  </div>
);

// ── PDF Print ────────────────────────────────────────────────
function handlePrint(profile: StudentProfile) {
  const p = profile as unknown as Record<string, string>;
  const val = (k: string) => p[k] || '—';
  const dateVal = (k: string) => { const v = p[k]; if (!v) return '—'; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' }); };
  const row = (label: string, k: string, isDate = false) =>
    `<tr><td class="lbl">${label}</td><td>${isDate ? dateVal(k) : val(k)}</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8">
<title>ข้อมูลนักเรียน — ${val('prefix')} ${val('name')} ${val('surname')}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Sarabun',sans-serif;font-size:13px;color:#111;background:#fff;padding:24px 32px}
  h1{font-size:18px;font-weight:700;color:#1e1b4b;margin-bottom:4px}
  .sub{font-size:12px;color:#6b7280;margin-bottom:20px}
  .header{display:flex;align-items:center;gap:20px;padding:16px;background:#4f46e5;border-radius:10px;margin-bottom:20px}
  .avatar{width:70px;height:70px;border-radius:10px;object-fit:cover;border:3px solid rgba(255,255,255,0.4)}
  .avatar-placeholder{width:70px;height:70px;border-radius:10px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;border:3px solid rgba(255,255,255,0.4)}
  .hname{color:#fff;font-size:18px;font-weight:700}
  .hsub{color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px}
  .section{margin-bottom:16px}
  .sec-title{font-size:11px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #e0e7ff}
  table{width:100%;border-collapse:collapse}
  tr:nth-child(even){background:#f8faff}
  td{padding:5px 8px;font-size:12px;vertical-align:top}
  td.lbl{font-weight:600;color:#374151;width:38%;white-space:nowrap}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
  .three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 16px}
  @media print{body{padding:12px 20px}button{display:none!important}}
</style>
</head><body>
<div class="header">
  ${getDirectImageUrl(p['profilePic'])
    ? `<img class="avatar" src="${getDirectImageUrl(p['profilePic'])}" alt="" />`
    : `<div class="avatar-placeholder">${(p['name']||'?').charAt(0)}</div>`}
  <div>
    <div class="hname">${val('prefix')} ${val('name')} ${val('surname')}</div>
    <div class="hsub">ชั้น ${val('class')} &nbsp;•&nbsp; รหัส ${val('username')} &nbsp;•&nbsp; ${val('englishName')}</div>
  </div>
</div>

<div class="section"><div class="sec-title">ข้อมูลส่วนตัว</div>
<div class="three-col">
<table>
${row('คำนำหน้า','prefix')}${row('ชื่อ','name')}${row('นามสกุล','surname')}${row('เพศ','gender')}${row('ชั้นเรียน','class')}
</table>
<table>
${row('วันเกิด','birthdate',true)}${row('เชื้อชาติ','ethnicity')}${row('สัญชาติ','nationality')}${row('ศาสนา','religion')}${row('หมู่เลือด','bloodType')}
</table>
<table>
${row('น้ำหนัก (กก.)','weight')}${row('ส่วนสูง (ซม.)','height')}${row('เลขบัตรประชาชน','idCard')}${row('ความสามารถพิเศษ','specialAbility')}
</table>
</div></div>

<div class="section"><div class="sec-title">สถานที่เกิดและข้อมูลสุขภาพ</div>
<div class="two-col">
<table>
${row('สถานที่เกิด','birthPlace')}${row('อำเภอเกิด','birthDistrict')}${row('จังหวัดเกิด','birthProvince')}
</table>
<table>
${row('โรงพยาบาลที่เกิด','hospital')}${row('จำนวนพี่น้อง','siblings')}${row('พี่น้องในโรงเรียน','siblingsInSchool')}
</table>
</div></div>

<div class="section"><div class="sec-title">ที่อยู่และการติดต่อ</div>
<div class="two-col">
<table>
${row('บ้านเลขที่','houseNo')}${row('หมู่ที่','moo')}${row('ซอย','alley')}${row('ถนน','road')}${row('ตำบล/แขวง','subdistrict')}
</table>
<table>
${row('อำเภอ/เขต','district')}${row('จังหวัด','province')}${row('รหัสไปรษณีย์','postalCode')}${row('โทรศัพท์บ้าน','homePhone')}${row('โทรศัพท์มือถือ','mobilePhone')}${row('อีเมล','email')}
</table>
</div></div>

<div class="section"><div class="sec-title">การศึกษา</div>
<table>
${row('โรงเรียนเดิม','prevSchool')}${row('จังหวัด','prevProvince')}${row('ชั้นสุดท้าย','prevGrade')}${row('วิชาที่ชอบ','favoriteSubject')}${row('วิชาที่ไม่ชอบ','leastFavoriteSubject')}
</table></div>

<div class="section"><div class="sec-title">ข้อมูลบิดา</div>
<div class="two-col">
<table>
${row('ชื่อบิดา','fatherName')}${row('เลขบัตรประชาชน','fatherIdCard')}${row('อาชีพ','fatherOccupation')}
</table>
<table>
${row('รายได้ต่อปี','fatherIncome')}${row('โทรศัพท์','fatherPhone')}${row('สถานภาพ','fatherStatus')}
</table>
</div></div>

<div class="section"><div class="sec-title">ข้อมูลมารดา</div>
<div class="two-col">
<table>
${row('ชื่อมารดา','motherName')}${row('เลขบัตรประชาชน','motherIdCard')}${row('อาชีพ','motherOccupation')}
</table>
<table>
${row('รายได้ต่อปี','motherIncome')}${row('โทรศัพท์','motherPhone')}${row('สถานภาพ','motherStatus')}
</table>
</div></div>

<div class="section"><div class="sec-title">ข้อมูลผู้ปกครอง</div>
<table>
${row('ชื่อผู้ปกครอง','guardianName')}${row('ความสัมพันธ์','guardianRelation')}${row('โทรศัพท์','guardianPhone')}
</table></div>

<div style="margin-top:24px;text-align:center;font-size:11px;color:#9ca3af">พิมพ์จากระบบ CPR Gifted Program Database</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

// ── Profile Modal ─────────────────────────────────────────────
function ProfileDetailModal({ profile, onClose, onSave, viewerRole, currentUser, updateUser, loadUsers }: {
  profile: StudentProfile; onClose: () => void;
  onSave: (data: Partial<StudentProfile>) => void; viewerRole: string;
  currentUser: User | null; updateUser: (data: Partial<User>) => void; loadUsers: (silent?: boolean) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({...profile});
  const [uploading, setUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}));

  const handleSetUrl = async (url: string) => {
    set('profilePic', url);
    const result = await apiUpdateProfile(profile.id, { profilePic: url });
    if (!result?.success) { alert('⚠️ ไม่สามารถบันทึกรูปโปรไฟล์ได้'); return; }
    if (profile.id === currentUser?.id) updateUser({ profilePic: url });
    loadUsers(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true); setUploadFailed(false);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const res = await apiUploadProfilePic(file.name, file.type, base64Data, profile.id);
      if (res.success && res.url) {
        set('profilePic', res.url);
        if (profile.id === currentUser?.id) updateUser({ profilePic: res.url });
        loadUsers(true); setUploadFailed(false);
      } else {
        alert('อัปโหลดล้มเหลว: ' + ((res as { message?: string }).message || 'ไม่ทราบสาเหตุ'));
        setUploadFailed(true);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const isStudent = profile.role === 'student';
  const fProps = { edit, form, profile, set };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:720, padding:0 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#6366f1)', padding:'24px 28px', borderRadius:'20px 20px 0 0', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
              <div className={`avatar ${!getDirectImageUrl(edit ? form.profilePic : profile.profilePic) ? 'avatar-placeholder' : ''} avatar-lg`}
                style={{ borderRadius:16, fontSize:28, fontWeight:800, border:'3px solid rgba(255,255,255,0.3)', overflow:'hidden' }}>
                {getDirectImageUrl(edit ? form.profilePic : profile.profilePic) ? (
                  <img src={getDirectImageUrl(edit ? form.profilePic : profile.profilePic)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (profile.name ? String(profile.name).charAt(0) : '?')}
              </div>
              {edit && (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <UploadButton onUpload={handleFileUpload} loading={uploading} />
                  <button onClick={async () => { const url = prompt('กรอกลิงก์รูปโปรไฟล์ใหม่:', form.profilePic || ''); if (url !== null) await handleSetUrl(url); }}
                    style={{ background:'none', border:'none', padding:0, color:'rgba(255,255,255,0.8)', fontSize:10, textDecoration:'underline', cursor:'pointer' }}>
                    หรือแนบลิงก์ URL
                  </button>
                </div>
              )}
            </div>
            <div style={{ flex:1 }}>
              <h3 style={{ color:'#fff', fontWeight:800, fontSize:18 }}>{profile.prefix} {profile.name} {profile.surname}</h3>
              <div style={{ color:'rgba(255,255,255,0.8)', fontSize:13, marginTop:2 }}>
                {isStudent ? `ชั้น ${profile.class || '—'}` : `ตำแหน่ง: ${profile.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ครู'}`} • {profile.englishName || ''}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ position:'absolute', right:16, top:16, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#fff', fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:24, maxHeight:'65vh', overflowY:'auto' }}>
          {/* TEACHER / ADMIN */}
          {!isStudent && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>ข้อมูลบุคลากร</div>
              <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <F {...fProps} label="คำนำหน้า" k="prefix" options={['นาย','นาง','น.ส.','ดร.','ศ.']} />
                <F {...fProps} label="ชื่อ" k="name" />
                <F {...fProps} label="นามสกุล" k="surname" />
                <F {...fProps} label="ชื่อภาษาอังกฤษ" k="englishName" />
                <F {...fProps} label="สอนรายวิชา" k="favoriteSubject" />
                <F {...fProps} label="ที่ปรึกษาชั้น" k="roomAdvisor" />
                <F {...fProps} label="อีเมล" k="email" />
              </div>
            </div>
          )}

          {/* STUDENT */}
          {isStudent && (<>
            {/* ข้อมูลส่วนตัว */}
            <Section title="ข้อมูลส่วนตัว">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F {...fProps} label="รหัสประจำตัว" k="username" readonly />
                <F {...fProps} label="คำนำหน้า" k="prefix" options={['ด.ช.','ด.ญ.','นาย','น.ส.','นาง']} />
                <F {...fProps} label="ชื่อ" k="name" />
                <F {...fProps} label="นามสกุล" k="surname" />
                <F {...fProps} label="ชื่อภาษาอังกฤษ" k="englishName" />
                <F {...fProps} label="ชั้นเรียน" k="class" readonly={viewerRole === 'student'} />
                <F {...fProps} label="หมายเลขบัตรประชาชน" k="idCard" />
                <F {...fProps} label="เพศ" k="gender" options={['ชาย','หญิง','อื่นๆ']} />
                <F {...fProps} label="วันเกิด" k="birthdate" type="date" />
                <F {...fProps} label="เชื้อชาติ" k="ethnicity" />
                <F {...fProps} label="สัญชาติ" k="nationality" />
                <F {...fProps} label="ศาสนา" k="religion" options={['พุทธ','คริสต์','อิสลาม','ฮินดู','อื่นๆ']} />
                <F {...fProps} label="น้ำหนัก (กก.)" k="weight" type="number" />
                <F {...fProps} label="ส่วนสูง (ซม.)" k="height" type="number" />
                <F {...fProps} label="หมู่เลือด" k="bloodType" options={['A','B','AB','O','ไม่ทราบ']} />
                <F {...fProps} label="ความสามารถพิเศษ" k="specialAbility" />
              </div>
            </Section>

            {/* สถานที่เกิด */}
            <Section title="สถานที่เกิดและสุขภาพ">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F {...fProps} label="สถานที่เกิด" k="birthPlace" />
                <F {...fProps} label="อำเภอที่เกิด" k="birthDistrict" />
                <F {...fProps} label="จังหวัดที่เกิด" k="birthProvince" />
                <F {...fProps} label="โรงพยาบาลที่เกิด" k="hospital" />
                <F {...fProps} label="จำนวนพี่น้อง" k="siblings" type="number" />
                <F {...fProps} label="พี่น้องที่เรียนในโรงเรียนเดียวกัน" k="siblingsInSchool" type="number" />
              </div>
            </Section>

            {/* ที่อยู่ */}
            <Section title="ที่อยู่และการติดต่อ">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F {...fProps} label="บ้านเลขที่" k="houseNo" />
                <F {...fProps} label="หมู่ที่" k="moo" />
                <F {...fProps} label="ซอย" k="alley" />
                <F {...fProps} label="ถนน" k="road" />
                <F {...fProps} label="ตำบล/แขวง" k="subdistrict" />
                <F {...fProps} label="อำเภอ/เขต" k="district" />
                <F {...fProps} label="จังหวัด" k="province" />
                <F {...fProps} label="รหัสไปรษณีย์" k="postalCode" />
                <F {...fProps} label="โทรศัพท์บ้าน" k="homePhone" />
                <F {...fProps} label="โทรศัพท์มือถือ" k="mobilePhone" />
                <F {...fProps} label="อีเมล" k="email" />
              </div>
            </Section>

            {/* การศึกษา */}
            <Section title="ประวัติการศึกษา">
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12 }}>
                <F {...fProps} label="โรงเรียนเดิม" k="prevSchool" />
                <F {...fProps} label="จังหวัด" k="prevProvince" />
                <F {...fProps} label="ชั้นสุดท้าย" k="prevGrade" />
                <F {...fProps} label="วิชาที่ชอบ" k="favoriteSubject" />
                <F {...fProps} label="วิชาที่ไม่ชอบ" k="leastFavoriteSubject" />
              </div>
            </Section>

            {/* บิดา */}
            <Section title="ข้อมูลบิดา">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F {...fProps} label="ชื่อบิดา" k="fatherName" />
                <F {...fProps} label="เลขบัตรประชาชน" k="fatherIdCard" />
                <F {...fProps} label="อาชีพ" k="fatherOccupation" />
                <F {...fProps} label="รายได้ต่อปี (บาท)" k="fatherIncome" type="number" />
                <F {...fProps} label="โทรศัพท์" k="fatherPhone" />
                <F {...fProps} label="สถานภาพ" k="fatherStatus" options={['มีชีวิต','เสียชีวิต','หย่าร้าง','ไม่ทราบ']} />
              </div>
            </Section>

            {/* มารดา */}
            <Section title="ข้อมูลมารดา">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F {...fProps} label="ชื่อมารดา" k="motherName" />
                <F {...fProps} label="เลขบัตรประชาชน" k="motherIdCard" />
                <F {...fProps} label="อาชีพ" k="motherOccupation" />
                <F {...fProps} label="รายได้ต่อปี (บาท)" k="motherIncome" type="number" />
                <F {...fProps} label="โทรศัพท์" k="motherPhone" />
                <F {...fProps} label="สถานภาพ" k="motherStatus" options={['มีชีวิต','เสียชีวิต','หย่าร้าง','ไม่ทราบ']} />
              </div>
            </Section>

            {/* ผู้ปกครอง */}
            <Section title="ข้อมูลผู้ปกครอง">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F {...fProps} label="ชื่อผู้ปกครอง" k="guardianName" />
                <F {...fProps} label="ความสัมพันธ์" k="guardianRelation" />
                <F {...fProps} label="โทรศัพท์" k="guardianPhone" />
              </div>
            </Section>
          </>)}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid #f3f4f6', display:'flex', gap:10, justifyContent:'flex-end', flexWrap:'wrap' }}>
          {isStudent && !edit && (
            <button className="btn-secondary" style={{ background:'#f0fdf4', color:'#166534', borderColor:'#bbf7d0' }}
              onClick={() => handlePrint(profile)}>
              📄 บันทึกเป็น PDF
            </button>
          )}
          {edit ? (
            <>
              <button className="btn-secondary" onClick={() => setEdit(false)}>ยกเลิก</button>
              <button className="btn-primary" onClick={() => { onSave(form); setEdit(false); }} disabled={uploading || uploadFailed}>
                {uploading ? '⌛ กำลังอัปโหลด...' : uploadFailed ? '❌ อัปโหลดล้มเหลว' : '💾 บันทึก'}
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setEdit(true)}>✏️ แก้ไขข้อมูล</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section Wrapper ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ height:2, width:16, background:'#6366f1', borderRadius:2 }} />
        {title}
      </div>
      <div style={{ background:SECTION_BG, borderRadius:12, padding:16 }}>
        {children}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function GeneralInfoPage() {
  const { user, updateUser } = useAuth();
  const [users, setUsers] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudentProfile | null>(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const canEditList = user?.role === 'admin';

  const loadUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const all = await apiGetUsers();
    let filtered = all;
    if (user?.role === 'teacher') filtered = all.filter(u => u.class === user.roomAdvisor || u.id === user.id);
    if (user?.role === 'student') filtered = all.filter(u => u.id === user.id);
    setUsers(filtered);
    if (!silent) setLoading(false);
  }, [user]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleViewDetail = async (u: StudentProfile) => {
    const full = await apiGetStudentProfile(u.id);
    setSelected(full || u);
  };

  const handleSave = async (data: Partial<StudentProfile>) => {
    if (!selected) return;
    await apiUpdateProfile(selected.id, data);
    if (selected.id === user?.id) updateUser(data);
    setSelected(null); loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบผู้ใช้?')) return;
    await apiDeleteUser(id); loadUsers();
  };

  const classes = [...new Set(users.map(u => u.class).filter(Boolean))] as string[];
  const filteredUsers = users.filter(u => {
    const matchSearch = !search || `${u.name} ${u.surname} ${u.username}`.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || u.class === filterClass;
    return matchSearch && matchClass;
  });

  // Student: ดูข้อมูลตัวเอง
  if (user?.role === 'student' && users.length > 0) {
    const me = users[0];
    return (
      <div className="page-wrapper">
        <h1 className="page-title">ข้อมูลส่วนตัว</h1>
        <p className="page-subtitle">ข้อมูลของคุณในระบบ</p>
        <div style={{ maxWidth:700 }}>
          <div className="section-card animate-fadeInUp">
            <div style={{ background:'linear-gradient(135deg,#4f46e5,#6366f1)', padding:'28px 32px', borderRadius:'16px 16px 0 0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <div className={`avatar ${!getDirectImageUrl(me.profilePic) ? 'avatar-placeholder' : ''} avatar-lg`}
                  style={{ borderRadius:20, fontSize:32, fontWeight:800, border:'3px solid rgba(255,255,255,0.3)', overflow:'hidden' }}>
                  {getDirectImageUrl(me.profilePic) ? (
                    <img src={getDirectImageUrl(me.profilePic)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (me.name ? String(me.name).charAt(0) : '?')}
                </div>
                <div>
                  <h2 style={{ color:'#fff', fontWeight:800, fontSize:22 }}>{me.prefix} {me.name} {me.surname}</h2>
                  <div style={{ color:'rgba(255,255,255,0.8)', marginTop:4, fontSize:14 }}>
                    ชั้น {me.class} • <span className="badge badge-student">{me.username}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding:24, display:'flex', gap:10 }}>
              <button className="btn-primary" onClick={() => handleViewDetail(me)}>✏️ ดู/แก้ไขข้อมูลทั้งหมด</button>
              <button className="btn-secondary" style={{ background:'#f0fdf4', color:'#166534', borderColor:'#bbf7d0' }} onClick={() => handlePrint(me)}>📄 บันทึกเป็น PDF</button>
            </div>
          </div>
        </div>
        {selected && (
          <ProfileDetailModal profile={selected} onClose={() => setSelected(null)} onSave={handleSave}
            viewerRole={user?.role || 'student'} currentUser={user} updateUser={updateUser} loadUsers={loadUsers} />
        )}
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom:20 }}>
        <h1 className="page-title">ข้อมูลทั่วไป</h1>
        <p className="page-subtitle">
          {user?.role === 'teacher' ? `ข้อมูลนักเรียนในห้อง ${user.roomAdvisor}` : 'จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ'}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        <input className="form-input" style={{ maxWidth:280 }} placeholder="🔍 ค้นหาชื่อ / รหัสนักเรียน..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {classes.length > 1 && (
          <select className="form-input" style={{ maxWidth:160 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">ทุกห้อง</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#6b7280', fontWeight:600 }}>
          พบ {filteredUsers.length} รายการ
        </div>
      </div>

      <div className="section-card animate-fadeInUp">
        {loading ? (
          <div style={{ padding:40, textAlign:'center' }}><span className="spinner" style={{ width:32, height:32 }} /></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>ชื่อ-นามสกุล</th><th>ชั้นเรียน</th>
                  <th>เพศ</th><th>โทรศัพท์</th><th>อีเมล</th><th>Role</th><th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} onClick={() => handleViewDetail(u)}>
                    <td style={{ color:'#9ca3af', fontSize:12 }}>{i+1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className={`avatar ${!getDirectImageUrl(u.profilePic) ? 'avatar-placeholder' : ''}`}
                          style={{ fontSize:14, fontWeight:700, flexShrink:0, overflow:'hidden' }}>
                          {getDirectImageUrl(u.profilePic) ? (
                            <img src={getDirectImageUrl(u.profilePic)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          ) : (u.name ? String(u.name).charAt(0) : '?')}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{u.prefix} {u.name} {u.surname}</div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{u.role === 'teacher' ? u.roomAdvisor : (u.class || '—')}</span></td>
                    <td style={{ fontSize:13 }}>{u.gender || '—'}</td>
                    <td style={{ fontSize:13 }}>{u.mobilePhone || '—'}</td>
                    <td style={{ fontSize:13 }}>{u.email || '—'}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn-secondary btn-sm" onClick={() => handleViewDetail(u)}>✏️ ดู/แก้ไข</button>
                        {canEditList && <button className="btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ProfileDetailModal profile={selected} onClose={() => setSelected(null)} onSave={handleSave}
          viewerRole={user?.role || 'guest'} currentUser={user} updateUser={updateUser} loadUsers={loadUsers} />
      )}
    </div>
  );
}
