'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { href:'/dashboard',              icon:'🏠', label:'หน้าหลัก',     roles:['admin','teacher','student'] },
  { href:'/dashboard/general-info', icon:'👤', label:'ข้อมูลทั่วไป', roles:['admin','teacher','student'] },
  { href:'/dashboard/exam-results', icon:'📊', label:'ผลการสอบ',     roles:['admin','teacher','student'] },
  { href:'/dashboard/knowledge',    icon:'📚', label:'คลังความรู้',  roles:['admin','teacher','student'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner" style={{ width:40, height:40 }} />
    </div>
  );

  const roleLabel = user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'teacher' ? 'ครูผู้สอน' : 'นักเรียน';
  const roleBadgeClass = user.role === 'admin' ? 'badge-admin' : user.role === 'teacher' ? 'badge-teacher' : 'badge-student';

  return (
    <div style={{ display:'flex' }}>
      {/* Overlay for mobile */}
      {!sidebarOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:40, display:'none' }} onClick={() => setSidebarOpen(true)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <img src="/logo.png" alt="CPR Logo" style={{ width:48, height:48, objectFit:'contain', background:'#fff', borderRadius:'50%', padding:2, flexShrink:0 }} />
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:12, lineHeight:1.2, letterSpacing:'0.5px' }}>CPR GIFTED PROGRAM</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:2 }}>DATABASE</div>
            </div>
          </div>
          {sidebarOpen && (
            <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:8, borderLeft:'3px solid #6366f1' }}>
              <div style={{ color:'rgba(255,255,255,0.9)', fontSize:11, fontWeight:600, lineHeight:1.4 }}>โรงเรียนจตุรพักตรพิมานรัชดาภิเษก</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, marginTop:4, lineHeight:1.3 }}>สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาร้อยเอ็ด</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0 14px 8px' }}>เมนูหลัก</div>
          {NAV_ITEMS.filter(n => n.roles.includes(user.role)).map(item => {
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon" style={{ fontSize:18 }}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#a5b4fc' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderRadius:12, background:'rgba(255,255,255,0.06)', cursor:'pointer' }} onClick={() => setProfileOpen(!profileOpen)}>
            <div className="avatar avatar-placeholder" style={{ width:36, height:36, borderRadius:10, fontSize:14, fontWeight:700 }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'#fff', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name} {user.surname}</div>
              <span className={`badge ${roleBadgeClass}`} style={{ fontSize:10 }}>{roleLabel}</span>
            </div>
          </div>
          {profileOpen && (
            <div style={{ marginTop:8, padding:8, background:'rgba(255,255,255,0.06)', borderRadius:10 }}>
              <button onClick={logout} style={{ width:'100%', padding:'8px 12px', background:'rgba(239,68,68,0.2)', color:'#fca5a5', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                🚪 ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className={`main-content ${sidebarOpen ? '' : 'expanded'}`} style={{ flex:1 }}>
        {/* Header */}
        <header className="header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background:'none', border:'none', cursor:'pointer', width:36, height:36, display:'flex', flexDirection:'column', justifyContent:'center', gap:4, padding:6, borderRadius:8 }}>
            <span style={{ display:'block', height:2, background:'#6366f1', borderRadius:99, width: sidebarOpen ? '100%' : '60%', transition:'width 0.2s' }} />
            <span style={{ display:'block', height:2, background:'#6366f1', borderRadius:99, width:'100%' }} />
            <span style={{ display:'block', height:2, background:'#6366f1', borderRadius:99, width: sidebarOpen ? '60%' : '100%', transition:'width 0.2s' }} />
          </button>

          {/* Breadcrumb */}
          <div style={{ flex:1 }}>
            {NAV_ITEMS.map(item => {
              const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
              if (!isActive) return null;
              return (
                <div key={item.href} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <span style={{ fontSize:15, fontWeight:700, color:'#1e1b4b' }}>{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Right header info */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ textAlign:'right', display:'none' }} className="sm-block">
              <div style={{ fontSize:13, fontWeight:600, color:'#1e1b4b' }}>{user.name} {user.surname}</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{roleLabel}</div>
            </div>
            <div className="avatar avatar-placeholder" style={{ width:38, height:38, fontSize:15, fontWeight:700, cursor:'pointer', borderRadius:12 }}>
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ minHeight:'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
