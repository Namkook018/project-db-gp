'use client';
import { useState } from 'react';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxqr-w28pLuLh4LUTOYDlplatx_Re4kGog2-q-8c9cVC8GwvR6nkkP-WXf7Z4v16xsZ/exec';

export default function TcasPage() {
  const [useLocal, setUseLocal] = useState(false);

  if (useLocal) {
    return (
      <div style={{ width: '100%', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fcd34d', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <span>⚠️ โหมดนี้บันทึกข้อมูลเฉพาะในเครื่องนี้ (localStorage)</span>
          <a href={GAS_URL} target="_blank" rel="noopener noreferrer"
            style={{ marginLeft: 'auto', color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}>
            เปิดเวอร์ชันหลัก (GAS) ↗
          </a>
          <button onClick={() => setUseLocal(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280' }}>✕</button>
        </div>
        <iframe
          src="/tcas-app.html"
          style={{ flex: 1, border: 'none', display: 'block' }}
          title="TCAS Score Manager (local)"
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 440,
        textAlign: 'center', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎓</div>
        <div style={{ fontFamily: 'sans-serif', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          TCAS Score Manager
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 36 }}>
          ระบบจัดการคะแนน TGAT · TPAT · A-Level · NETSAT
        </div>

        <a href={GAS_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
            borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(245,166,35,0.15)', cursor: 'pointer', marginBottom: 12,
            color: 'rgba(255,255,255,0.9)', transition: 'all .2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,166,35,0.28)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,166,35,0.15)')}>
            <div style={{ fontSize: 26, width: 40, height: 40, borderRadius: 10, background: 'rgba(245,166,35,0.3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>☁️</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>เปิดในแท็บใหม่ <span style={{ fontSize: 12, opacity: 0.6 }}>↗</span></div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>ข้อมูลเก็บใน Google Sheets · แชร์ได้ทุกเครื่อง</div>
            </div>
          </div>
        </a>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
            borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
            color: 'rgba(255,255,255,0.9)', transition: 'all .2s',
          }}
          onClick={() => setUseLocal(true)}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
          <div style={{ fontSize: 26, width: 40, height: 40, borderRadius: 10, background: 'rgba(100,116,139,0.3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>💾</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>ใช้งานในหน้านี้</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>ข้อมูลเก็บในเครื่องนี้เท่านั้น (localStorage)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
