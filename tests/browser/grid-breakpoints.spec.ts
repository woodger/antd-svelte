import { test, expect } from './test';
import reference from './fixtures/ant-design-grid-breakpoints-reference.json' with { type: 'json' };
import { gridBreakpointsSampleKey } from './fixtures/grid-breakpoints-presets';
import { snapshotGridBreakpoints } from './grid-breakpoints-metrics';

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=grid-breakpoints'); });

for (const sample of reference.cases) {
  for (const [width, expected] of Object.entries(sample.viewports)) {
    test(`Grid global media matches source ${gridBreakpointsSampleKey(sample)} at ${width}px`,
      async ({ page }) => {
        await page.getByRole('combobox', { name: 'Grid breakpoint case', exact: true })
          .selectOption(gridBreakpointsSampleKey(sample));
        await page.setViewportSize({ width: Number(width), height: 1000 });

        await expect.poll(() => page.evaluate(snapshotGridBreakpoints)).toEqual(expected);
      });
  }
}

test('Grid breakpoint updates preserve DOM, editor, refs, focus and form value', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.getByLabel('Stateful Grid breakpoints', { exact: true }).check();
  const root = page.locator('#grid-breakpoints-control');
  const row = root.locator('.ant-row').first();
  const col = row.locator('.ant-col').first();
  const input = root.getByRole('textbox', { name: 'Grid breakpoint draft', exact: true });
  await input.fill('Breakpoint draft');
  await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 7, 'backward'));
  const previousRow = await row.elementHandle();
  const previousCol = await col.elementHandle();
  const previousInput = await input.elementHandle();
  await expect(input).toBeFocused();

  await page.getByRole('combobox', { name: 'Grid breakpoint case', exact: true })
    .selectOption('shifted:ltr:normal');

  await expect(col).toHaveCSS('flex-basis', '50%');
  await expect(row).toHaveCSS('row-gap', '12px');
  await expect(input).toHaveValue('Breakpoint draft');
  await expect(input).toBeFocused();
  expect(await row.evaluate((node, old) => node === old, previousRow)).toBe(true);
  expect(await col.evaluate((node, old) => node === old, previousCol)).toBe(true);
  expect(await input.evaluate((node, old) => node === old, previousInput)).toBe(true);
  expect(await input.evaluate(node => {
    const field = node as HTMLInputElement;
    return [field.selectionStart, field.selectionEnd, field.selectionDirection];
  })).toEqual([2, 7, 'backward']);
  expect(await root.getByRole('form').evaluate(node =>
    new FormData(node as HTMLFormElement).get('draft'))).toBe('Breakpoint draft');
  await expect(root.getByLabel('Grid breakpoint refs', { exact: true })).toHaveText('true:true');
  await expect(page.locator('#grid-breakpoints-neighbor .ant-col')).toHaveCSS('flex-basis', '25%');
});

test('Grid media remain isolated with shared cssVar key and hashed disabled', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.getByRole('combobox', { name: 'Grid breakpoint case', exact: true })
    .selectOption('custom-prefix:ltr:normal');
  const root = page.locator('#grid-breakpoints-control');

  await expect(root.locator('.ant-row').first().locator('.ant-col').last())
    .toHaveCSS('flex-basis', 'auto');
  await expect(page.locator('#grid-breakpoints-neighbor .ant-col')).toHaveCSS('flex-basis', '25%');

  await page.getByLabel('Mount Grid breakpoint neighbor', { exact: true }).uncheck();

  await expect(page.locator('#grid-breakpoints-neighbor')).toHaveCount(0);
  await expect(root.locator('.ant-row').first().locator('.ant-col').last())
    .toHaveCSS('flex-basis', 'auto');
});

test('Grid reset and unmount restore default media and remove owned style scopes', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.getByRole('combobox', { name: 'Grid breakpoint case', exact: true })
    .selectOption('shifted:ltr:nested');
  const col = page.locator('#grid-breakpoints-control .ant-row').first()
    .locator('.ant-col').first();
  await expect(col).toHaveCSS('flex-basis', '50%');
  const scope = await col.evaluate(node => [...node.classList].find(name =>
    name.startsWith('ant-grid-media-'))!);
  await expect(page.locator(`head style[data-ant-svelte-theme="${scope}"]`)).toHaveCount(1);

  await page.getByLabel('Inherit Grid breakpoints', { exact: true }).uncheck();

  await expect(col).toHaveCSS('flex-basis', '33.3333%');
  await expect(col).not.toHaveClass(/ant-grid-custom-media/);

  await page.getByLabel('Mount Grid breakpoints', { exact: true }).uncheck();

  await expect(page.locator('#grid-breakpoints-control')).toHaveCount(0);
  await expect(page.locator(`head style[data-ant-svelte-theme="${scope}"]`)).toHaveCount(0);
});
