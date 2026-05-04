'use client';

export default function TcasPage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <iframe
        src="https://script.google.com/macros/s/AKfycbxqr-w28pLuLh4LUTOYDlplatx_Re4kGog2-q-8c9cVC8GwvR6nkkP-WXf7Z4v16xsZ/exec"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="TCAS Score Manager"
        allow="clipboard-write"
      />
    </div>
  );
}
