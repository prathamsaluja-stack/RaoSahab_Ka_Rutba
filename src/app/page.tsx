import { APP_NAME, AS_OF } from '@/lib/app-config';

/**
 * Placeholder landing page. Task 3 replaces it with the app shell and a
 * redirect to /today.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-6 py-16 md:px-8">
      <p className="font-mono text-[13px] tracking-wide text-text-muted uppercase">
        Prototype scaffold
      </p>
      <h1 className="mt-3 text-[30px] font-semibold text-text">{APP_NAME}</h1>
      <p className="mt-3 max-w-[60ch] text-[16px] text-text-muted">
        Care-management workbench wireframes for a health plan. Screens, data and signals arrive in
        later tasks.
      </p>
      <p
        className="mt-8 rounded-[10px] border p-5 text-text"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        All members and records in this prototype are fictional. No real patient data is used
        anywhere.
      </p>
      <p className="mt-6 font-mono text-[13px] text-text-muted">
        Data as of <time dateTime={AS_OF}>Mon 9 Nov, 08:00 ET</time>
      </p>
    </main>
  );
}
