import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Resolves once the shell has hydrated: the toggle only names a theme then. */
async function waitForShell(page: Page) {
  await expect(page.getByRole('button', { name: /Switch to (dark|light) theme/ })).toBeVisible();
}

test('the sidebar marks the current route and navigates between screens', async ({ page }) => {
  await page.goto('/today');
  await waitForShell(page);

  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page');

  await nav.getByRole('link', { name: 'Tasks' }).click();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(nav.getByRole('link', { name: 'Tasks' })).toHaveAttribute('aria-current', 'page');

  // Breadcrumbs follow the route.
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Tasks');
});

test('the deliberate non-goals say why they are not here', async ({ page }) => {
  await page.goto('/reports');
  await waitForShell(page);
  await expect(page.getByText('Deliberately not in the MVP').first()).toBeVisible();
});

test('g t and g m move between the two main screens', async ({ page }) => {
  await page.goto('/tasks');
  await waitForShell(page);

  await page.keyboard.press('g');
  await page.keyboard.press('t');
  await expect(page).toHaveURL(/\/today$/);

  await page.keyboard.press('g');
  await page.keyboard.press('m');
  await expect(page).toHaveURL(/\/members$/);
});

test('the command palette opens on / and on the keyboard shortcut, and finds a member', async ({
  page,
}) => {
  await page.goto('/today');
  await waitForShell(page);

  await page.keyboard.press('/');
  const search = page.getByRole('combobox', { name: 'Search members and screens' });
  await expect(search).toBeFocused();

  await search.fill('harold');
  const option = page.getByRole('option', { name: /Harold Bellweather/ });
  await expect(option).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/members\/SYN-HF-001$/);

  // Control+K reaches the same palette, and Escape closes it.
  await page.keyboard.press('ControlOrMeta+k');
  await expect(search).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).toBeHidden();
});

test('the shortcut sheet lists the shortcuts it documents', async ({ page }) => {
  await page.goto('/today');
  await waitForShell(page);

  await page.keyboard.press('?');
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Go to Today')).toBeVisible();
  await expect(dialog.getByText('Open the focused row')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('j and k move through the caseload and Enter opens the focused member', async ({ page }) => {
  await page.goto('/members');
  await waitForShell(page);

  await page.getByRole('link', { name: /Harold Bellweather/ }).focus();
  await page.keyboard.press('j');
  await expect(page.getByRole('link', { name: /Priya Castellanos/ })).toBeFocused();

  await page.keyboard.press('k');
  await expect(page.getByRole('link', { name: /Harold Bellweather/ })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/members\/SYN-HF-001$/);
});

test('the theme toggle pins a theme and the choice survives a reload', async ({ page }) => {
  await page.goto('/today');
  await waitForShell(page);

  await page.getByRole('button', { name: /Switch to (dark|light) theme/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
  const pinned = await page.locator('html').getAttribute('data-theme');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', pinned ?? 'dark');
});

test('the synthetic-data banner can be dismissed and stays dismissed', async ({ page }) => {
  await page.goto('/today');
  await waitForShell(page);

  const banner = page.getByText('All members and records are fictional.', { exact: false });
  await expect(banner).toBeVisible();

  await page.getByRole('button', { name: 'Dismiss the synthetic data notice' }).click();
  await expect(banner).toBeHidden();

  await page.goto('/members');
  await waitForShell(page);
  await expect(page.getByRole('button', { name: 'Dismiss the synthetic data notice' })).toHaveCount(
    0,
  );
});

test('the sidebar becomes a drawer below 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/today');
  await waitForShell(page);

  await expect(page.getByTestId('sidebar')).toBeHidden();
  await page.getByRole('button', { name: 'Open navigation' }).click();

  const drawer = page.getByRole('dialog', { name: 'Caseline' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('link', { name: 'Audit log' }).click();
  await expect(page).toHaveURL(/\/audit$/);
});

test('the shell itself has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/today');
  await waitForShell(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});
