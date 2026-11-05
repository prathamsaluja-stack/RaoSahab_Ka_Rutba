import { expect, test, type Page } from '@playwright/test';

/** Every route in the information architecture, with the heading it must show. */
const ROUTES: { path: string; heading: string }[] = [
  { path: '/today', heading: 'Today' },
  { path: '/members', heading: 'Members' },
  { path: '/members/SYN-HF-001', heading: 'Harold Bellweather (fictional)' },
  { path: '/members/SYN-HF-001/call', heading: 'Call workspace · Harold Bellweather (fictional)' },
  { path: '/tasks', heading: 'Tasks' },
  { path: '/audit', heading: 'Audit log' },
  { path: '/data-sources', heading: 'Data sources' },
  { path: '/design', heading: 'Design system' },
  { path: '/about-data', heading: 'About the data' },
  { path: '/reports', heading: 'Reports' },
  { path: '/settings', heading: 'Settings' },
];

/** Resolves once the shell has hydrated: the toggle only names a theme then. */
async function waitForShell(page: Page) {
  await expect(page.getByRole('button', { name: /Switch to (dark|light) theme/ })).toBeVisible();
}

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('the root redirects to the queue', async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto('/');
  await expect(page).toHaveURL(/\/today$/);
  await waitForShell(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  expect(errors).toEqual([]);
});

for (const route of ROUTES) {
  test(`${route.path} loads inside the shell without console errors`, async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(route.path);

    await waitForShell(page);
    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByText('Data as of Mon 9 Nov, 08:00 ET')).toBeVisible();
    await expect(
      page.getByText('All members and records are fictional.', { exact: false }),
    ).toBeVisible();

    expect(errors).toEqual([]);
  });
}

test('an unknown member identifier renders the not-found page', async ({ page }) => {
  await page.goto('/members/SYN-NOPE-999');
  await expect(page.getByText('This page could not be found')).toBeVisible();
});
