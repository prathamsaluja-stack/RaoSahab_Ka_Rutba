/**
 * Screenshot capture for the presentation gallery.
 *
 * Builds the app (unless SKIP_BUILD is set), serves it on a free port, walks
 * the screens the deck needs and writes them to docs/screenshots/. Every shot
 * is 1440x900 at deviceScaleFactor 2, full page, light theme unless the entry
 * pins a dark one.
 *
 * Usage: pnpm screenshots
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Page } from '@playwright/test';

// tsx compiles this to CJS, so the package root comes from the pnpm script's cwd.
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'screenshots');

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

type Theme = 'light' | 'dark';

type Shot = {
  /** Output file name, without the .png extension. */
  name: string;
  /** Route to visit. */
  route: string;
  /** What the shot shows, printed as the script runs. */
  caption: string;
  theme?: Theme;
  /**
   * 'page' grows the viewport to the whole document so the fixed sidebar and
   * top bar span it. 'viewport' keeps 1440x900, which is what an overlay shot
   * needs: a dialog is fixed to the viewport, so a taller frame would strand
   * it in the middle of a half-dimmed page.
   */
  frame?: 'page' | 'viewport';
  /** Interaction that puts the screen in the state the deck wants. */
  prepare?: (page: Page) => Promise<void>;
};

const GOLDEN = {
  harold: 'SYN-HF-001',
  priya: 'SYN-DM-002',
  marcus: 'SYN-ED-003',
  jade: 'SYN-BH-004',
  eleanor: 'SYN-DUAL-005',
} as const;

/**
 * The queue body scrolls inside a 36rem well on screen. For the deck the whole
 * list has to be visible at once, so the cap comes off before the shot.
 */
async function unclipQueue(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('.max-h-\\[36rem\\]').forEach((element) => {
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
    });
  });
}

async function openMedicationsTab(page: Page) {
  await page.getByRole('tab', { name: /medications/i }).click();
  await page.getByRole('tabpanel').first().waitFor();
  await page.waitForTimeout(400);
}

const SHOTS: Shot[] = [
  {
    name: '01-today-queue',
    route: '/today',
    caption: 'Today — the full prioritised queue with clocks, reasons and actions.',
    prepare: unclipQueue,
  },
  {
    name: '02-today-dismiss-dialog',
    frame: 'viewport',
    route: '/today',
    caption: 'Today — dismissing a row, with a reason required before it records.',
    prepare: async (page) => {
      await page
        .getByRole('button', { name: /^Row actions for/ })
        .first()
        .click();
      await page.getByRole('button', { name: /Dismiss from today/ }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(400);
    },
  },
  {
    name: '03-member-harold-overview',
    route: `/members/${GOLDEN.harold}`,
    caption: 'Member Story — Harold Bellweather, Overview tab.',
  },
  {
    name: '04-member-priya-overview',
    route: `/members/${GOLDEN.priya}`,
    caption: 'Member Story — Priya Castellanos, Overview tab.',
  },
  {
    name: '05-member-marcus-overview',
    route: `/members/${GOLDEN.marcus}`,
    caption: 'Member Story — Marcus Okonkwo-Lane, Overview tab.',
  },
  {
    name: '06-member-jade-overview',
    route: `/members/${GOLDEN.jade}`,
    caption: 'Member Story — Jade Wintermoor, Overview tab.',
  },
  {
    name: '07-member-eleanor-overview',
    route: `/members/${GOLDEN.eleanor}`,
    caption: 'Member Story — Eleanor Fairweather, Overview tab.',
  },
  {
    name: '08-harold-medications-matrix',
    route: `/members/${GOLDEN.harold}`,
    caption: "Harold's medication matrix — claims, pharmacy and member report side by side.",
    prepare: openMedicationsTab,
  },
  {
    name: '09-harold-medications-reconcile',
    frame: 'viewport',
    route: `/members/${GOLDEN.harold}`,
    caption: 'Reconcile dialog — the three-source conflict, resolved by a clinician.',
    prepare: async (page) => {
      await openMedicationsTab(page);
      await page.getByRole('button', { name: /^Reconcile \d+ row/ }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(400);
    },
  },
  {
    name: '10-harold-call-workspace',
    route: `/members/${GOLDEN.harold}/call`,
    caption: 'Call Workspace — mid-call: guide, assessment and the drafted note.',
  },
  {
    name: '11-harold-call-sign-dialog',
    frame: 'viewport',
    route: `/members/${GOLDEN.harold}/call`,
    caption: 'Call Workspace — the sign confirmation, listing everything the signature writes.',
    prepare: async (page) => {
      await page.getByRole('button', { name: /^Sign as / }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(400);
    },
  },
  {
    name: '12-design-system',
    route: '/design',
    caption: 'Design system — tokens, primitives and domain components in both themes.',
  },
  {
    name: '13-today-queue-dark',
    route: '/today',
    caption: 'Today — the same queue in the dark theme.',
    theme: 'dark',
    prepare: unclipQueue,
  },
  {
    name: '14-member-harold-overview-dark',
    route: `/members/${GOLDEN.harold}`,
    caption: "Member Story — Harold's Overview tab in the dark theme.",
    theme: 'dark',
  },
];

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (typeof address === 'string' || address === null) {
        reject(new Error('could not resolve a free port'));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', shell: true });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)),
    );
  });
}

async function waitForServer(url: string, child: ChildProcess) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`server exited with ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`server did not become ready at ${url}`);
}

/**
 * Settle the page before shooting: routed, fonts loaded, no animation still
 * running. Network idle alone is not enough — dialogs fade in.
 */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}

async function main() {
  const port = await freePort();
  const baseURL = `http://127.0.0.1:${port}`;

  if (!process.env.SKIP_BUILD) {
    await run('pnpm', ['build']);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const server = spawn('pnpm', ['start', '--port', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'inherit'],
    shell: true,
    // Killing the shell has to take the Next server with it.
    detached: true,
  });

  const browser = await chromium.launch();
  try {
    await waitForServer(`${baseURL}/today`, server);

    for (const shot of SHOTS) {
      const theme = shot.theme ?? 'light';
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: SCALE,
        colorScheme: theme,
        reducedMotion: 'reduce',
        baseURL,
      });
      // The shell reads a pinned theme from localStorage before first paint.
      await context.addInitScript((pinned) => {
        try {
          localStorage.setItem('caseline.theme', pinned);
        } catch {
          // A blocked storage API falls back to the colour-scheme emulation.
        }
      }, theme as string);

      const page = await context.newPage();
      await page.goto(shot.route, { waitUntil: 'domcontentloaded' });
      await settle(page);
      if (shot.prepare) {
        await shot.prepare(page);
        await settle(page);
      }

      if ((shot.frame ?? 'page') === 'page') {
        const height = await page.evaluate(
          () => document.documentElement.scrollHeight || document.body.scrollHeight,
        );
        if (height > VIEWPORT.height) {
          await page.setViewportSize({ width: VIEWPORT.width, height: Math.ceil(height) });
          await settle(page);
        }
      }

      const file = path.join(OUT_DIR, `${shot.name}.png`);
      await page.screenshot({ path: file });
      console.log(`${shot.name}.png — ${shot.caption}`);
      await context.close();
    }
  } finally {
    await browser.close();
    if (server.pid !== undefined) {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch {
        server.kill('SIGTERM');
      }
    }
  }

  console.log(`\n${SHOTS.length} screenshots written to ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
