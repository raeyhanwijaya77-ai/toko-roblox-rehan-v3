'use client';
import { useState, useEffect } from 'react';
export default function Login() {
  const [m, setM] = useState('login'), [email, setEmail] = useState(''), [password, setP] = useState(''), [otp, setO] = useState(''), [e, setE] = useState(''), [info, setI] = useState('');
  const [on, setOn] = useState(false);
  useEffect(() => { fetch('/api/auth').then((r) => r.json()).then((d) => setOn(!!d.otp)).catch(() => {}); }, []);
  const call = (mode) => fetch('/api/auth', { method: 'POST', body: JSON.stringify({ email, password, otp, mode }) }).then(async (r) => { let j = {}; try { j = await r.json(); } catch {} return { ...j, ok: r.ok, error: j.error || (r.ok ? '' : 'Server error ' + r.status) }; }).catch(() => ({ ok: false, error: 'Koneksi gagal, coba lagi' }));
  async function kirim() {
    setE(''); setI('');
    const d = await call('send');
    d.ok ? setI('Kode dikirim ke Gmail kamu (cek juga folder Spam).') : setE(d.error);
  }
  async function sub(ev) {
    ev.preventDefault(); setE('');
    const d = await call(m);
    d.ok ? (location.href = '/') : setE(d.error);
  }
  return (
    <form className="box" onSubmit={sub}>
      <h2>{m === 'login' ? 'Masuk' : 'Daftar Akun'}</h2>
      <p className="mut" style={{ marginBottom: 14 }}>Gunakan Gmail untuk membeli akun.</p>
      <input type="email" placeholder="nama@gmail.com" value={email} onChange={(x) => setEmail(x.target.value)} required />
      {m === 'register' && on && (<>
        <button type="button" className="btn o" style={{ marginBottom: 12 }} onClick={kirim}>Kirim Kode Verifikasi</button>
        <input inputMode="numeric" placeholder="Kode 6 digit dari Gmail" value={otp} onChange={(x) => setO(x.target.value)} required />
      </>)}
      <input type="password" placeholder="Password (min. 6 karakter)" value={password} onChange={(x) => setP(x.target.value)} required />
      <p className="gold">{info}</p><p className="err">{e}</p>
      <button className="btn" style={{ width: '100%' }}>{m === 'login' ? 'Masuk' : 'Daftar'}</button>
      <p className="mut" style={{ marginTop: 14, textAlign: 'center', cursor: 'pointer' }} onClick={() => { setM(m === 'login' ? 'register' : 'login'); setE(''); setI(''); }}>
        {m === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
      </p>
    </form>
  );
}
