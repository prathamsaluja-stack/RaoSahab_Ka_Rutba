import { redirect } from 'next/navigation';

/** Section 5: the root redirects to the queue. */
export default function RootPage() {
  redirect('/today');
}
