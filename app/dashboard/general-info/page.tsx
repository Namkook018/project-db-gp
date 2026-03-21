'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth';
import { apiGetUsers, apiGetStudentProfile, apiUpdateProfile, apiDeleteUser, type StudentProfile } from '../../lib/api';

const SECTION_BG = '#f9fafb';

function ProfileDetailModal({ profile, onClose, onSave, viewerRole }: {
  profile: StudentProfile; onClose: () => void;
  onSave: (data: Partial<StudentProfile>) => void; viewerRole: string;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({...profile});
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}));

  // Everyone can edit the rows they are allowed to see based on our current logic.
  const canEdit = true; 

  const F = ({ label, k, readonly, options }: { label: string; k: string; readonly?: boolean; options?: string[] }) => (
    <div>
      <label className="form-label" style={{ fontSize:11 }}>{label}</label>
      {edit && !readonly ? (
        options ? (
          <select className="form-input" style={{ padding:'6px 10px', fontSize:13 }} value={(form as Record<string,string>)[k]||''} onChange={e => set(k, e.target.value)}>
            <option value="">-- เลือก --</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input className="form-input" style={{ padding:'6px 10px', fontSize:13 }} value={(form as Record<string,string>)[k]||''} onChange={e => set(k, e.target.value)} />
        )
      ) : (
        <div style={{ fontSize:13, color:'#374151', padding:'5px 0', borderBottom:'1px solid #f3f4f6' }}>
          {edit && readonly ? ((form as Record<string,string>)[k] || '—') : (((profile as unknown) as Record<string,string>)[k] || '—')}
        </div>
      )}
    </div>
  );

  const isStudent = profile.role === 'student';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:700, padding:0 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#6366f1)', padding:'24px 28px', borderRadius:'20px 20px 0 0', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div className="avatar avatar-placeholder avatar-lg" style={{ borderRadius:16, fontSize:28, fontWeight:800, border:'3px solid rgba(255,255,255,0.3)' }}>
              {profile.name?.charAt(0) || '?'}
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
                <F label="คำนำหน้า" k="prefix" options={['นาย','นาง','น.ส.', 'ดร.', 'ศ.']} />
                <F label="ชื่อ" k="name" />
                <F label="นามสกุล" k="surname" />
                <F label="ชื่อภาษาอังกฤษ" k="englishName" />
                <F label="สอนรายวิชา" k="favoriteSubject" />
                <F label="ที่ปรึกษาชั้น" k="roomAdvisor" />
                <F label="อีเมล" k="email" />
                <F label="ลิงก์รูปโปรไฟล์" k="profilePic" />
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
                  <F label="รหัสประจำตัวนักเรียน" k="username" readonly />
                  <F label="คำนำหน้า" k="prefix" />
                  <F label="ชื่อ" k="name" />
                  <F label="นามสกุล" k="surname" />
                  <F label="ชั้นเรียน" k="class" readonly={viewerRole === 'student'} />
                  <F label="หมายเลขบัตรประชาชน" k="idCard" />
                  <F label="เพศ" k="gender" />
                  <F label="วันเกิด (YYYY-MM-DD)" k="birthdate" />
                  <F label="เชื้อชาติ" k="ethnicity" />
                  <F label="สัญชาติ" k="nationality" />
                  <F label="ศาสนา" k="religion" />
                  <F label="น้ำหนัก" k="weight" />
                  <F label="ส่วนสูง" k="height" />
                  <F label="หมู่เลือด" k="bloodType" />
                </div>
              </div>

              {/* Section: Education */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>การศึกษา</div>
                <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12 }}>
                  <F label="โรงเรียนเดิม" k="prevSchool" />
                  <F label="จังหวัด" k="prevProvince" />
                  <F label="ชั้นสุดท้าย" k="prevGrade" />
                  <F label="วิชาที่ชอบ" k="favoriteSubject" />
                  <F label="วิชาที่ไม่ชอบ" k="leastFavoriteSubject" />
                  <F label="ความสามารถพิเศษ" k="specialAbility" />
                </div>
              </div>

              {/* Section: Address */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>ที่อยู่</div>
                <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <F label="บ้านเลขที่" k="houseNo" />
                  <F label="หมู่ที่" k="moo" />
                  <F label="ซอย/ถนน" k="road" />
                  <F label="ตำบล/แขวง" k="subdistrict" />
                  <F label="อำเภอ/เขต" k="district" />
                  <F label="จังหวัด" k="province" />
                  <F label="อีเมล" k="email" />
                  <F label="โทรศัพท์มือถือ" k="mobilePhone" />
                  <F label="รหัสไปรษณีย์" k="postalCode" />
                </div>
              </div>

              {/* Section: Parents */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#5b21b6', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>ข้อมูลผู้ปกครอง</div>
                <div style={{ background:SECTION_BG, borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <F label="ชื่อบิดา" k="fatherName" />
                  <F label="อาชีพบิดา" k="fatherOccupation" />
                  <F label="ชื่อมารดา" k="motherName" />
                  <F label="อาชีพมารดา" k="motherOccupation" />
                  {profile.guardianName && <><F label="ชื่อผู้ปกครอง" k="guardianName" /><F label="ความสัมพันธ์" k="guardianRelation" /></>}
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
                <div className="avatar avatar-placeholder avatar-lg" style={{ borderRadius:20, fontSize:32, fontWeight:800, border:'3px solid rgba(255,255,255,0.3)' }}>
                  {me.name?.charAt(0) || '?'}
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
                        <div className="avatar avatar-placeholder" style={{ fontSize:14, fontWeight:700, flexShrink:0 }}>{u.name?.charAt(0) || '?'}</div>
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
