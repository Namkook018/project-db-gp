'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth';
import { apiListFiles, apiDeleteFile, type DriveFile } from '../../lib/api';
import { DRIVE_FOLDERS, SUBJECTS } from '../../lib/config';

const LEVELS = ['มัธยมต้น', 'มัธยมปลาย'] as const;
type Level = typeof LEVELS[number];

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎬';
  return '📁';
}

export default function KnowledgePage() {
  const { user } = useAuth();
  const [activeLevel, setActiveLevel] = useState<Level>('มัธยมต้น');
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    const folderMap = DRIVE_FOLDERS[activeLevel] as Record<string, string | undefined>;
    const folderId = folderMap[activeSubject] || 'demo';
    const result = await apiListFiles(folderId);
    if (Array.isArray(result)) {
      setFiles(result);
    } else {
      setFiles([]);
      setUploadMsg('❌ ไม่สามารถโหลดไฟล์ได้ (กรุณาตรวจสอบ Folder ID ใน .env.local)');
    }
    setLoading(false);
  }, [activeLevel, activeSubject]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleDelete = async (fileId: string, name: string) => {
    if (!confirm(`ยืนยันการลบไฟล์ "${name}"?`)) return;
    const res = await apiDeleteFile(fileId);
    if (res.success) { setUploadMsg('🗑️ ลบไฟล์สำเร็จ'); loadFiles(); }
    else setUploadMsg('❌ ไม่สามารถลบไฟล์ได้');
    setTimeout(() => setUploadMsg(''), 3000);
  };

  const handleUpload = () => {
    // In real implementation, open Google Drive picker or upload via GAS
    window.open('https://drive.google.com', '_blank');
  };

  const filteredFiles = files.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const LEVEL_COLORS: Record<Level, { bg: string; accent: string }> = {
    'มัธยมต้น': { bg: '#ede9fe', accent: '#7c3aed' },
    'มัธยมปลาย': { bg: '#dbeafe', accent: '#1d4ed8' },
  };
  const SUBJECT_COLORS: Record<string, string> = {
    'คณิตศาสตร์': '#6366f1', 'ฟิสิกส์': '#0ea5e9', 'เคมี': '#8b5cf6',
    'ชีววิทยา': '#10b981', 'ภาษาอังกฤษ': '#f59e0b', 'ภาษาไทย': '#ef4444', 'สังคมศึกษา': '#ec4899',
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">คลังความรู้</h1>
        <p className="page-subtitle">หนังสือเรียน ข้อสอบ และสื่อการเรียนการสอน</p>
      </div>

      {/* Level tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {LEVELS.map(level => {
          const col = LEVEL_COLORS[level];
          return (
            <button key={level} onClick={() => setActiveLevel(level)}
              style={{
                padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: activeLevel === level ? `2px solid ${col.accent}` : '2px solid #e5e7eb',
                background: activeLevel === level ? col.bg : '#fff',
                color: activeLevel === level ? col.accent : '#6b7280',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
              {level === 'มัธยมต้น' ? '📖 มัธยมต้น (ม.1-3)' : '🎓 มัธยมปลาย (ม.4-6)'}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Subject sidebar */}
        <div className="section-card" style={{ padding: 12, alignSelf: 'start' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px 10px' }}>รายวิชา</div>
          {SUBJECTS.map(sub => (
            <button key={sub} onClick={() => setActiveSubject(sub)}
              className={activeSubject === sub ? '' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, textAlign: 'left',
                background: activeSubject === sub ? `${SUBJECT_COLORS[sub]}18` : 'transparent',
                color: activeSubject === sub ? SUBJECT_COLORS[sub] : '#6b7280',
                transition: 'all 0.15s', marginBottom: 2,
              }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeSubject === sub ? SUBJECT_COLORS[sub] : '#d1d5db', flexShrink: 0 }} />
              {sub}
            </button>
          ))}
        </div>

        {/* File content */}
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`🔍 ค้นหาไฟล์ใน ${activeSubject}...`} style={{ flex: 1, maxWidth: 320 }} />
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>พบ {filteredFiles.length} ไฟล์</div>
            {user?.role === 'admin' && (
              <button className="btn-primary btn-sm" onClick={handleUpload} style={{ padding: '8px 14px' }}>
                📤 อัปโหลดไฟล์
              </button>
            )}
          </div>

          {uploadMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 12, background: uploadMsg.startsWith('🗑️') ? '#d1fae5' : '#fee2e2', fontSize: 13, fontWeight: 600, color: uploadMsg.startsWith('🗑️') ? '#065f46' : '#991b1b' }}>
              {uploadMsg}
            </div>
          )}

          {/* Drive link info */}
          {user?.role === 'admin' && (
            <div style={{ background: '#fffbeb', border: '1.5px dashed #f59e0b', borderRadius: 12, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#92400e' }}>
              💡 โฟลเดอร์: <strong>{activeLevel} → {activeSubject}</strong> — กำหนด Google Drive Folder ID ใน <code>.env.local</code> เพื่อใช้งานจริง
            </div>
          )}

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
          ) : filteredFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, color: '#6b7280', fontSize: 16 }}>ยังไม่มีไฟล์ในหมวดนี้</div>
              {user?.role === 'admin' && <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>&quot;กดปุ่ม&quot; &quot;อัปโหลดไฟล์&quot; &quot;เพื่อเพิ่มไฟล์&quot;</div>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {filteredFiles.map((f, i) => (
                <div key={f.id} className="file-card animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 36 }}>{getFileIcon(f.mimeType)}</div>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(f.id, f.name)}
                        style={{ background: '#fee2e2', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#ef4444', flexShrink: 0 }}>🗑️</button>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1b4b', marginBottom: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>
                    {f.size} • {f.createdTime}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={f.webViewLink} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '7px 0', background: '#ede9fe', color: '#5b21b6', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      👁️ ดูไฟล์
                    </a>
                    <a href={f.downloadUrl} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '7px 0', background: '#d1fae5', color: '#065f46', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      ⬇️ ดาวน์โหลด
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
