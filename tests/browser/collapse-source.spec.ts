import { test, expect } from './test';
import reference from './fixtures/ant-design-collapse-reference.json' with { type: 'json' };
import { snapshotCollapseSource } from './collapse-source-metrics';

const root = '[data-collapse-source-frame] > [data-ant-collapse]';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=collapse-source');

  await expect(page.getByRole('heading', { name: 'Source Collapse API', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
});

for (const sample of reference.cases) {
  test(`Collapse matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Collapse source case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotCollapseSource,
      'prefixCls' in sample.props ? sample.props.prefixCls || 'ant-collapse' : 'ant-collapse'))
      .toEqual(sample.snapshot);
  });
}

for (const sample of reference.cases.filter(item => 'trace' in item)) {
  test(`Collapse preserves source callback order for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Collapse source case', exact: true })
      .selectOption(sample.name);
    await page.locator(root).locator('[data-collapse-trigger]').first().click();

    await expect(page.getByLabel('Collapse source events', { exact: true }))
      .toHaveText('trace' in sample ? sample.trace!.join(',') : '');
  });
}

for (const sample of reference.cases.filter(item => 'retainedBodies' in item)) {
  test(`Collapse preserves source hidden content for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Collapse source case', exact: true })
      .selectOption(sample.name);
    await page.locator(root).locator('[data-collapse-trigger]').first().click();

    await expect(page.locator(root).locator('[data-collapse-panel]').first()).toBeHidden();
    await expect(page.locator(root).locator('[data-ant-collapse-part="body"]'))
      .toHaveCount('retainedBodies' in sample ? sample.retainedBodies! : 0);
  });
}

for (const sample of reference.cases.filter(item => 'eventTrace' in item)) {
  test(`Collapse preserves source item events for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Collapse source case', exact: true })
      .selectOption(sample.name);
    const item = page.locator(root).locator('[data-ant-collapse-part="item"]').first();

    if ('events' in sample && sample.events === 'focus') {
      await page.getByRole('textbox', { name: 'Event draft', exact: true }).focus();
      await page.getByRole('button', { name: 'After Collapse source', exact: true }).focus();
    } else if ('events' in sample && sample.events === 'key') {
      await item.locator('[data-collapse-trigger]').press('x');
    } else if ('events' in sample && sample.events === 'mouse') {
      await item.hover();
      await page.mouse.move(reference.viewport.width - 1, reference.viewport.height - 1);
    } else await item.locator('[data-collapse-trigger]').click();

    await expect(page.getByLabel('Collapse source events', { exact: true }))
      .toHaveText('eventTrace' in sample ? sample.eventTrace!.join(',') : '');
  });
}

test('Collapse releases the source item callback ref on unmount', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Collapse source case', exact: true })
    .selectOption('item-ref');
  const sample = reference.cases.find(item => item.name === 'item-ref')!;
  await page.getByRole('button', { name: 'Toggle Collapse source mount', exact: true }).click();

  await expect(page.getByLabel('Collapse source events', { exact: true }))
    .toHaveText('refTrace' in sample ? sample.refTrace!.join(',') : '');
});

for (const sample of reference.cases.filter(item => 'refUpdateTrace' in item)) {
  test(`Collapse preserves source item refs for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Collapse source case', exact: true })
      .selectOption(sample.name);
    const previous = await page.locator(root).locator('[data-ant-collapse-part="item"]')
      .first().elementHandle();
    const replace = sample.name === 'item-ref-replace';
    await page.getByRole('button', { name: replace ? 'Replace Collapse item ref'
      : 'Update Collapse item labels', exact: true }).click();

    await expect(page.locator(root).locator('[data-ant-collapse-part="title"]').first())
      .toHaveText(replace ? 'First title' : 'Updated title');
    expect(await page.locator(root).locator('[data-ant-collapse-part="item"]').first()
      .evaluate((node, old) => node === old, previous)).toBe(true);
    await expect(page.getByLabel('Collapse source events', { exact: true }))
      .toHaveText('refUpdateTrace' in sample ? sample.refUpdateTrace!.join(',') : '');
  });
}

test('Collapse lets a custom expandIcon invoke the source panel callback', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Collapse source case', exact: true })
    .selectOption('custom-icon');
  const sample = reference.cases.find(item => item.name === 'custom-icon')!;
  await page.getByRole('button', { name: 'Invoke Collapse expand icon callback', exact: true })
    .click();

  await expect(page.locator(root).locator('[data-collapse-trigger]').first())
    .toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByLabel('Collapse source events', { exact: true }))
    .toHaveText('iconTrace' in sample ? sample.iconTrace!.join(',') : '');
});

test('Collapse preserves keyed fields, selection, focus and refs across config, prefix and token updates', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Collapse source case', exact: true }).selectOption('rich');
  const draft = page.getByRole('textbox', { name: 'Collapse source draft', exact: true });
  const original = await page.locator(root).elementHandle();
  const originalDraft = await draft.elementHandle();
  await page.getByRole('button', { name: 'Collapse source action 0', exact: true }).click();
  await draft.fill('Retained Collapse draft');
  await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(3, 8));

  for (const name of ['Configure Collapse source', 'Change Collapse source prefix', 'Theme Collapse source']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(page.locator(root)).toHaveClass(/live-collapse/);
  await expect(page.locator(root)).toHaveCSS('background-color', 'rgb(17, 34, 51)');
  await expect(page.locator(root).locator('[data-collapse-trigger]')).toHaveCSS('padding-right', '17px');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Retained Collapse draft');
  expect(await draft.evaluate(node => [(node as HTMLInputElement).selectionStart,
    (node as HTMLInputElement).selectionEnd])).toEqual([3, 8]);
  expect(await draft.evaluate((node, previous) => node === previous, originalDraft)).toBe(true);
  expect(await page.locator(root).evaluate((node, previous) => node === previous, original))
    .toBe(true);
  await expect(page.getByRole('button', { name: 'Collapse source action 1', exact: true }))
    .toBeVisible();
  await expect(page.getByLabel('Collapse source native ref', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Collapse source ref', { exact: true })).toHaveText('true');
});

test('Collapse cleans refs and prefix CSS on unmount and recreates native fields on remount', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Collapse source case', exact: true }).selectOption('rich');
  await page.getByRole('button', { name: 'Change Collapse source prefix', exact: true }).click();
  const style = page.locator('style[data-ant-svelte-theme="collapse-prefix:live-collapse"]');
  await page.getByRole('textbox', { name: 'Collapse source draft', exact: true }).fill('Old draft');

  await expect(style).toHaveCount(1);
  await page.getByRole('button', { name: 'Toggle Collapse source mount', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(0);
  await expect(style).toHaveCount(0);
  await expect(page.getByLabel('Collapse source native ref', { exact: true })).toHaveText('false');
  await expect(page.getByLabel('Collapse source ref', { exact: true })).toHaveText('false');
  await page.getByRole('button', { name: 'Toggle Collapse source mount', exact: true }).click();

  await expect(page.getByRole('textbox', { name: 'Collapse source draft', exact: true }))
    .toHaveValue('Fresh draft');
  await expect(style).toHaveCount(1);
  await expect(page.getByLabel('Collapse source ref', { exact: true })).toHaveText('true');
});
