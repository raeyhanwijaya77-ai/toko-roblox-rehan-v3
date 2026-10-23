import { notFound } from 'next/navigation';
import { sql, init } from '@/lib/db';
import Buy from './buy';
export const dynamic = 'force-dynamic';
export default async function Detail({ params }) {
  const { id } = await params;
  await init();
  const [a] = await sql`select id,title,description,price,images,status from accounts where id=${id}`;
  if (!a) notFound();
  const imgs = a.images || [];
  return (
    <div className="w">
      <a href="/#stok" className="mut">Kembali ke stok</a>
      <div className="det">
        <div>
          <div className="frame big">
            {imgs[0] ? <img src={imgs[0]} alt={a.title} /> : <div className="ph"><i>🎮</i>Foto belum ada</div>}
          </div>
          {imgs.length > 1 && <div className="thumbs">{imgs.map((s) => <a key={s} href={s} target="_blank"><img src={s} alt="" /></a>)}</div>}
        </div>
        <div className="buy">
          <h1>{a.title}</h1>
          <p className="price">Rp {a.price.toLocaleString('id-ID')}</p>
          <p className="desc">{a.description || 'Tidak ada deskripsi tambahan.'}</p>
          <ul className="pts">
            <li>Bayar QRIS, terverifikasi otomatis</li>
            <li>Data login tampil setelah pembayaran lunas</li>
            <li>Admin membantu mengamankan akun</li>
          </ul>
          {a.status === 'sold' ? <b className="err">Sudah terjual</b> : <Buy id={a.id} />}
        </div>
      </div>
    </div>
  );
}
