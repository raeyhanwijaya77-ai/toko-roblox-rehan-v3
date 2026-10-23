import { redirect } from 'next/navigation';
import { getUser, isAdmin } from '@/lib/auth';
import UI from './ui';
export default async function Admin() {
  if (!isAdmin(await getUser())) redirect('/login');
  return <UI />;
}
