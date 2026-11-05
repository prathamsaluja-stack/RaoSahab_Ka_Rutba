import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the design system page renders both themes without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/design');

  await expect(page.getByRole('heading', { level: 1, name: 'Design system' })).toBeVisible();

  const light = page.locator('[data-theme="light"]');
  const dark = page.locator('[data-theme="dark"]');
  await expect(light).toBeVisible();
  await expect(dark).toBeVisible();

  // Both panels render the full gallery, including the domain components.
  await expect(light.getByRole('heading', { name: 'Domain components' })).toBeVisible();
  await expect(dark.getByRole('heading', { name: 'Domain components' })).toBeVisible();

  // The clock reads from the pinned AS_OF, not the machine clock.
  await expect(light.getByText('1 d 9 h left').first()).toBeVisible();
  await expect(light.getByText('Overdue by 5 d 15 h').first()).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test('the design system page has no serious or critical accessibility violations', async ({
  page,
}) => {
  await page.goto('/design');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(
    blocking.map(
      (violation) =>
        `${violation.id}: ${violation.help} -> ${violation.nodes
          .map((node) => `${node.target.join(' ')} | ${node.failureSummary ?? ''}`)
          .join(' ;; ')}`,
    ),
  ).toEqual([]);
});
