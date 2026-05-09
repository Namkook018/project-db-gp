'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function StudyTablePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#eef2ff', borderBottom: '1px solid #c7d2fe', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
        <span style={{ color: '#3730a3' }}>📅 ตารางเรียนวันเสาร์ — ภาคเรียน 1/2569</span>
        <a href="/study-table/index.html" target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: 'auto', color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}>
          เปิดในแท็บใหม่ ↗
        </a>
      </div>
      <iframe
        src="/study-table/index.html"
        style={{ flex: 1, border: 'none', display: 'block' }}
        title="ตารางเรียนวันเสาร์"
      />
    </div>
  );
}
