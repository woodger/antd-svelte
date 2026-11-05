import { test, expect } from './test';
import reference from './fixtures/ant-design-alert-reference.json' with { type: 'json' };
import nativeReference from './fixtures/alert-native-reference.json' with { type: 'json' };
import { snapshotAlertSource } from './alert-source-metrics';

const root = '[data-alert-source-frame] > [data-ant-alert]';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=alert-source');

  await expect(page.getByRole('heading', { name: 'Source Alert API', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
});

for (const sample of reference.cases) {
  const native = nativeReference.cases.find(item => item.name === sample.name);
  test(native ? 'Alert preserves its native blank local close icon'
    : `Alert matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Alert source case', exact: true })
      .selectOption(sample.name);
    const expected = native ? { ...sample.snapshot,
      closeState: { ...sample.snapshot.closeState!, hasSvg: native.hasSvg } } : sample.snapshot;

    await expect.poll(() => page.evaluate(snapshotAlertSource,
      'prefixCls' in sample.props ? sample.props.prefixCls || 'ant-alert' : 'ant-alert'))
      .toEqual(expected);
  });
}

for (const sample of reference.cases.filter(item => 'events' in item)) {
  test(`Alert preserves source callback order for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Alert source case', exact: true })
      .selectOption(sample.name);
    await page.locator(root).getByRole('button').click();

    await expect(page.locator(root)).toHaveCount(0);
    await expect(page.getByLabel('Alert source events', { exact: true }))
      .toHaveText('trace' in sample ? sample.trace!.events.join(',') : '');
    await expect(page.getByRole('button', { name: 'After Alert source', exact: true })).toBeFocused();
    await expect(page.getByLabel('Alert source native ref', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Alert source object ref', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Alert source ref snapshot', { exact: true }))
      .toHaveText(String('trace' in sample && sample.trace!.refHasNode));
  });
}

test('Alert keeps actions, input selection, focus and refs while config, prefix and tokens change', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Alert source case', exact: true }).selectOption('rich');
  const draft = page.getByRole('textbox', { name: 'Alert source draft', exact: true });
  const original = await page.locator(root).elementHandle();
  const originalDraft = await draft.elementHandle();
  await page.getByRole('button', { name: 'Alert source action 0', exact: true }).click();
  await draft.fill('Retained Alert draft');
  await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(3, 8));

  for (const name of ['Configure Alert source', 'Change Alert source prefix', 'Theme Alert source']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(page.locator(root)).toHaveClass(/live-alert/);
  await expect(page.locator(root)).toHaveCSS('border-radius', '19px');
  await expect(page.locator(root)).toHaveCSS('padding-top', '7px');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Retained Alert draft');
  expect(await draft.evaluate(node => [(node as HTMLInputElement).selectionStart,
    (node as HTMLInputElement).selectionEnd])).toEqual([3, 8]);
  expect(await draft.evaluate((node, previous) => node === previous, originalDraft)).toBe(true);
  expect(await page.locator(root).evaluate((node, previous) => node === previous, original))
    .toBe(true);
  await expect(page.getByRole('button', { name: 'Alert source action 1', exact: true }))
    .toBeVisible();
  await expect(page.getByLabel('Alert source native ref', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Alert source object ref', { exact: true })).toHaveText('true');
});

test('Alert cleans refs and prefix CSS on unmount and recreates native fields on remount', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Alert source case', exact: true }).selectOption('rich');
  await page.getByRole('button', { name: 'Change Alert source prefix', exact: true }).click();
  const style = page.locator('style[data-ant-svelte-theme="alert-prefix:live-alert"]');
  await page.getByRole('textbox', { name: 'Alert source draft', exact: true }).fill('Old draft');

  await expect(style).toHaveCount(1);
  await page.getByRole('button', { name: 'Toggle Alert source mount', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(0);
  await expect(style).toHaveCount(0);
  await expect(page.getByLabel('Alert source native ref', { exact: true })).toHaveText('false');
  await expect(page.getByLabel('Alert source object ref', { exact: true })).toHaveText('false');
  await page.getByRole('button', { name: 'Toggle Alert source mount', exact: true }).click();

  await expect(page.getByRole('textbox', { name: 'Alert source draft', exact: true }))
    .toHaveValue('Fresh draft');
  await expect(style).toHaveCount(1);
  await expect(page.getByLabel('Alert source object ref', { exact: true })).toHaveText('true');
});

test('Alert forwards mouse notifications from its passive container and releases them on unmount', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Alert source case', exact: true })
    .selectOption('mouse-events');
  await page.locator(root).hover();
  const bounds = await page.locator(root).boundingBox();
  await page.mouse.move(reference.viewport.width - 1, reference.viewport.height - 1);

  await expect(page.getByLabel('Alert source events', { exact: true })).toHaveText('enter,leave');
  await page.getByRole('button', { name: 'Toggle Alert source mount', exact: true })
    .dispatchEvent('click');
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);

  await expect(page.getByLabel('Alert source events', { exact: true })).toHaveText('enter,leave');
});
