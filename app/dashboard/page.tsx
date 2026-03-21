'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import {
  apiGetAnnouncements, apiAddAnnouncement, apiUpdateAnnouncement, apiDeleteAnnouncement,
  apiGetClassStats, type Announcement,
} from '../lib/api';
import { ALL_CLASSES } from '../lib/config';

export default function DashboardPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classStats, setClassStats] = useState<Record<string,number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ title:'', content:'', pinned: false });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [ann, stats] = await Promise.all([apiGetAnnouncements(), apiGetClassStats()]);
    setAnnouncements(ann.sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
    setClassStats(stats);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalStudents = Object.values(classStats).reduce((s,v) => s+v, 0);
  const juniorCount = ALL_CLASSES.filter(c=>c.startsWith('ม.1')||c.startsWith('ม.2')||c.startsWith('ม.3')).reduce((s,c) => s+(classStats[c]||0),0);
  const seniorCount = ALL_CLASSES.filter(c=>c.startsWith('ม.4')||c.startsWith('ม.5')||c.startsWith('ม.6')).reduce((s,c) => s+(classStats[c]||0),0);

  const openAdd = () => { setEditItem(null); setFormData({ title:'', content:'', pinned:false }); setShowModal(true); };
  const openEdit = (a: Announcement) => { setEditItem(a); setFormData({ title:a.title, content:a.content, pinned:a.pinned }); setShowModal(true); };

  const handleSave = async () => {
    if (editItem) {
      await apiUpdateAnnouncement(editItem.id, { ...formData });
    } else {
      await apiAddAnnouncement({ ...formData, date: new Date().toLocaleDateString('th-TH'), authorId: user!.id });
    }
    setShowModal(false); loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบประกาศ?')) return;
    await apiDeleteAnnouncement(id); loadData();
  };

  const STAT_CARDS = [
    { label:'นักเรียนทั้งหมด', value: totalStudents, icon:'🎒', color:'#6366f1', bg:'#ede9fe' },
    { label:'นักเรียนมัธยมต้น', value: juniorCount,   icon:'📖', color:'#0ea5e9', bg:'#dbeafe' },
    { label:'นักเรียนมัธยมปลาย', value: seniorCount, icon:'🎓', color:'#10b981', bg:'#d1fae5' },
    { label:'ห้องเรียนทั้งหมด', value: Object.keys(classStats).length, icon:'🏫', color:'#f59e0b', bg:'#fef3c7' },
  ];

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom:24 }}>
        <h1 className="page-title">สวัสดี, {user?.name}! 👋</h1>
        <p className="page-subtitle">ภาพรวมระบบและข้อมูลสำคัญวันนี้</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:16, marginBottom:28 }}>
        {STAT_CARDS.map((c,i) => (
          <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay:`${i*0.07}s` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{c.icon}</div>
              <span style={{ fontSize:28, fontWeight:800, color:c.color }}>{loading ? '—' : c.value}</span>
            </div>
            <div style={{ fontSize:13, color:'#6b7280', fontWeight:600 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Class breakdown */}
        <div className="section-card animate-fadeInUp" style={{ animationDelay:'0.2s' }}>
          <div className="section-header">
            <span className="section-title">📊 จำนวนนักเรียนแต่ละห้อง</span>
          </div>
          <div style={{ padding:'8px 0', maxHeight:320, overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:20, textAlign:'center' }}><span className="spinner" /></div>
            ) : Object.keys(classStats).length === 0 ? (
              <div style={{ padding:20, textAlign:'center', color:'#9ca3af', fontSize:14 }}>ยังไม่มีข้อมูล</div>
            ) : (
              ALL_CLASSES.filter(c => classStats[c]).map(cls => (
                <div key={cls} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderBottom:'1px solid #f9fafb' }}>
                  <div style={{ width:56, fontSize:13, fontWeight:700, color:'#5b21b6' }}>{cls}</div>
                  <div style={{ flex:1, height:8, background:'#f3f4f6', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:99, background:'linear-gradient(90deg,#6366f1,#818cf8)', width:`${Math.min(100, (classStats[cls]/Math.max(1,...Object.values(classStats)))*100)}%`, transition:'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#374151', minWidth:32, textAlign:'right' }}>{classStats[cls]}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="section-card animate-fadeInUp" style={{ animationDelay:'0.25s' }}>
          <div className="section-header">
            <span className="section-title">📢 ประชาสัมพันธ์</span>
            {user?.role === 'admin' && (
              <button className="btn-primary btn-sm" onClick={openAdd}>+ เพิ่มประกาศ</button>
            )}
          </div>
          <div style={{ padding:16, maxHeight:320, overflowY:'auto' }}>
            {loading ? (
              <div style={{ textAlign:'center', padding:20 }}><span className="spinner" /></div>
            ) : announcements.length === 0 ? (
              <div style={{ textAlign:'center', color:'#9ca3af', fontSize:14, padding:20 }}>ยังไม่มีประกาศ</div>
            ) : (
              announcements.map(a => (
                <div key={a.id} className={`announcement-card ${a.pinned ? 'pinned' : ''}`}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <div style={{ flex:1 }}>
                      {a.pinned && <span className="badge badge-warning" style={{ marginBottom:4 }}>📌 ปักหมุด</span>}
                      <div style={{ fontWeight:700, fontSize:14, color:'#1e1b4b', marginBottom:4 }}>{a.title}</div>
                      <div style={{ fontSize:13, color:'#6b7280', marginBottom:6, lineHeight:1.5 }}>{a.content}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>📅 {a.date}</div>
                    </div>
                    {user?.role === 'admin' && (
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <button onClick={() => openEdit(a)} style={{ background:'#ede9fe', border:'none', borderRadius:6, width:28, height:28, cursor:'pointer', fontSize:14 }}>✏️</button>
                        <button onClick={() => handleDelete(a.id)} style={{ background:'#fee2e2', border:'none', borderRadius:6, width:28, height:28, cursor:'pointer', fontSize:14 }}>🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ padding:28 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight:800, fontSize:18, color:'#1e1b4b', marginBottom:20 }}>
              {editItem ? '✏️ แก้ไขประกาศ' : '📢 เพิ่มประกาศใหม่'}
            </h3>
            <div style={{ display:'grid', gap:14 }}>
              <div>
                <label className="form-label">หัวข้อ</label>
                <input className="form-input" value={formData.title} onChange={e => setFormData({...formData, title:e.target.value})} placeholder="กรอกหัวข้อประกาศ" />
              </div>
              <div>
                <label className="form-label">เนื้อหา</label>
                <textarea className="form-input" rows={4} value={formData.content} onChange={e => setFormData({...formData, content:e.target.value})} placeholder="กรอกเนื้อหาประกาศ" style={{ resize:'vertical' }} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:600, color:'#374151' }}>
                <input type="checkbox" checked={formData.pinned} onChange={e => setFormData({...formData, pinned:e.target.checked})} />
                📌 ปักหมุดประกาศ
              </label>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex:1 }}>ยกเลิก</button>
              <button className="btn-primary" onClick={handleSave} style={{ flex:2, justifyContent:'center' }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
