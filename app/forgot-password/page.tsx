'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="auth-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="animate-fadeInUp" style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:64, height:64, borderRadius:16, margin:'0 auto 16px', background:'linear-gradient(135deg,#f59e0b,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🔑</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1e1b4b' }}>ลืมรหัสผ่าน</h1>
          <p style={{ fontSize:14, color:'#6b7280', marginTop:4 }}>แจ้งผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน</p>
        </div>
        <div className="glass-card" style={{ padding:32 }}>
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📧</div>
              <h3 style={{ fontWeight:700, color:'#059669', marginBottom:8 }}>ส่งคำขอสำเร็จ</h3>
              <p style={{ fontSize:14, color:'#6b7280', marginBottom:20 }}>ผู้ดูแลระบบจะดำเนินการรีเซ็ตรหัสผ่านและแจ้งกลับ</p>
              <Link href="/login"><button className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>กลับหน้าเข้าสู่ระบบ</button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:16 }}>
                <label className="form-label">ชื่อผู้ใช้ / อีเมล</label>
                <input className="form-input" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้หรืออีเมลของคุณ" required />
              </div>
              <button className="btn-primary" type="submit" style={{ width:'100%', justifyContent:'center' }}>
                ส่งคำขอรีเซ็ตรหัสผ่าน
              </button>
              <div style={{ textAlign:'center', marginTop:16 }}>
                <Link href="/login" style={{ fontSize:13, color:'#6366f1', fontWeight:600, textDecoration:'none' }}>← กลับหน้าเข้าสู่ระบบ</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
