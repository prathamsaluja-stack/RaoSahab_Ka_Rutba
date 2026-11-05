import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/app-config';
import { DesignGallery } from './design-gallery';
import { COLOR_TOKENS, RADII, SPACING, TYPE_SCALE } from './design-tokens';

export const metadata: Metadata = {
  title: `Design system · ${APP_NAME}`,
  description: 'Every token, primitive and domain component in both themes.',
};

function ThemePanel({ theme, children }: { theme: 'light' | 'dark'; children: React.ReactNode }) {
  const title = theme === 'light' ? 'Light theme' : 'Dark theme';
  return (
    <section
      aria-labelledby={`theme-${theme}`}
      data-theme={theme}
      className="rounded-[var(--radius-card)] bg-[var(--canvas)] text-text"
    >
      <h2 id={`theme-${theme}`} className="px-6 pt-6 pb-4 text-lg font-semibold text-text">
        {title}
      </h2>
      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-2xs tracking-wide text-text-muted uppercase">Prototype</p>
        <h1 className="text-2xl font-semibold text-text">Design system</h1>
        <p className="max-w-[72ch] text-base text-text-muted">
          Every token, primitive and domain component {APP_NAME} is built from, in both themes.
          Freshness, urgency and status always carry words as well as colour, so nothing on a screen
          depends on hue alone.
        </p>
      </header>

      <section aria-labelledby="tokens" className="flex flex-col gap-4">
        <h2 id="tokens" className="text-lg font-semibold text-text">
          Color tokens
        </h2>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Color tokens with their light and dark values and their use
            </caption>
            <thead>
              <tr className="bg-[var(--surface-muted)]">
                {['Token', 'Light', 'Dark', 'Use'].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="border-b border-[var(--border)] px-4 py-2 text-left text-2xs font-medium tracking-wide text-text-muted uppercase"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COLOR_TOKENS.map((token) => (
                <tr key={token.name} className="border-b border-[var(--border)] last:border-b-0">
                  <th scope="row" className="px-4 py-2 text-left font-mono text-xs font-normal">
                    {token.name}
                  </th>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <span
                        aria-hidden="true"
                        className="inline-block size-4 rounded-[4px] border border-[var(--border)]"
                        style={{ background: token.light }}
                      />
                      {token.light}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <span
                        aria-hidden="true"
                        className="inline-block size-4 rounded-[4px] border border-[var(--border)]"
                        style={{ background: token.dark }}
                      />
                      {token.dark}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-text-muted">{token.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted">
          Every text-on-background pair in both themes was measured for WCAG 2.2 AA; the lowest
          ratio is 4.74:1, so the published values are used unchanged. One token was added:
          <span className="font-mono"> --on-accent</span>, because white text on the dark
          theme&rsquo;s brand and urgent fills reads at 2.6:1.
        </p>
      </section>

      <section aria-labelledby="type" className="flex flex-col gap-4">
        <h2 id="type" className="text-lg font-semibold text-text">
          Type, spacing and shape
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-text">Type scale</h3>
            <p className="mt-1 text-xs text-text-muted">
              Inter for the interface, IBM Plex Mono for IDs and raw timestamps. Weights 400, 500
              and 600 only.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {TYPE_SCALE.map((step) => (
                <li key={step.size} className="flex items-baseline justify-between gap-4">
                  <span className={step.className}>Aa {step.size}</span>
                  <span className="text-2xs text-text-muted">{step.use}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-xs text-text-muted">
              SYN-HF-001 · 2026-11-06T16:45:00-05:00
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-text">Spacing (4-pt grid)</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {SPACING.map((step) => (
                <li key={step.label} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-3 rounded-[2px] bg-[var(--brand-soft)]"
                    style={{ width: step.px }}
                  />
                  <span data-tabular className="text-2xs text-text-muted">
                    {step.label} px
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-text">Radii and elevation</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {RADII.map((radius) => (
                <li key={radius.name} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-block size-10 border border-[var(--border)] bg-[var(--surface-muted)]"
                    style={{ borderRadius: radius.value }}
                  />
                  <span className="text-2xs text-text-muted">
                    <span className="font-mono">{radius.name}</span> · {radius.value} · {radius.use}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-2xs text-text-muted">
              Hairline borders carry structure. Shadows appear on overlays only: popover, dialog,
              drawer and toast.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="components" className="flex flex-col gap-4">
        <h2 id="components" className="text-lg font-semibold text-text">
          Components
        </h2>
        <p className="max-w-[72ch] text-xs text-text-muted">
          The same gallery is rendered once per theme. Both panels are live: open the dialog, the
          drawer and the popover in either one.
        </p>
        <div className="grid gap-6 xl:grid-cols-2">
          <ThemePanel theme="light">
            <DesignGallery idPrefix="light" />
          </ThemePanel>
          <ThemePanel theme="dark">
            <DesignGallery idPrefix="dark" />
          </ThemePanel>
        </div>
      </section>
    </div>
  );
}
