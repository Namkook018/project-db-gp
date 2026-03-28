'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const result = await login(form.username, form.password);
    setLoading(false);
    if (result.success) router.replace('/dashboard');
    else setError(result.message || 'เกิดข้อผิดพลาด');
  };

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: -120, right: -120, width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -100, width: 320, height: 320, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/logo.png" alt="CPR Logo" width={80} height={80} style={{ objectFit: 'contain', marginBottom: 16, background: '#fff', borderRadius: '50%', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'block', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1e1b4b', margin: 0, letterSpacing: '-0.5px' }}>
            Gifted CPR Database
          </h1>
          <p style={{ color: '#4f46e5', fontSize: 14, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>โรงเรียนจตุรพักตรพิมานรัชดาภิเษก</p>
          <p style={{ color: '#6b7280', fontSize: 12 }}>สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาร้อยเอ็ด</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="form-label">ชื่อผู้ใช้</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
                <input
                  className="form-input" style={{ paddingLeft: 38 }}
                  placeholder="กรอกชื่อผู้ใช้" value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required autoComplete="username"
                />
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="form-label">รหัสผ่าน</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input
                  className="form-input" style={{ paddingLeft: 38, paddingRight: 42 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่าน" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link href="/forgot-password" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 15 }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> กำลังเข้าสู่ระบบ...</> : '🚀 เข้าสู่ระบบ'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, padding: '16px 0 0', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>ยังไม่มีบัญชี? </span>
            <Link href="/register" style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
              ลงทะเบียน
            </Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#6b7280', border: '1px solid #e0e7ff' }}>
          <p style={{ fontWeight: 700, color: '#5b21b6', marginBottom: 6 }}>🧪 Demo Accounts</p>
          <div style={{ display: 'grid', gap: 3 }}>
            <span>👑 admin / admin1234</span>
            <span>👨‍🏫 teacher1 / teacher1234</span>
            <span>🎒 stu001 / student1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
