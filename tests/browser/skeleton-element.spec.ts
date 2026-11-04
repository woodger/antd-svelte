import { test, expect } from './test';
import reference from './fixtures/ant-design-skeleton-element-reference.json' with { type: 'json' };
import { snapshotSkeletonElement } from './skeleton-element-metrics';

const root = '[data-skeleton-element-frame] > [data-ant-skeleton-element]';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=skeleton-element');
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
  await expect(page.getByRole('heading', { name: 'Source Skeleton elements', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Skeleton elements match the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Skeleton element case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotSkeletonElement,
      sample.props.prefixCls || 'ant-skeleton')).toEqual(sample.snapshot);
  });
}

test('Skeleton element keeps root and content identity across context, prefix and theme changes', async ({ page }) => {
  const original = await page.locator(root).elementHandle();
  const content = page.locator(root).locator('[data-ant-skeleton-content]');
  const originalContent = await content.elementHandle();
  const input = page.getByRole('textbox', { name: 'Skeleton element draft', exact: true });
  await input.fill('Retained draft');
  await input.focus();

  for (const name of ['Activate Skeleton element', 'Large Skeleton context',
    'Change Skeleton prefix', 'Theme Skeleton element']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(content).toHaveCSS('width', '40px');
  await expect(content).toHaveCSS('height', '40px');
  await expect(content).toHaveClass(/live-skeleton-avatar/);
  await expect(content).toHaveCSS('background-size', '400% 100%');
  expect(await page.locator(root).evaluate((node, old) => node === old, original)).toBe(true);
  expect(await content.evaluate((node, old) => node === old, originalContent)).toBe(true);
  await expect(input).toHaveValue('Retained draft');
  await expect(input).toBeFocused();
});

test('Skeleton input block follows the container while keeping its source minimum width', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Skeleton element case', exact: true })
    .selectOption('input-default');
  await page.getByRole('button', { name: 'Expand Skeleton element', exact: true }).click();

  await expect(page.locator(root)).toHaveCSS('width', '300px');
  await expect(page.locator(root).locator('[data-ant-skeleton-content]')).toHaveCSS('width', '300px');
  await page.getByRole('button', { name: 'Small Skeleton context', exact: true }).click();
  await expect(page.locator(root).locator('[data-ant-skeleton-content]')).toHaveCSS('min-width', '120px');
});

test('Skeleton elements add no controls or live regions and obey reduced motion', async ({ page }) => {
  await page.getByRole('button', { name: 'Activate Skeleton element', exact: true }).click();
  await expect(page.locator(root).locator('[data-ant-skeleton-content]'))
    .toHaveCSS('animation-duration', '1.4s');
  const background = await page.locator(root).locator('[data-ant-skeleton-content]')
    .evaluate(node => getComputedStyle(node).backgroundImage);
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(page.locator(root).locator('[data-ant-skeleton-content]'))
    .toHaveCSS('animation-name', 'none');
  await expect(page.locator(root).locator('[data-ant-skeleton-content]'))
    .toHaveCSS('background-image', background);
  await expect(page.locator(root).getByRole('status')).toHaveCount(0);
  await expect(page.locator(root).locator('input, button, [tabindex]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Before Skeleton element', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After Skeleton element', exact: true })).toBeFocused();
});

test('Skeleton Node internal class replaces its default content class without changing its background', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Skeleton element case', exact: true })
    .selectOption('node-internal-class');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const content = page.locator(root).locator('[data-ant-skeleton-content]');

  await expect(content).toHaveClass(/owner-node/);
  await expect(content).not.toHaveClass(/ant-skeleton-node/);
  await expect(content).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.getByRole('button', { name: 'Activate Skeleton element', exact: true }).click();
  await expect(content).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(content).toHaveCSS('animation-name', 'none');
});

test('Skeleton element unmount removes its custom prefix scope', async ({ page }) => {
  await page.getByRole('button', { name: 'Change Skeleton prefix', exact: true }).click();
  await expect(page.locator(root)).toBeVisible();
  await page.getByRole('button', { name: 'Toggle Skeleton element mount', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme="skeleton-prefix:live-skeleton"]'))
    .toHaveCount(0);
});

test('Skeleton theme updates both main and primitive placeholders without replacing the node snippet', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Skeleton element case', exact: true })
    .selectOption('node-default');
  await page.getByRole('button', { name: 'Interactive Skeleton node', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Skeleton node draft', exact: true });
  const original = await input.elementHandle();
  await input.fill('Preserved node draft');
  await page.getByRole('button', { name: 'Node counter 0', exact: true }).click();
  await input.focus();

  for (const name of ['Change Skeleton prefix', 'Theme Skeleton element']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(input).toHaveValue('Preserved node draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.getByRole('button', { name: 'Node counter 1', exact: true })).toBeVisible();
  const main = page.locator('[data-skeleton-main-preview]');
  await expect(main.locator('.ant-skeleton-title')).toHaveCSS('height', '20px');
  await expect(main.locator('.ant-skeleton-title')).toHaveCSS('border-radius', '9px');
  await expect(main.locator('.ant-skeleton-paragraph > li').first()).toHaveCSS('height', '18px');
  await expect(main.locator('.ant-skeleton-paragraph')).toHaveCSS('margin-top', '31px');
  await expect(main.locator('.ant-skeleton-title')).toHaveCSS('background-color', 'rgb(17, 34, 51)');
});
