import { test, expect } from './test';
import reference from './fixtures/ant-design-result-reference.json' with { type: 'json' };
import { snapshotResultSource } from './result-source-metrics';

const root = '[data-result-source-frame] > [data-ant-result]';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=result-source');

  await expect(page.getByRole('heading', { name: 'Source Result API', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
});

for (const sample of reference.cases) {
  test(`Result matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Result source case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotResultSource,
      'prefixCls' in sample.props ? sample.props.prefixCls || 'ant-result' : 'ant-result'))
      .toEqual(sample.snapshot);
  });
}

for (const [status, title] of [
  ['403', 'Unauthorized'], ['404', 'No Found'], ['500', 'Server Error']
]) {
  test(`Result static ${status} image retains the source accessible title and Tab behavior`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Result source case', exact: true })
      .selectOption(`static-${status}`);
    const image = page.locator('[data-result-source-frame] > svg');

    await expect(image).toHaveAccessibleName(title);
    await expect(image).not.toHaveAttribute('aria-hidden');
    await page.getByRole('button', { name: 'Before Result source', exact: true }).focus();
    await page.keyboard.press('Tab');

    await expect(page.getByRole('button', { name: 'After Result source', exact: true })).toBeFocused();
  });
}

test('Result keeps DOM, actions, drafts, selection and refs through live config and theme changes', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Result source case', exact: true }).selectOption('rich');
  const draft = page.getByRole('textbox', { name: 'Result source draft', exact: true });
  const original = await page.locator(root).elementHandle();
  const originalDraft = await draft.elementHandle();
  await page.getByRole('button', { name: 'Result source action 0', exact: true }).click();
  await draft.fill('Retained Result draft');
  await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(3, 8));

  for (const name of ['Configure Result source', 'Change Result source prefix',
    'Theme Result source', 'RTL Result source']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(page.locator(root)).toHaveClass(/live-result/);
  await expect(page.locator(root)).toHaveAttribute('dir', 'rtl');
  await expect(page.locator(root).locator('[data-ant-result-part="title"]'))
    .toHaveCSS('color', 'rgb(51, 85, 119)');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Retained Result draft');
  expect(await draft.evaluate(node => [(node as HTMLInputElement).selectionStart,
    (node as HTMLInputElement).selectionEnd])).toEqual([3, 8]);
  expect(await draft.evaluate((node, previous) => node === previous, originalDraft)).toBe(true);
  expect(await page.locator(root).evaluate((node, previous) => node === previous, original))
    .toBe(true);
  await expect(page.getByRole('button', { name: 'Result source action 1', exact: true }))
    .toBeVisible();
  for (const name of ['Result source native ref', 'Result source object ref']) {
    await expect(page.getByLabel(name, { exact: true })).toHaveText('true');
  }
  await expect(page.locator('#result-source-sibling .ant-result-title')).toHaveCSS('font-size', '15px');
  await expect(page.locator('#result-source-sibling .anticon')).toHaveCSS('font-size', '33px');
});

test('Result releases prefix CSS and refs on unmount and recreates native draft state', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Result source case', exact: true }).selectOption('rich');
  await page.getByRole('button', { name: 'Change Result source prefix', exact: true }).click();
  const style = page.locator('style[data-ant-svelte-theme="result-prefix:live-result"]');
  await page.getByRole('textbox', { name: 'Result source draft', exact: true }).fill('Old draft');

  await expect(style).toHaveCount(1);
  await page.getByRole('button', { name: 'Toggle Result source mount', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(0);
  await expect(style).toHaveCount(0);
  for (const name of ['Result source native ref', 'Result source object ref']) {
    await expect(page.getByLabel(name, { exact: true })).toHaveText('false');
  }
  await page.getByRole('button', { name: 'Toggle Result source mount', exact: true }).click();

  await expect(page.getByRole('textbox', { name: 'Result source draft', exact: true }))
    .toHaveValue('Fresh draft');
  await expect(style).toHaveCount(1);
  await expect(page.getByLabel('Result source object ref', { exact: true })).toHaveText('true');
});

test('Result preserves decorative icons and native focus recovery with custom prefixes', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Result source case', exact: true })
    .selectOption('custom-icon');
  await page.getByRole('button', { name: 'Change Result source prefix', exact: true }).click();

  await expect(page.locator(root).locator('[data-ant-result-part="icon"]'))
    .toHaveAttribute('inert', '');
  await expect(page.getByRole('button', { name: 'Decorative Result source control', exact: true }))
    .toHaveCount(0);
  await page.getByRole('button', { name: 'Before Result source', exact: true }).focus();
  await page.keyboard.press('Tab');

  await expect(page.getByRole('button', { name: 'After Result source', exact: true })).toBeFocused();
  await page.getByRole('combobox', { name: 'Result source case', exact: true }).selectOption('rich');
  await page.getByRole('button', { name: 'Result source action 0', exact: true }).focus();
  await page.getByRole('button', { name: 'Toggle Result source mount', exact: true })
    .dispatchEvent('click');

  await expect(page.getByRole('button', { name: 'After Result source', exact: true })).toBeFocused();
});
