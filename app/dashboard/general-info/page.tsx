'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth';
import { apiGetUsers, apiGetStudentProfile, apiUpdateProfile, apiDeleteUser, apiUploadProfilePic, type StudentProfile } from '../../lib/api';
import { getDirectImageUrl } from '../../lib/utils';

const SECTION_BG = '#f9fafb';

const F = ({ label, k, edit, readonly, options, form, profile, set }: { 
  label: string; k: string; edit: boolean; readonly?: boolean; options?: string[]; 
  form: StudentProfile; profile: StudentProfile; set: (k: string, v: string) => void 
}) => (
  <div>
    <label className="form-label" style={{ fontSize:11 }}>{label}</label>
    {edit && !readonly ? (
      options ? (
        <select className="form-input" style={{ padding:'6px 10px', fontSize:13 }} value={((form as unknown) as Record<string,string>)[k]||''} onChange={e => set(k, e.target.value)}>
          <option value="">-- เลือก --</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className="form-input" style={{ padding:'6px 10px', fontSize:13 }} value={((form as unknown) as Record<string,string>)[k]||''} onChange={e => set(k, e.target.value)} />
      )
    ) : (
      <div style={{ fontSize:13, color:'#374151', padding:'5px 0', borderBottom:'1px solid #f3f4f6' }}>
        {edit && readonly ? (((form as unknown) as Record<string,string>)[k] || '—') : (((profile as unknown) as Record<string,string>)[k] || '—')}
      </div>
    )}
  </div>
);

const UploadButton = ({ onUpload, loading, currentUrl }: { onUpload: (file: File) => void; loading: boolean; currentUrl?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <label style={{ 
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', 
      background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, 
      fontSize: 12, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' 
    }}>
      {loading ? '⌛ อัปโหลด...' : '📁 อัปโหลดรูปใหม่'}
      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={loading} onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </label>
  </div>
);

function ProfileDetailModal({ profile, onClose, onSave, viewerRole }: {
  profile: StudentProfile; onClose: () => void;
  onSave: (data: Partial<StudentProfile>) => void; viewerRole: string;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({...profile});
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}));

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const res = await apiUploadProfilePic(file.name, file.type, base64Data);
      if (res.success && res.url) {
        set('profilePic', res.url);
      } else {
        alert('อัปโหลดล้มเหลว');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Everyone can edit the rows they are allowed to see based on our current logic.
  const canEdit = true; 

  const isStudent = profile.role === 'student';
  const fProps = { edit, form, profile, set };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:700, padding:0 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#6366f1)', padding:'24px 28px', borderRadius:'20px 20px 0 0', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div className={`avatar ${!getDirectImageUrl(edit ? form.profilePic : profile.profilePic) ? 'avatar-placeholder' : ''} avatar-lg`} style={{ borderRadius:16, fontSize:28, fontWeight:800, border:'3px solid rgba(255,255,255,0.3)', overflow:'hidden', position:'relative' }}>
              {getDirectImageUrl(edit ? form.profilePic : profile.profilePic) ? (
                <img src={getDirectImageUrl(edit ? form.profilePic : profile.profilePic)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                profile.name?.charAt(0) || '?'
              )}
              {edit && (
                <div 
                  style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}
                >
                  <UploadButton onUpload={handleFileUpload} loading={uploading} currentUrl={form.profilePic} />
                  <div 
                    onClick={() => {
                      const url = prompt('กรอกลิงก์รูปโปรไฟล์ใหม่:', form.profilePic || '');
                      if (url !== null) set('profilePic', url);
                    }}
                    style={{ fontSize:10, color:'rgba(255,255,255,0.8)', cursor:'pointer', textDecoration:'underline' }}
                  >
                    หรือแนบลิงก์ URL
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 style={{ color:'#fff', fontWeight:800, fontSize:18 }}>{profile.prefix} {profile.name} {profile.surname}</h3>
              <div style={{ color:'rgba(255,255,255,0.8)', fontSize:13, marginTop:2 }}>
                {isStudent ? `ชั้น ${profile.class || '—'}` : `ตำแหน่ง: ${profile.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ครู'}`} • {profile.englishName || ''}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ position:'absolute', right:16, top:16, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#fff', fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:24, maxHeight:'60vh', overflowY:'auto' }}>
          {/* TEACHER / ADMIN VIEW */}
          {!isStudent && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>ข้อมูลบุคลากร</div>
              <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <F {...fProps} label="คำนำหน้า" k="prefix" options={['นาย','นาง','น.ส.', 'ดร.', 'ศ.']} />
                <F {...fProps} label="ชื่อ" k="name" />
                <F {...fProps} label="นามสกุล" k="surname" />
                <F {...fProps} label="ชื่อภาษาอังกฤษ" k="englishName" />
                <F {...fProps} label="สอนรายวิชา" k="favoriteSubject" />
                <F {...fProps} label="ที่ปรึกษาชั้น" k="roomAdvisor" />
                <F {...fProps} label="อีเมล" k="email" />
                <div>
                  <label className="form-label" style={{fontSize:11}}>รูปโปรไฟล์</label>
                  {edit ? (
                    <UploadButton onUpload={handleFileUpload} loading={uploading} currentUrl={form.profilePic} />
                  ) : (
                    <div style={{fontSize:12, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{profile.profilePic || '-'}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STUDENT VIEW */}
          {isStudent && (
            <>
              {/* Section: Personal Info */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>ข้อมูลส่วนตัว</div>
                <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <F {...fProps} label="รหัสประจำตัวนักเรียน" k="username" readonly />
                  <F {...fProps} label="คำนำหน้า" k="prefix" />
                  <F {...fProps} label="ชื่อ" k="name" />
                  <F {...fProps} label="นามสกุล" k="surname" />
                  <F {...fProps} label="ชั้นเรียน" k="class" readonly={viewerRole === 'student'} />
                  <F {...fProps} label="หมายเลขบัตรประชาชน" k="idCard" />
                  <F {...fProps} label="เพศ" k="gender" />
                  <F {...fProps} label="วันเกิด (YYYY-MM-DD)" k="birthdate" />
                  <F {...fProps} label="เชื้อชาติ" k="ethnicity" />
                  <F {...fProps} label="สัญชาติ" k="nationality" />
                  <F {...fProps} label="ศาสนา" k="religion" />
                  <F {...fProps} label="น้ำหนัก" k="weight" />
                  <F {...fProps} label="ส่วนสูง" k="height" />
                  <F {...fProps} label="หมู่เลือด" k="bloodType" />
                </div>
              </div>

              {/* Section: Education */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>การศึกษา</div>
                <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12 }}>
                  <F {...fProps} label="โรงเรียนเดิม" k="prevSchool" />
                  <F {...fProps} label="จังหวัด" k="prevProvince" />
                  <F {...fProps} label="ชั้นสุดท้าย" k="prevGrade" />
                  <F {...fProps} label="วิชาที่ชอบ" k="favoriteSubject" />
                  <F {...fProps} label="วิชาที่ไม่ชอบ" k="leastFavoriteSubject" />
                  <F {...fProps} label="ความสามารถพิเศษ" k="specialAbility" />
                </div>
              </div>

              {/* Section: Address */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>ที่อยู่</div>
                <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <F {...fProps} label="บ้านเลขที่" k="houseNo" />
                  <F {...fProps} label="หมู่ที่" k="moo" />
                  <F {...fProps} label="ซอย/ถนน" k="road" />
                  <F {...fProps} label="ตำบล/แขวง" k="subdistrict" />
                  <F {...fProps} label="อำเภอ/เขต" k="district" />
                  <F {...fProps} label="จังหวัด" k="province" />
                  <F {...fProps} label="อีเมล" k="email" />
                  <F {...fProps} label="โทรศัพท์มือถือ" k="mobilePhone" />
                  <F {...fProps} label="รหัสไปรษณีย์" k="postalCode" />
                </div>
              </div>

              {/* Section: Parents */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>ข้อมูลผู้ปกครอง</div>
                <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <F {...fProps} label="ชื่อบิดา" k="fatherName" />
                  <F {...fProps} label="อาชีพบิดา" k="fatherOccupation" />
                  <F {...fProps} label="ชื่อมารดา" k="motherName" />
                  <F {...fProps} label="อาชีพมารดา" k="motherOccupation" />
                  {profile.guardianName && <><F {...fProps} label="ชื่อผู้ปกครอง" k="guardianName" /><F {...fProps} label="ความสัมพันธ์" k="guardianRelation" /></>}
                </div>
              </div>
            </>
          )}
        </div>

        {canEdit && (
          <div style={{ padding:'16px 24px', borderTop:'1px solid #f3f4f6', display:'flex', gap:10, justifyContent:'flex-end' }}>
            {edit ? (
              <>
                <button className="btn-secondary" onClick={() => setEdit(false)}>ยกเลิก</button>
                <button className="btn-primary" onClick={() => { onSave(form); setEdit(false); }}>💾 บันทึก</button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setEdit(true)}>✏️ แก้ไขข้อมูล</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneralInfoPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudentProfile | null>(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const canEditList = user?.role === 'admin';

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const all = await apiGetUsers();
    let filtered = all;
    if (user?.role === 'teacher') filtered = all.filter(u => u.class === user.roomAdvisor || u.id === user.id);
    if (user?.role === 'student') filtered = all.filter(u => u.id === user.id);
    setUsers(filtered);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleViewDetail = async (u: StudentProfile) => {
    const full = await apiGetStudentProfile(u.id);
    setSelected(full || u);
  };

  const handleSave = async (data: Partial<StudentProfile>) => {
    if (!selected) return;
    await apiUpdateProfile(selected.id, data);
    setSelected(null); loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบผู้ใช้?')) return;
    await apiDeleteUser(id); loadUsers();
  };

  const classes = [...new Set(users.map(u => u.class).filter(Boolean))] as string[];
  const filtered = users.filter(u => {
    const matchSearch = !search || `${u.name} ${u.surname} ${u.username}`.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || u.class === filterClass;
    return matchSearch && matchClass;
  });

  // Student sees their own card
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
                <div className={`avatar ${!me.profilePic ? 'avatar-placeholder' : ''} avatar-lg`} style={{ borderRadius:20, fontSize:32, fontWeight:800, border:'3px solid rgba(255,255,255,0.3)', overflow:'hidden' }}>
                  {me.profilePic ? (
                    <img src={me.profilePic} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    me.name?.charAt(0) || '?'
                  )}
                </div>
                <div>
                  <h2 style={{ color:'#fff', fontWeight:800, fontSize:22 }}>{me.prefix} {me.name} {me.surname}</h2>
                  <div style={{ color:'rgba(255,255,255,0.8)', marginTop:4, fontSize:14 }}>
                    ชั้น {me.class} • <span className="badge badge-student">{me.username}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding:24 }}>
              <button className="btn-primary" onClick={() => handleViewDetail(me)}>✏️ ดู/แก้ไขข้อมูลทั้งหมด</button>
            </div>
          </div>
        </div>
        {selected && (
          <ProfileDetailModal profile={selected} onClose={() => setSelected(null)} onSave={handleSave} viewerRole={user?.role || 'student'} />
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
        <input
          className="form-input" style={{ maxWidth:280 }}
          placeholder="🔍 ค้นหาชื่อ / ชื่อผู้ใช้..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {classes.length > 1 && (
          <select className="form-input" style={{ maxWidth:160 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">ทุกห้อง</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#6b7280', fontWeight:600 }}>
          พบ {filtered.length} รายการ
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
                  <th>#</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ชั้นเรียน/ห้องที่ปรึกษา</th>
                  <th>เพศ</th>
                  <th>โทรศัพท์</th>
                  <th>อีเมล</th>
                  <th>Role</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} onClick={() => handleViewDetail(u)}>
                    <td style={{ color:'#9ca3af', fontSize:12 }}>{i+1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className={`avatar ${!u.profilePic ? 'avatar-placeholder' : ''}`} style={{ fontSize:14, fontWeight:700, flexShrink:0, overflow:'hidden' }}>
                          {u.profilePic ? (
                            <img src={u.profilePic} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          ) : (
                            u.name?.charAt(0) || '?'
                          )}
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
                        <button className="btn-secondary btn-sm" onClick={() => handleViewDetail(u)}>✏️ ตรวจสอบ/แก้ไข</button>
                        {canEditList && <button className="btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ProfileDetailModal profile={selected} onClose={() => setSelected(null)} onSave={handleSave} viewerRole={user?.role || 'guest'} />
      )}
    </div>
  );
}
