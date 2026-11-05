import { test, expect } from './test';
import reference from './fixtures/ant-design-alert-boundary-reference.json' with { type: 'json' };
import { snapshotAlertBoundary } from './alert-boundary-metrics';

const root = '[data-boundary-frame] .ant-alert';
const select = 'Alert boundary case';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=alert-boundary');

  await expect(page.getByRole('heading', { name: 'Source Alert ErrorBoundary API', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Alert.ErrorBoundary matches source recovery for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: select, exact: true }).selectOption(sample.name);
    const defaultStack = sample.props.description == null && !('rich' in sample && sample.rich);

    await expect.poll(() => page.evaluate(snapshotAlertBoundary, defaultStack))
      .toEqual(sample.snapshot);
  });
}

test('Alert.ErrorBoundary preserves healthy input identity, focus and selection through prop updates', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Healthy boundary draft', exact: true });
  const original = await input.elementHandle();
  await input.fill('Unsaved boundary draft');
  await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 8));
  await page.getByRole('button', { name: 'Update boundary title', exact: true }).dispatchEvent('click');
  await page.getByRole('button', { name: 'Configure boundary Alert', exact: true })
    .dispatchEvent('click');

  await expect(page.locator(root)).toHaveCount(0);
  await expect(input).toHaveValue('Unsaved boundary draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate(node => [(node as HTMLInputElement).selectionStart,
    (node as HTMLInputElement).selectionEnd])).toEqual([2, 8]);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.locator('#updated-boundary')).toHaveCount(0);
});

test('Alert.ErrorBoundary retains failure and updates the same fallback until remounted', async ({ page }) => {
  await page.getByRole('button', { name: 'Fail boundary child', exact: true }).click();

  await expect(page.locator(root)).toBeVisible();
  const original = await page.locator(root).elementHandle();
  await page.getByRole('button', { name: 'Recover boundary child', exact: true }).click();
  await page.getByRole('button', { name: 'Update boundary title', exact: true }).click();

  await expect(page.getByRole('textbox', { name: 'Healthy boundary draft', exact: true }))
    .toHaveCount(reference.lifecycle.healthyChildren);
  await expect(page.locator(`${root} .ant-alert-title`)).toHaveText(reference.lifecycle.title);
  await expect(page.locator(root)).toHaveAttribute('id', reference.lifecycle.id);
  expect(await page.locator(root).evaluate((node, old) => node === old, original))
    .toBe(reference.lifecycle.sameRoot);
  await page.getByRole('button', { name: 'Toggle boundary mount', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle boundary mount', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Healthy boundary draft', exact: true }))
    .toHaveValue('Retained draft');
});

test('Alert.ErrorBoundary fallback inherits Alert config and delegates fallback errors to its parent', async ({ page }) => {
  await page.getByRole('combobox', { name: select, exact: true }).selectOption('default-error');
  await page.getByRole('button', { name: 'Configure boundary Alert', exact: true }).click();

  await expect(page.locator(root)).toHaveClass(/boundary-alert/);
  await expect(page.locator(root)).toHaveCSS('padding-top', '7px');
  await expect(page.locator(`${root} .ant-alert-description`))
    .toHaveCSS('color', 'rgb(18, 52, 86)');
  await page.getByRole('button', { name: 'Fail nested boundary fallback', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(reference.nested.alerts);
  await expect(page.locator(`${root} .ant-alert-title`)).toHaveText(reference.nested.title);
  await expect(page.locator(`${root} pre`)).toHaveText(reference.nested.description);
});
