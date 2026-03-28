'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiRegister, apiUploadProfilePic } from '../lib/api';
import { getDirectImageUrl } from '../lib/utils';
import { ALL_CLASSES, RELIGIONS, BLOOD_TYPES, SUBJECTS } from '../lib/config';

const UploadButton = ({ onUpload, loading }: { onUpload: (file: File) => void; loading: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <label style={{ 
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', 
      background: '#4f46e5', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, 
      fontSize: 12, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' 
    }}>
      {loading ? '⌛ อัปโหลด...' : '📁 อัปโหลดรูปใหม่'}
      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={loading} onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </label>
  </div>
);

const F = ({ label, val, onChange, type='text', options, required=false }: { label:string; val:string; onChange:(v:string)=>void; type?:string; options?:string[]; required?:boolean }) => (
  <div>
    <label className="form-label">{label}{required && <span style={{color:'#ef4444'}}>*</span>}</label>
    {options ? (
      <select className="form-input" value={val} onChange={e => onChange(e.target.value)}>
        <option value="" disabled>-- เลือก --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input className="form-input" type={type} value={val} onChange={e => onChange(e.target.value)} />
    )}
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Record<string,string>>({
    username:'', password:'', confirmPassword:'', role:'student',
    prefix:'นาย', name:'', surname:'', englishName:'', idCard:'',
    gender:'ชาย', birthdate:'', bloodType:'A', religion:'พุทธ',
    ethnicity:'ไทย', nationality:'ไทย', weight:'', height:'', specialAbility:'',
    class:'ม.1/9', prevSchool:'', prevProvince:'', prevGrade:'ป.6',
    favoriteSubject:'', leastFavoriteSubject:'',
    houseNo:'', moo:'', alley:'', road:'', subdistrict:'', district:'', province:'', postalCode:'',
    homePhone:'', mobilePhone:'', email:'', birthPlace:'', birthDistrict:'', birthProvince:'', hospital:'',
    siblings:'0', siblingsInSchool:'0',
    fatherName:'', fatherIdCard:'', fatherOccupation:'', fatherIncome:'', fatherPhone:'', fatherStatus:'อยู่ด้วยกัน',
    motherName:'', motherIdCard:'', motherOccupation:'', motherIncome:'', motherPhone:'', motherStatus:'อยู่ด้วยกัน',
    guardianName:'', guardianRelation:'', guardianPhone:'',
    roomAdvisor:'ม.1/9', profilePic:'' // Add teacher items
  });

  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}));
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const res = await apiUploadProfilePic(file.name, file.type, base64Data);
      if (res.success && res.url) {
        set('profilePic', res.url);
      } else {
        alert('อัปโหลดล้มเหลว: ' + (res.error || 'Unknown error'));
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const isTeacher = form.role === 'teacher';
  const STEPS = isTeacher ? ['ข้อมูลบัญชี', 'ข้อมูลครู'] : ['ข้อมูลบัญชี','ข้อมูลส่วนตัว','ที่อยู่','ข้อมูลผู้ปกครอง'];

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    setLoading(true); setError('');
    const res = await apiRegister(form);
    setLoading(false);
    if (res.success) setSuccess(true);
    else setError(res.message || 'เกิดข้อผิดพลาด');
  };

  if (success) return (
    <div className="auth-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="glass-card animate-fadeInUp" style={{ padding:40, textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#059669', marginBottom:8 }}>ลงทะเบียนสำเร็จ!</h2>
        <p style={{ color:'#6b7280', fontSize:14, marginBottom:24 }}>รอการอนุมัติจากผู้ดูแลระบบ</p>
        <button className="btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={() => router.push('/login')}>
          ไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-bg" style={{ minHeight:'100vh', padding:'24px 16px' }}>
      <div style={{ maxWidth:600, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Image src="/logo.png" alt="CPR Logo" width={72} height={72} style={{ objectFit:'contain', marginBottom:12, background:'#fff', borderRadius:'50%', padding:4, boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }} />
          <h1 style={{ fontSize:20, fontWeight:900, color:'#1e1b4b', margin:0, letterSpacing:'-0.5px' }}>
            CPR Gifted Program Database
          </h1>
          <p style={{ color:'#4f46e5', fontSize:13, fontWeight:600, marginTop:6, marginBottom:2 }}>โรงเรียนจตุรพักตรพิมานรัชดาภิเษก</p>
          <p style={{ color:'#6b7280', fontSize:11 }}>สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาร้อยเอ็ด</p>
          <h2 style={{ fontSize:18, fontWeight:700, color:'#1e1b4b', marginTop:24 }}>
            ลงทะเบียน{isTeacher ? 'บุคลากรครู' : 'นักเรียนใหม่'}
          </h2>
          <div style={{ marginTop:12 }}>
            <Link href="/login" style={{ color:'#6366f1', fontSize:13, fontWeight:600, textDecoration:'none' }}>← กลับไปเข้าสู่ระบบ</Link>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {STEPS.map((s,i) => (
            <div key={i} style={{ flex:1, textAlign:'center' }}>
              <div style={{
                height:4, borderRadius:99,
                background: i <= step ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : '#e5e7eb',
                marginBottom:6, transition:'background 0.3s'
              }} />
              <span style={{ fontSize:11, fontWeight:600, color: i <= step ? '#4f46e5' : '#9ca3af' }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding:28 }}>
          {/* Profile Picture Preview at the top */}
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24, paddingBottom:20, borderBottom:'1px solid #f3f4f6' }}>
            <div className={`avatar ${!getDirectImageUrl(form.profilePic) ? 'avatar-placeholder' : ''} avatar-lg`} style={{ borderRadius:16, fontSize:28, fontWeight:800, border:'3px solid #e5e7eb', overflow:'hidden', flexShrink:0 }}>
              {getDirectImageUrl(form.profilePic) ? (
                <img src={getDirectImageUrl(form.profilePic)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                form.name?.charAt(0) || '?'
              )}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#1e1b4b', marginBottom:4 }}>รูปโปรไฟล์</div>
              <div style={{ display:'flex', gap:8 }}>
                <UploadButton onUpload={handleFileUpload} loading={uploading} />
                <button 
                  onClick={() => {
                    const url = prompt('กรอกลิงก์รูปโปรไฟล์:', form.profilePic || '');
                    if (url !== null) set('profilePic', url);
                  }}
                  className="btn-secondary btn-sm"
                >
                  🔗 แนบลิงก์ URL
                </button>
              </div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:6 }}>แนะนำรูปทรงจตุรัส ขนาดไม่เกิน 2MB</div>
            </div>
          </div>

          {step === 0 && (
            <div style={{ display:'grid', gap:16 }}>
              <h3 style={{ fontWeight:700, color:'#1e1b4b', marginBottom:4 }}>ข้อมูลบัญชีผู้ใช้</h3>
              <F label="ชื่อผู้ใช้" val={form.username} onChange={v=>set('username',v)} required />
              <F label="รหัสผ่าน" val={form.password} onChange={v=>set('password',v)} type="password" required />
              <F label="ยืนยันรหัสผ่าน" val={form.confirmPassword} onChange={v=>set('confirmPassword',v)} type="password" required />
              <F label="ประเภทผู้ใช้" val={form.role} onChange={v=>{set('role',v); setStep(0);}} options={['student','teacher']} />
              {!isTeacher && <F label="ชั้นเรียน" val={form.class} onChange={v=>set('class',v)} options={ALL_CLASSES} />}
            </div>
          )}

          {isTeacher && step === 1 && (
            <div style={{ display:'grid', gap:16 }}>
              <h3 style={{ fontWeight:700, color:'#1e1b4b', marginBottom:4 }}>ข้อมูลครูและบุคลากร</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 2fr', gap:12 }}>
                <F label="คำนำหน้า" val={form.prefix} onChange={v=>set('prefix',v)} options={['นาย','นาง','น.ส.']} />
                <F label="ชื่อ" val={form.name} onChange={v=>set('name',v)} required />
                <F label="นามสกุล" val={form.surname} onChange={v=>set('surname',v)} required />
              </div>
              <F label="ชื่อภาษาอังกฤษ (First Last)" val={form.englishName} onChange={v=>set('englishName',v)} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <F label="สอนรายวิชา" val={form.favoriteSubject} onChange={v=>set('favoriteSubject',v)} options={SUBJECTS} />
                <F label="ที่ปรึกษาชั้น" val={form.roomAdvisor} onChange={v=>set('roomAdvisor',v)} options={ALL_CLASSES} />
              </div>
              <F label="อีเมล" val={form.email} onChange={v=>set('email',v)} type="email" />
            </div>
          )}

          {!isTeacher && step === 1 && (
            <div style={{ display:'grid', gap:16 }}>
              <h3 style={{ fontWeight:700, color:'#1e1b4b', marginBottom:4 }}>ประวัติทั่วไปของนักเรียน</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 2fr', gap:12 }}>
                <F label="คำนำหน้า" val={form.prefix} onChange={v=>set('prefix',v)} options={['ด.ช.','ด.ญ.','นาย','น.ส.']} />
                <F label="ชื่อ" val={form.name} onChange={v=>set('name',v)} required />
                <F label="นามสกุล" val={form.surname} onChange={v=>set('surname',v)} required />
              </div>
              <F label="ชื่อภาษาอังกฤษ (First Last)" val={form.englishName} onChange={v=>set('englishName',v)} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <F label="เพศ" val={form.gender} onChange={v=>set('gender',v)} options={['ชาย','หญิง']} />
                <F label="วัน/เดือน/ปีเกิด (YYYY-MM-DD)" val={form.birthdate} onChange={v=>set('birthdate',v)} type="date" />
              </div>
              <F label="หมายเลขบัตรประชาชน" val={form.idCard} onChange={v=>set('idCard',v)} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F label="เชื้อชาติ" val={form.ethnicity} onChange={v=>set('ethnicity',v)} />
                <F label="สัญชาติ" val={form.nationality} onChange={v=>set('nationality',v)} />
                <F label="ศาสนา" val={form.religion} onChange={v=>set('religion',v)} options={RELIGIONS} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <F label="น้ำหนัก (กก.)" val={form.weight} onChange={v=>set('weight',v)} type="number" />
                <F label="ส่วนสูง (ซม.)" val={form.height} onChange={v=>set('height',v)} type="number" />
                <F label="หมู่เลือด" val={form.bloodType} onChange={v=>set('bloodType',v)} options={BLOOD_TYPES} />
              </div>
              <F label="ความสามารถพิเศษ" val={form.specialAbility} onChange={v=>set('specialAbility',v)} />
            </div>
          )}

          {!isTeacher && step === 2 && (
            <div style={{ display:'grid', gap:16 }}>
              <h3 style={{ fontWeight:700, color:'#1e1b4b', marginBottom:4 }}>สถานที่อยู่ตามสำเนาทะเบียนบ้าน</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <F label="บ้านเลขที่" val={form.houseNo} onChange={v=>set('houseNo',v)} />
                <F label="หมู่ที่" val={form.moo} onChange={v=>set('moo',v)} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <F label="ตำบล/แขวง" val={form.subdistrict} onChange={v=>set('subdistrict',v)} />
                <F label="อำเภอ/เขต" val={form.district} onChange={v=>set('district',v)} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <F label="จังหวัด" val={form.province} onChange={v=>set('province',v)} />
                <F label="รหัสไปรษณีย์" val={form.postalCode} onChange={v=>set('postalCode',v)} />
              </div>
              <F label="อีเมล" val={form.email} onChange={v=>set('email',v)} type="email" />
            </div>
          )}

          {!isTeacher && step === 3 && (
            <div style={{ display:'grid', gap:20 }}>
              <div>
                <h4 style={{ fontWeight:700, color:'#4f46e5', marginBottom:12 }}>ข้อมูลบิดา</h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <F label="ชื่อ-สกุลบิดา" val={form.fatherName} onChange={v=>set('fatherName',v)} />
                  <F label="โทรศัพท์มือถือ" val={form.fatherPhone} onChange={v=>set('fatherPhone',v)} />
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight:700, color:'#4f46e5', marginBottom:12 }}>ข้อมูลมารดา</h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <F label="ชื่อ-สกุลมารดา" val={form.motherName} onChange={v=>set('motherName',v)} />
                  <F label="โทรศัพท์มือถือ" val={form.motherPhone} onChange={v=>set('motherPhone',v)} />
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight:700, color:'#6b7280', marginBottom:12 }}>ผู้ปกครอง (กรณีไม่ใช่บิดา-มารดา)</h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <F label="ชื่อ-สกุลผู้ปกครอง" val={form.guardianName} onChange={v=>set('guardianName',v)} />
                  <F label="โทรศัพท์" val={form.guardianPhone} onChange={v=>set('guardianPhone',v)} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:10, fontSize:13, marginTop:16 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display:'flex', gap:12, marginTop:24 }}>
            {step > 0 && (
              <button className="btn-secondary" style={{ flex:1 }} onClick={() => setStep(s => s-1)}>
                ← ก่อนหน้า
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={() => setStep(s => s+1)}>
                ถัดไป →
              </button>
            ) : (
              <button className="btn-success" style={{ flex:2, justifyContent:'center' }} onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> กำลังบันทึก...</> : '✅ ลงทะเบียน'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
