import Link from 'next/link';
import { sql, init } from '@/lib/db';
export const dynamic = 'force-dynamic';
const CH = process.env.NEXT_PUBLIC_WA_CHANNEL || 'https://whatsapp.com/channel/0029VbCOpsZ2UPB9asft7t05';
export default async function Home() {
  await init();
  const rows = await sql`select id,title,price,images->>0 as cover,jsonb_array_length(images) as n from accounts where status='available' or (status='reserved' and reserved_at<now()-interval '15 minutes') order by id desc`;
  return (
    <div className="w">
      <section className="hero2">
        <div>
          <h1>Akun Roblox siap pakai, dikirim begitu pembayaran masuk.</h1>
          <p className="lead">Pilih akun, bayar lewat QRIS, dan data login langsung muncul di layar. Admin siap membantu mengamankan akun setelahnya.</p>
          <div className="acts">
            <a href="#stok" className="btn">Lihat stok akun</a>
            <a href={CH} target="_blank" className="btn o">Saluran WhatsApp</a>
          </div>
        </div>
        <ol className="steps">
          <li><span className="num">1</span><div><b>Pilih akun</b><small>Lihat foto dan detail sebelum membeli.</small></div></li>
          <li><span className="num">2</span><div><b>Bayar dengan QRIS</b><small>Scan dari e-wallet atau m-banking.</small></div></li>
          <li><span className="num">3</span><div><b>Terima akun</b><small>Username dan password tampil otomatis.</small></div></li>
        </ol>
      </section>
      <div className="sh" id="stok"><h2>Stok akun</h2><span className="mut">{rows.length} tersedia</span></div>
      {!rows.length && (
        <div className="empty">
          <h3>Stok sedang kosong</h3>
          <p>Akun baru diumumkan lebih dulu di saluran WhatsApp.</p>
          <a href={CH} target="_blank" className="btn">Buka saluran</a>
        </div>
      )}
      <div className="grid">
        {rows.map((a) => (
          <Link key={a.id} href={`/akun/${a.id}`} className="card">
            <div className="frame">
              {a.cover ? <img src={a.cover} alt={a.title} loading="lazy" /> : <div className="ph"><i>🎮</i>Foto belum ada</div>}
              <span className="tag ok">Ready</span>
              {a.n > 1 && <span className="tag n">{a.n} foto</span>}
            </div>
            <div className="cb">
              <h3>{a.title}</h3>
              <div className="pr"><span className="price">Rp {a.price.toLocaleString('id-ID')}</span><span className="go">Lihat detail</span></div>
            </div>
          </Link>
        ))}
      </div>
      <p className="ft">Toko Akun Rehan. Pembayaran QRIS otomatis.</p>
    </div>
  );
}
