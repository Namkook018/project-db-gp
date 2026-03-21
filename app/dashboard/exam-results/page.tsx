'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../lib/auth';
import { apiGetScores, apiUpdateScore, apiImportScores, apiGetUsers, type ScoreRecord } from '../../lib/api';
import { SUBJECTS, ALL_CLASSES, EXAM_TYPES } from '../../lib/config';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SUBJECT_COLORS: Record<string,string> = {
  'คณิตศาสตร์':'#6366f1','ฟิสิกส์':'#0ea5e9','เคมี':'#8b5cf6',
  'ชีววิทยา':'#10b981','ภาษาอังกฤษ':'#f59e0b','ภาษาไทย':'#ef4444','สังคมศึกษา':'#ec4899',
};

interface GroupedScore {
  key: string;
  studentId: string;
  studentName: string;
  class: string;
  maxScore: number;
  term: string;
  year: string;
  examType: string;
  examRound: string;
  subjects: Record<string, { id: string; score: number }>;
  total: number;
}

export default function ExamResultsPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');
  const [activeTab, setActiveTab] = useState<'table'|'chart'>('table');
  const [editModal, setEditModal] = useState<GroupedScore | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [students, setStudents] = useState<{id:string; name:string; class?:string}[]>([]);

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const loadScores = useCallback(async () => {
    setLoading(true);
    const filter: {studentId?:string; class?:string} = {};
    if (user?.role === 'student') {
      if (user.class) filter.class = user.class; // Fetch class scores for average comparison
      else filter.studentId = user.username;
    }
    if (user?.role === 'teacher') filter.class = user.roomAdvisor;
    const [sc, us] = await Promise.all([apiGetScores(filter), apiGetUsers()]);
    setScores(sc);
    setStudents(us.map(u => ({ id:u.id, name:`${u.name} ${u.surname}`, class:u.class })));
    setLoading(false);
  }, [user]);

  useEffect(() => { loadScores(); }, [loadScores]);

  // Filter basic
  const filtered = scores.filter(s => {
    const mc = !filterClass   || s.class === filterClass;
    const ms = !filterSubject || s.subject === filterSubject;
    const me = !filterExamType || s.examType === filterExamType;
    return mc && ms && me;
  });

  // Calculate class averages for trend graphs
  const classAverages = useMemo(() => {
    const map = new Map<string, { sum: number, count: number }>();
    filtered.forEach(s => {
      const k = `${s.class}-${s.year}-${s.term}-${s.examType}-${s.examRound}-${s.subject}`;
      if(!map.has(k)) map.set(k, {sum:0, count:0});
      const d = map.get(k)!;
      d.sum += Number(s.score) || 0;
      d.count += 1;
    });
    const result = new Map<string, number>();
    map.forEach((v, k) => result.set(k, v.sum / v.count));
    return result;
  }, [filtered]);

  // Pivot rendering variables
  const groupedScores = useMemo(() => {
    const map = new Map<string, GroupedScore>();
    filtered.forEach(s => {
      // If student is viewing, only group THEIR OWN scores
      if (user?.role === 'student' && String(s.studentId) !== String(user.username)) return;

      const key = `${s.studentId}-${s.term}-${s.year}-${s.examType}-${s.examRound}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          studentId: s.studentId,
          studentName: s.studentName,
          class: s.class,
          term: s.term,
          year: s.year,
          examType: s.examType,
          examRound: s.examRound || '1',
          maxScore: s.maxScore,
          subjects: {},
          total: 0
        });
      }
      const group = map.get(key)!;
      group.subjects[s.subject] = { id: s.id, score: s.score };
      group.total += Number(s.score) || 0;
    });
    return Array.from(map.values()).sort((a,b) => {
      const classA = String(a.class || '');
      const classB = String(b.class || '');
      if (classA !== classB) return classA.localeCompare(classB);
      return String(a.studentId || '').localeCompare(String(b.studentId || ''));
    });
  }, [filtered]);

  // Radar chart data (for student or single class average)
  const radarData = SUBJECTS.map(sub => {
    const rel = filtered.filter(s => s.subject === sub);
    const avg = rel.length ? Math.round(rel.reduce((a,c) => a + c.score/c.maxScore*100, 0) / rel.length) : 0;
    return { subject: sub.replace('ศึกษา',''), score: avg, fullMark: 100 };
  });

  // Average per subject for summary (Latest Round for Student, Class Average for others)
  const subjectAvg = useMemo(() => {
    return SUBJECTS.map(sub => {
      if (user?.role === 'student') {
        const subScores = filtered.filter(s => s.subject === sub && String(s.studentId) === String(user.username));
        if (subScores.length === 0) return { sub, avg: '-' };
        subScores.sort((a,b) => {
           if(a.year !== b.year) return Number(b.year) - Number(a.year);
           if(a.term !== b.term) return Number(b.term) - Number(a.term);
           return Number(b.examRound) - Number(a.examRound);
        });
        const latest = subScores[0];
        return { sub, avg: Number(latest.score).toFixed(1) };
      } else {
        let sum = 0, count = 0;
        groupedScores.forEach(g => {
          if (g.subjects[sub]) { sum += g.subjects[sub].score; count++; }
        });
        return { sub, avg: count > 0 ? (sum/count).toFixed(1) : '-' };
      }
    });
  }, [filtered, groupedScores, user]);

  const handleOpenEdit = (g: GroupedScore) => {
    const initForm: Record<string, string> = {};
    SUBJECTS.forEach(sub => {
      initForm[sub] = g.subjects[sub] ? String(g.subjects[sub].score) : '';
    });
    setEditForm(initForm);
    setEditModal(g);
  };

  const handleSaveModal = async () => {
    if (!editModal) return;
    setLoading(true);
    
    const toImport: Omit<ScoreRecord, 'id'>[] = [];
    // Save existing records sequentially 
    for (const sub of SUBJECTS) {
      const valStr = editForm[sub];
      const val = valStr ? parseFloat(valStr) : null;
      const existing = editModal.subjects[sub];
      
      if (existing) {
        if (val !== null && val !== existing.score && !isNaN(val)) {
           await apiUpdateScore(existing.id, val);
        }
      } else if (val !== null && !isNaN(val)) {
        toImport.push({
          studentId: editModal.studentId, studentName: editModal.studentName, class: editModal.class,
          subject: sub, score: val, maxScore: editModal.maxScore,
          term: editModal.term, year: editModal.year, examType: editModal.examType, examRound: editModal.examRound
        });
      }
    }
    
    // Create missing records inside group if filled
    if (toImport.length > 0) {
      await apiImportScores(toImport);
    }
    
    setEditModal(null);
    loadScores();
  };

  // Excel upload
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg('');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type:'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string,string|number>>(ws);
        
        const records: Omit<ScoreRecord, 'id'>[] = [];
        const subjectsList = ['คณิตศาสตร์','ฟิสิกส์','เคมี','ชีววิทยา','ภาษาอังกฤษ','ภาษาไทย','สังคมศึกษา'];

        for (const r of rows) {
          const studentId = String(r['รหัสนักเรียน'] || r['studentId'] || '');
          if (!studentId) continue;

          const studentName = String(r['ชื่อ-นามสกุล'] || r['studentName'] || '');
          const cls = String(r['ห้อง'] || r['class'] || '');
          const maxScore = parseFloat(String(r['คะแนนเต็มแต่ละวิชา'] || r['maxScore'] || '100'));
          const term = String(r['ภาคเรียน'] || r['term'] || '1');
          const year = String(r['ปีการศึกษา'] || r['year'] || '2567');
          const examType = String(r['ประเภทสอบ'] || r['examType'] || 'กลางภาค');
          const examRound = String(r['ครั้งที่'] || r['examRound'] || '1');

          for (const sub of subjectsList) {
            const val = r[sub];
            if (val !== undefined && val !== null && val !== '') {
              const scoreNum = parseFloat(String(val));
              if (!isNaN(scoreNum)) {
                records.push({
                  studentId, studentName, class: cls,
                  subject: sub, score: scoreNum, maxScore,
                  term, year, examType, examRound
                });
              }
            }
          }
        }

        const result = await apiImportScores(records);
        setUploadMsg(result.success ? `✅ นำเข้าสำเร็จ ${result.count} รายการ` : '❌ เกิดข้อผิดพลาด');
        if (result.success) loadScores();
      } catch (err) {
        console.error(err);
        setUploadMsg('❌ ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบ');
      }
      setUploading(false);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text('รายงานผลการสอบ', 148, 15, { align:'center' });
    doc.setFontSize(9);
    doc.text(`จำนวน ${groupedScores.length} นักเรียน`, 148, 22, { align:'center' });
    autoTable(doc, {
      startY: 28,
      head: [
        !canEdit
          ? ['ห้อง','คณิต','ฟิสิกส์','เคมี','ชีวะ','อังกฤษ','ไทย','สังคม','รวม','ประเภทการสอบ','ครั้งที่']
          : ['รหัสนักเรียน','ชื่อ-นามสกุล','ห้อง','คณิต','ฟิสิกส์','เคมี','ชีวะ','อังกฤษ','ไทย','สังคม','รวม','ประเภทการสอบ','ครั้งที่']
      ],
      body: groupedScores.map((g) => {
        if (!canEdit) {
          return [
            g.class,
            g.subjects['คณิตศาสตร์']?.score ?? '-',
            g.subjects['ฟิสิกส์']?.score ?? '-',
            g.subjects['เคมี']?.score ?? '-',
            g.subjects['ชีววิทยา']?.score ?? '-',
            g.subjects['ภาษาอังกฤษ']?.score ?? '-',
            g.subjects['ภาษาไทย']?.score ?? '-',
            g.subjects['สังคมศึกษา']?.score ?? '-',
            g.total,
            g.examType,
            g.examRound
          ];
        } else {
          return [
            g.studentId, g.studentName, g.class,
            g.subjects['คณิตศาสตร์']?.score ?? '-',
            g.subjects['ฟิสิกส์']?.score ?? '-',
            g.subjects['เคมี']?.score ?? '-',
            g.subjects['ชีววิทยา']?.score ?? '-',
            g.subjects['ภาษาอังกฤษ']?.score ?? '-',
            g.subjects['ภาษาไทย']?.score ?? '-',
            g.subjects['สังคมศึกษา']?.score ?? '-',
            g.total,
            g.examType,
            g.examRound
          ];
        }
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });
    doc.save('exam-results.pdf');
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ห้อง', 'คะแนนเต็มแต่ละวิชา', 'คณิตศาสตร์', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา', 'ภาษาอังกฤษ', 'ภาษาไทย', 'สังคมศึกษา', 'คะแนนรวม', 'ภาคเรียน', 'ปีการศึกษา', 'ประเภทสอบ', 'ครั้งที่'],
      ['1001', 'กานต์ สุขใจ', 'ม.4/9', '100', '85', '78', '82', '80', '90', '75', '88', '', '1', '2567', 'กลางภาค', '1'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'คะแนน');
    XLSX.writeFile(wb, 'score-template.xlsx');
  };

  const classes = [...new Set(scores.map(s => s.class))];

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom:20 }}>
        <h1 className="page-title">ผลการสอบ</h1>
        <p className="page-subtitle">
          {user?.role === 'student' ? 'ผลการสอบของคุณทั้งหมด' : user?.role === 'teacher' ? `ผลการสอบห้อง ${user.roomAdvisor}` : 'ผลการสอบทุกห้องเรียน'}
        </p>
      </div>

      {/* Subject averages */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        {subjectAvg.map(({ sub, avg }) => (
          <div key={sub} style={{ background:'#fff', borderRadius:12, padding:'10px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:8, border:'1.5px solid #f3f4f6' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:SUBJECT_COLORS[sub] || '#6366f1' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{sub}</span>
            <span style={{ fontSize:14, fontWeight:800, color:SUBJECT_COLORS[sub] || '#6366f1' }}>{avg !== '-' ? `${avg}` : '-'}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16, alignItems:'center' }}>
        {/* Filters */}
        {user?.role !== 'student' && (
          <select className="form-input" style={{ maxWidth:140 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">ทุกห้อง</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select className="form-input" style={{ maxWidth:160 }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="">ทุกวิชา</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-input" style={{ maxWidth:150 }} value={filterExamType} onChange={e => setFilterExamType(e.target.value)}>
          <option value="">ทุกประเภท</option>
          {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Actions */}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {/* Tab toggle */}
          <div className="tab-bar" style={{ width:'auto' }}>
            <button className={`tab-item ${activeTab==='table'?'active':''}`} style={{ flex:'none', padding:'6px 14px' }} onClick={() => setActiveTab('table')}>📋 ตารางคะแนน</button>
            <button className={`tab-item ${activeTab==='chart'?'active':''}`} style={{ flex:'none', padding:'6px 14px' }} onClick={() => setActiveTab('chart')}>📊 กราฟ</button>
          </div>
          {/* Teacher/Student: Export PDF */}
          {(user?.role === 'teacher' || user?.role === 'student') && (
            <button className="btn-secondary btn-sm" onClick={handleExportPDF} style={{ padding:'8px 14px' }}>⬇️ PDF</button>
          )}
          {/* Admin: upload + template */}
          {user?.role === 'admin' && (
            <>
              <button className="btn-secondary btn-sm" onClick={handleDownloadTemplate} style={{ padding:'8px 14px' }}>📥 Template</button>
              <label className="btn-success btn-sm" style={{ cursor:'pointer', padding:'8px 14px' }}>
                {uploading ? '⏳ กำลังอัปโหลด...' : '📤 นำเข้า Excel'}
                <input type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleUploadExcel} />
              </label>
              <button className="btn-secondary btn-sm" onClick={handleExportPDF} style={{ padding:'8px 14px' }}>⬇️ PDF</button>
            </>
          )}
        </div>
      </div>

      {uploadMsg && (
        <div style={{ padding:'10px 16px', borderRadius:10, marginBottom:14, background: uploadMsg.startsWith('✅') ? '#d1fae5' : '#fee2e2', color: uploadMsg.startsWith('✅') ? '#065f46' : '#991b1b', fontSize:13, fontWeight:600 }}>
          {uploadMsg}
        </div>
      )}

      {activeTab === 'chart' ? (
        <div className="section-card animate-fadeIn" style={{ padding:24 }}>
          <div className="section-header" style={{ padding:0, marginBottom:20 }}>
            <span className="section-title">📊 กราฟคะแนนเฉลี่ยรายวิชา</span>
          </div>
          <div style={{ height:360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:12, fontFamily:'Noto Sans Thai, sans-serif', fill:'#374151' }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize:10 }} />
                <Radar name="คะแนน" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="section-card animate-fadeIn">
          {loading ? (
            <div style={{ padding:40, textAlign:'center' }}><span className="spinner" style={{ width:32, height:32 }} /></div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="data-table" style={{ whiteSpace:'nowrap' }}>
                <thead>
                  <tr style={{ background:'#f9fafb' }}>
                    <th style={{ width:50, color:'#6b7280' }}>ลำดับ</th>
                    {canEdit && <th style={{ width:100 }}>รหัสนักเรียน</th>}
                    {canEdit && <th style={{ width:180 }}>ชื่อ-นามสกุล</th>}
                    <th style={{ width:60, textAlign:'center' }}>ห้อง</th>
                    {SUBJECTS.map(sub => <th key={sub} style={{ textAlign:'center' }}>{sub}</th>)}
                    <th style={{ width:80, textAlign:'center', color:'#4f46e5' }}>รวม</th>
                    <th style={{ width:80, textAlign:'center' }}>ภาคเรียน</th>
                    <th style={{ width:100, textAlign:'center' }}>ปีการศึกษา</th>
                    <th style={{ width:130, textAlign:'center' }}>ประเภทการสอบ</th>
                    <th style={{ width:80, textAlign:'center' }}>ครั้งที่</th>
                    {canEdit && <th style={{ width:80, textAlign:'center' }}>จัดการ</th>}
                  </tr>
                </thead>
                <tbody>
                  {groupedScores.map((g, i) => (
                    <tr key={g.key}>
                      <td style={{ color:'#9ca3af', fontSize:12 }}>{i+1}</td>
                      {canEdit && <td><span className="badge badge-student">{g.studentId}</span></td>}
                      {canEdit && <td style={{ fontWeight:600 }}>{g.studentName}</td>}
                      <td><span className="badge badge-info">{g.class}</span></td>
                      {SUBJECTS.map(sub => {
                        const scoreData = g.subjects[sub];
                        const classAvg = classAverages.get(`${g.class}-${g.year}-${g.term}-${g.examType}-${g.examRound}-${sub}`);
                        let trend = null;
                        if (scoreData && classAvg !== undefined && classAvg > 0) {
                          if (scoreData.score > classAvg) trend = <span style={{color:'#10b981', fontSize:11, marginLeft:4, fontWeight:800}} title={`สูงกว่าค่าเฉลี่ยห้อง (${classAvg.toFixed(1)})`}>↑</span>;
                          else if (scoreData.score < classAvg) trend = <span style={{color:'#ef4444', fontSize:11, marginLeft:4, fontWeight:800}} title={`ต่ำกว่าค่าเฉลี่ยห้อง (${classAvg.toFixed(1)})`}>↓</span>;
                          else trend = <span style={{color:'#9ca3af', fontSize:11, marginLeft:4, fontWeight:800}} title="เท่ากับเฉลี่ยห้อง">-</span>;
                        }
                        return (
                          <td key={sub} style={{ textAlign:'center', color: scoreData ? '#111827' : '#9ca3af', fontWeight: scoreData ? 600 : 400 }}>
                            {scoreData ? <>{scoreData.score}{trend}</> : '—'}
                          </td>
                        );
                      })}
                      <td style={{ fontWeight:800, color:'#4f46e5', textAlign:'center' }}>{g.total}</td>
                      <td style={{ textAlign:'center' }}>{g.term}</td>
                      <td style={{ textAlign:'center' }}>{g.year}</td>
                      <td style={{ textAlign:'center' }}>
                        <span className="badge badge-teacher">
                          {g.examType}
                        </span>
                      </td>
                      <td style={{ textAlign:'center', fontWeight:700 }}>
                        {g.examRound}
                      </td>
                      {canEdit && (
                        <td style={{ textAlign:'center' }}>
                          <button className="btn-secondary btn-sm" onClick={() => handleOpenEdit(g)}>✏️ แก้ไข</button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {groupedScores.length === 0 && (
                    <tr><td colSpan={10 + SUBJECTS.length} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>ไม่พบข้อมูลผลการสอบ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-box" style={{ maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div style={{ background:'linear-gradient(135deg,#4f46e5,#6366f1)', padding:'24px 28px', borderRadius:'20px 20px 0 0', position:'relative', margin:'-32px -32px 24px -32px' }}>
              <h3 style={{ color:'#fff', fontWeight:800, fontSize:18, margin:0 }}>แก้ไขคะแนน: {editModal.studentName}</h3>
              <div style={{ color:'rgba(255,255,255,0.8)', fontSize:13, marginTop:4 }}>
                ชั้น {editModal.class} • การสอบ {editModal.examType} ครั้งที่ {editModal.examRound}
              </div>
              <button onClick={() => setEditModal(null)} style={{ position:'absolute', right:16, top:16, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#fff', fontSize:18 }}>×</button>
            </div>
             
             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, margin:'20px 0' }}>
                {SUBJECTS.map(sub => (
                  <div key={sub} style={{ background:'#f9fafb', padding:12, borderRadius:8 }}>
                    <label className="form-label" style={{ fontSize:12, marginBottom:4, display:'block' }}>{sub}</label>
                    <input className="form-input" type="number" value={editForm[sub]} placeholder="ใส่คะแนน..." onChange={e => setEditForm(p => ({...p, [sub]: e.target.value}))} />
                  </div>
                ))}
             </div>
             <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:16, borderTop:'1px solid #f3f4f6', paddingTop:16 }}>
                <button className="btn-secondary" onClick={() => setEditModal(null)}>ยกเลิก</button>
                <button className="btn-primary" onClick={handleSaveModal}>💾 บันทึกการแก้ไข</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
