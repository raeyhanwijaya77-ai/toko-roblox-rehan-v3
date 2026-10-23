import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import { sql, init } from '@/lib/db';
import { setSession, hashPw, checkPw } from '@/lib/auth';
const err = (m, s = 400) => Response.json({ error: m }, { status: s });
const OTP = () => !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
export async function GET() { return Response.json({ otp: OTP() }); }
export async function POST(req) {
  try { return await main(req); } catch (x) { return err('Server error: ' + (x?.message || x), 500); }
}
async function main(req) {
  await init();
  const { email, password, mode, otp } = await req.json();
  const e = String(email || '').toLowerCase().trim();
  if (!/^[a-z0-9._+-]+@gmail\.com$/.test(e)) return err('Gunakan alamat Gmail yang valid');
  const [u] = await sql`select * from users where email=${e}`;
  if (mode === 'send') {
    if (u) return err('Gmail sudah terdaftar, silakan login');
    const [r] = await sql`select 1 from otps where email=${e} and sent>now()-interval '60 seconds'`;
    if (r) return err('Tunggu 1 menit sebelum kirim ulang');
    const code = String(crypto.randomInt(100000, 1000000));
    await sql`insert into otps(email,code,sent,tries) values(${e},${code},now(),0) on conflict(email) do update set code=${code},sent=now(),tries=0`;
    try {
      const t = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
      await t.sendMail({ from: `Toko Akun Rehan <${process.env.GMAIL_USER}>`, to: e, subject: 'Kode verifikasi Toko Akun Rehan', text: `Kode verifikasi kamu: ${code}\nBerlaku 10 menit. Jangan bagikan ke siapa pun.` });
    } catch { return err('Gagal kirim email. Cek GMAIL_USER dan GMAIL_APP_PASSWORD di Vercel', 502); }
    return Response.json({ ok: 1 });
  }
  if (!password || password.length < 6) return err('Password minimal 6 karakter');
  if (mode === 'register') {
    if (u) return err('Gmail sudah terdaftar, silakan login');
    if (OTP()) {
    const [o] = await sql`select * from otps where email=${e} and sent>now()-interval '10 minutes'`;
    if (!o || o.tries >= 5) return err('Kode kedaluwarsa, kirim ulang kode');
    if (o.code !== String(otp || '').trim()) { await sql`update otps set tries=tries+1 where email=${e}`; return err('Kode salah'); }
    await sql`delete from otps where email=${e}`;
    }
    const h = hashPw(password);
    const [n] = await sql`insert into users(email,pass) values(${e},${h}) returning id,email`;
    await setSession(n);
    return Response.json({ ok: 1 });
  }
  if (!u || !checkPw(password, u.pass)) return err('Email atau password salah', 401);
  await setSession(u);
  return Response.json({ ok: 1 });
}
