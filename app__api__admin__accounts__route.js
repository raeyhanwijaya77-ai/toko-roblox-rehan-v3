import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
const deny = async () => !isAdmin(await getUser());
export async function GET() {
  if (await deny()) return Response.json({}, { status: 403 });
  await init();
  return Response.json(await sql`select * from accounts order by id desc`);
}
export async function POST(req) {
  if (await deny()) return Response.json({}, { status: 403 });
  await init();
  const { title, description, price, images, username, password } = await req.json();
  await sql`insert into accounts(title,description,price,images,username,password) values(${title},${description || ''},${parseInt(price)},${JSON.stringify(images || [])}::jsonb,${username},${password})`;
  return Response.json({ ok: 1 });
}
export async function DELETE(req) {
  if (await deny()) return Response.json({}, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  await sql`delete from accounts where id=${id}`;
  return Response.json({ ok: 1 });
}
