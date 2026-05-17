'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function P9TablePage() {
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
      <div style={{ background: '#fdf3e7', borderBottom: '1px solid #e8c88a', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
        <span style={{ color: '#8a4c14' }}>🕔 ตารางสอนคาบ 9 — จันทร์–ศุกร์ · 16.45–17.45 น.</span>
        <a href="/p9-table/index.html" target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: 'auto', color: '#b5651d', fontWeight: 600, textDecoration: 'underline' }}>
          เปิดในแท็บใหม่ ↗
        </a>
      </div>
      <iframe
        src="/p9-table/index.html"
        style={{ flex: 1, border: 'none', display: 'block' }}
        title="ตารางสอนคาบ 9"
      />
    </div>
  );
}
