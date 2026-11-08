import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-space-prefix-reference.json' with { type: 'json' };
import isolated from './fixtures/ant-design-space-prefix-isolated.json' with { type: 'json' };
import { snapshotSpacePrefix } from './space-prefix-metrics';

for (const entry of reference.cases) {
  test(`Space family prefixes match source CSS for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=space-prefix');
    await page.getByRole('combobox', { name: 'Space prefix sample', exact: true })
      .selectOption(entry.sample.id);

    const expected = structuredClone(entry.result);
    // Source кэширует shared local Space с первым root prefix; fresh source даёт inner Badge rule.
    if (entry.sample.id === 'aliases') expected.nested = isolated.result;

    await expect.poll(() => page.evaluate(snapshotSpacePrefix)).toEqual(expected);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Space prefix value' : 'Live Space prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Space family prefix updates retain keyed children, Addons, draft and focus', async ({ page }) => {
  await page.goto('/?fixture=space-prefix');
  await page.getByRole('checkbox', { name: 'Live Space prefix', exact: true }).check();
  const scope = page.locator('[data-space-prefix-scope="normal"]');
  const space = scope.locator('.fixture-space-prefix');
  const compact = scope.locator('.fixture-compact-prefix');
  const addons = compact.locator('.fixture-addon-prefix');
  const oldSpace = await space.elementHandle();
  const oldCompact = await compact.elementHandle();
  const oldAddons = await addons.elementHandles();
  const input = scope.getByRole('textbox', { name: 'normal compact editor', exact: true });
  const oldInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotSpacePrefix)).toEqual(step.result);
    expect(await space.evaluate((node, old) => node === old, oldSpace)).toBe(step.sameSpace);
    expect(await compact.evaluate((node, old) => node === old, oldCompact)).toBe(step.sameCompact);
    for (const [index, oldAddon] of oldAddons.entries()) {
      expect(await addons.nth(index).evaluate((node, old) => node === old, oldAddon))
        .toBe(step.sameAddons);
    }
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
  }
  await setPrefix(page, 'local', true);

  await expect(space).toHaveClass(/local-horizontal/);
  await expect(compact).toHaveClass(/local-group/);
  await expect(addons.first()).toHaveClass(/local-cell-compact-first-item/);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('kept draft');
});

test('Space keeps its shared Badge selector independent from local layout prefixes', async ({ page }) => {
  await page.goto('/?fixture=space-prefix');
  await page.getByRole('combobox', { name: 'Space prefix sample', exact: true }).selectOption('local');
  const root = page.locator('[data-space-prefix-scope="normal"] .fixture-space-prefix');

  await expect(root).toHaveClass(/flow-horizontal/);
  await expect(root.locator('[data-space-prefix-badge]')).toHaveClass(/suite-badge-not-a-wrapper/);
  await expect(root.locator('[data-space-prefix-badge]')).toHaveCSS('display', 'block');
});
