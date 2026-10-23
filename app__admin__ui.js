'use client';
import { useEffect, useState } from 'react';
const empty = { title: '', description: '', price: '', username: '', password: '' };
export default function UI() {
  const [list, setList] = useState([]), [f, setF] = useState(empty), [imgs, setImgs] = useState([]), [busy, setB] = useState(false), [url, setUrl] = useState(''), [np, setNp] = useState(''), [msg, setMsg] = useState('');
  const load = async () => { try { const d = await (await fetch('/api/admin/accounts')).json(); setList(Array.isArray(d) ? d : []); } catch {} };
  useEffect(() => { load(); }, []);
  async function shrink(file, max = 1000) {
    try {
      const bmp = await createImageBitmap(file);
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.78));
    } catch { return file; }
  }
  async function upload(e) {
    setB(true); setMsg('');
    for (const file of e.target.files) {
      try {
        const blob = await shrink(file);
        let url = null;
        try {
          const fd = new FormData(); fd.append('file', new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
          const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
          url = (await r.json()).url || null;
        } catch {}
        if (!url) url = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
        setImgs((p) => [...p, url]);
      } catch { setMsg('Foto ini gagal diproses, coba foto lain.'); }
    }
    setB(false);
  }
  async function add(e) {
    e.preventDefault(); setB(true);
    const r = await fetch('/api/admin/accounts', { method: 'POST', body: JSON.stringify({ ...f, images: imgs }) });
    setMsg(r.ok ? 'Akun tersimpan ✅' : 'Gagal menyimpan akun');
    if (r.ok) { setF(empty); setImgs([]); }
    setB(false); load();
  }
  const del = async (id) => { if (confirm('Hapus akun ini?')) { await fetch('/api/admin/accounts?id=' + id, { method: 'DELETE' }); load(); } };
  async function chg() {
    const r = await fetch('/api/admin/password', { method: 'POST', body: JSON.stringify({ password: np }) });
    const d = await r.json(); setMsg(r.ok ? 'Password admin diganti ✅' : d.error); if (r.ok) setNp('');
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="w">
      <h2>Admin Panel</h2>
      <p className="gold">{msg}</p>
      <form className="box" style={{ maxWidth: '100%' }} onSubmit={add}>
        <b>Tambah Akun</b>
        <input placeholder="Judul (cth: Akun Lv 100 + Limited)" value={f.title} onChange={set('title')} required />
        <textarea rows="3" placeholder="Deskripsi (item, robux, level, dll)" value={f.description} onChange={set('description')} />
        <input type="number" placeholder="Harga (Rp)" value={f.price} onChange={set('price')} required />
        <input placeholder="Username Roblox" value={f.username} onChange={set('username')} required />
        <input placeholder="Password akun" value={f.password} onChange={set('password')} required />
        <p className="mut">Foto akun:</p>
        <input type="file" accept="image/*" multiple onChange={upload} />
        <input placeholder="atau tempel link foto (https://...)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="button" className="btn o" style={{ marginBottom: 12 }} onClick={() => { if (url.startsWith('http')) { setImgs([...imgs, url]); setUrl(''); } }}>Tambah link foto</button>
        <div className="gal">{imgs.map((s) => <img key={s} src={s} alt="" />)}</div>
        <button className="btn" disabled={busy}>{busy ? 'Tunggu…' : 'Simpan Akun'}</button>
      </form>
      <Pay />
      <div className="box" style={{ maxWidth: '100%' }}>
        <b>Ganti Password Admin</b>
        <input type="text" placeholder="Password baru (min. 6 karakter)" value={np} onChange={(e) => setNp(e.target.value)} />
        <button className="btn o" onClick={chg}>Ganti Password</button>
      </div>
      <h3>Daftar Akun ({list.length})</h3>
      {list.map((a) => (
        <div className="row" key={a.id}>
          <span>{a.title} — <b className="gold">Rp {a.price.toLocaleString('id-ID')}</b> <span className="mut">[{a.status}]</span></span>
          <button className="btn o" onClick={() => del(a.id)}>Hapus</button>
        </div>
      ))}
    </div>
  );
}

function Pay() {
  const [slug, setSlug] = useState(''), [key, setKey] = useState(''), [has, setHas] = useState(false), [m, setM] = useState(''), [o, setO] = useState('');
  useEffect(() => {
    setO(location.origin);
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => { setSlug(d.slug || ''); setHas(!!d.hasKey); }).catch(() => {});
  }, []);
  async function save() {
    const r = await fetch('/api/admin/settings', { method: 'POST', body: JSON.stringify({ slug, key }) });
    setM(r.ok ? 'Pembayaran tersimpan ✅' : 'Gagal menyimpan');
    if (r.ok) { setHas(true); setKey(''); }
  }
  return (
    <div className="box" style={{ maxWidth: '100%' }}>
      <b>Pembayaran Pakasir</b>
      <p className="mut" style={{ margin: '6px 0' }}>Isi Slug dan API Key dari dashboard Pakasir. Webhook URL untuk dashboard Pakasir: <span className="gold">{o}/api/webhook</span></p>
      <input placeholder="Slug proyek Pakasir" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <input type="password" placeholder={has ? 'API Key tersimpan (isi lagi untuk mengganti)' : 'API Key Pakasir'} value={key} onChange={(e) => setKey(e.target.value)} />
      <button className="btn o" onClick={save}>Simpan Pembayaran</button>
      <p className="gold">{m}</p>
    </div>
  );
}
