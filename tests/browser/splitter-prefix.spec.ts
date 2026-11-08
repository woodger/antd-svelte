import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-splitter-prefix-reference.json' with { type: 'json' };
import isolated from './fixtures/ant-design-splitter-prefix-isolated.json' with { type: 'json' };
import { snapshotSplitterPrefix } from './splitter-prefix-metrics';

for (const entry of reference.cases) {
  test(`Splitter prefixes match source classes and geometry for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=splitter-prefix');
    await page.getByRole('combobox', { name: 'Splitter prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotSplitterPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, prefix: string) {
  await page.getByRole('textbox', { name: 'Live Splitter prefix value', exact: true })
    .evaluate((node: HTMLInputElement, value) => {
      node.value = value;
      node.dispatchEvent(new Event('input', { bubbles: true }));
    }, prefix);
}

test('Splitter prefix updates retain panels, dragger, editor draft and focus', async ({ page }) => {
  await page.goto('/?fixture=splitter-prefix');
  await page.getByRole('checkbox', { name: 'Live Splitter prefix', exact: true }).check();
  const scope = page.locator('[data-splitter-prefix-scope="normal"]');
  const root = scope.locator(':scope > div');
  const oldRoot = await root.elementHandle();
  const panels = root.locator(':scope > div:not([data-ant-splitter-bar])');
  const oldPanels = await panels.elementHandles();
  const dragger = root.getByRole('separator');
  const oldDragger = await dragger.elementHandle();
  const input = scope.getByRole('textbox', { name: 'normal panel editor', exact: true });
  const oldInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotSplitterPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    for (let index = 0; index < oldPanels.length; index++) {
      expect(await panels.nth(index).evaluate((node, old) => node === old, oldPanels[index]))
        .toBe(step.samePanels);
    }
    expect(await dragger.evaluate((node, old) => node === old, oldDragger)).toBe(step.sameDragger);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
  }
});

test('Splitter prefix changes preserve a pending lazy drag and update its preview namespace', async ({ page }) => {
  await page.goto('/?fixture=splitter-prefix');
  await page.getByRole('checkbox', { name: 'Live Splitter prefix', exact: true }).check();
  const scope = page.locator('[data-splitter-prefix-scope="normal"]');
  const root = scope.locator(':scope > div');
  const dragger = root.getByRole('separator');
  const box = (await dragger.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 4;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 30, y);
  const preview = root.locator('.suite-splitter-bar-preview');
  const oldPreview = await preview.elementHandle();

  await expect(preview).toHaveCSS('--suite-splitter-bar-preview-offset', '30px');
  await expect(preview).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 30, 0)');
  await setPrefix(page, 'next');
  const changed = root.locator('.next-splitter-bar-preview');

  expect(await changed.evaluate((node, old) => node === old, oldPreview)).toBe(true);
  await expect(changed).toHaveCSS('--next-splitter-bar-preview-offset', '30px');
  await expect(changed).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 30, 0)');
  await expect(root.locator('.next-splitter-mask')).toHaveCSS('position', 'fixed');
  await expect(root.locator('.next-splitter-panel').first()).toHaveCSS('flex-basis', '192px');
  await page.mouse.move(x + 50, y);
  await page.mouse.up();

  await expect(root.locator('.next-splitter-panel').first()).toHaveCSS('flex-basis', '242px');
  await expect(scope.getByLabel('normal prefix resize events', { exact: true }))
    .toHaveText(JSON.stringify([
      { event: 'start', sizes: [192, 288] }, { event: 'end', sizes: [242, 238] }
    ]));
  await expect(root.locator('.next-splitter-mask')).toHaveCount(0);
  await expect(changed).toHaveCSS('--next-splitter-bar-preview-offset', '0px');
});

test('Splitter prefixed collapse retains hidden content and keyboard restore', async ({ page }) => {
  await page.goto('/?fixture=splitter-prefix');
  await page.getByRole('checkbox', { name: 'Live Splitter prefix', exact: true }).check();
  const scope = page.locator('[data-splitter-prefix-scope="normal"]');
  const editor = scope.getByRole('textbox', { name: 'normal panel editor', exact: true });
  await editor.fill('kept hidden draft');
  const oldEditor = await editor.elementHandle();
  await scope.getByRole('button', { name: 'Toggle start panel', exact: true }).click();
  const hidden = scope.locator('.suite-splitter-panel-hidden');

  await expect(hidden).toHaveCSS('flex-basis', '0px');
  await expect(hidden.locator('input')).toHaveValue('kept hidden draft');
  await expect(hidden).not.toHaveAttribute('inert');
  await expect(hidden).not.toHaveAttribute('aria-hidden');
  await setPrefix(page, 'next');

  await expect(scope.locator('.next-splitter-panel-hidden')).toHaveCount(1);
  const restore = scope.getByRole('button', { name: 'Toggle end panel', exact: true });
  await restore.focus();
  await restore.press('Enter');

  await expect(scope.locator('.next-splitter-panel').first()).toHaveCSS('flex-basis', '192px');
  expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(true);
  await expect(editor).toHaveValue('kept hidden draft');
});

test('Splitter isolates a shared local class across global preview namespaces', async ({ page }) => {
  await page.goto('/?fixture=splitter-prefix');
  await page.getByRole('combobox', { name: 'Splitter prefix sample', exact: true })
    .selectOption('local-namespaces');

  for (const [index, scope] of ['normal', 'nested'].entries()) {
    const host = page.locator(`[data-splitter-prefix-scope="${scope}"]`);
    const dragger = host.getByRole('separator');
    await dragger.scrollIntoViewIfNeeded();
    const box = (await dragger.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 4;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 30, y);
    const expected = index === 0 ? reference.namespaceInteractions[0].result : isolated.result;

    await expect.poll(async () => (await page.evaluate(snapshotSplitterPrefix))[scope])
      .toEqual(expected);
    await page.mouse.up();
  }
});
