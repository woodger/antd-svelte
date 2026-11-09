import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-listy-prefix-reference.json' with { type: 'json' };
import { snapshotListyPrefix } from './listy-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Listy prefixes match source raw/virtual parts for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=listy-prefix');
    await page.getByRole('combobox', { name: 'Listy prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotListyPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Listy prefix value' : 'Live Listy prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Listy shared/local prefix updates preserve raw nodes, refs, draft, focus and selection', async ({
  page
}) => {
  await page.goto('/?fixture=listy-prefix');
  await page.getByRole('checkbox', { name: 'Live Listy prefix', exact: true }).check();
  const scope = page.locator('[data-listy-prefix-scope="normal"]');
  const root = scope.locator('[data-listy-prefix-part="raw"] .fixture-listy-prefix');
  const oldList = await root.elementHandle();
  const record = root.locator('[data-record]').first();
  const oldRecord = await record.elementHandle();
  const editor = scope.getByRole('textbox', { name: 'normal raw row-00 draft', exact: true });
  const oldEditor = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotListyPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldList)).toBe(step.sameList);
    expect(await record.evaluate((node, old) => node === old, oldRecord)).toBe(step.sameRecord);
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    await expect(scope.getByLabel('normal Listy refs')).toHaveText('4');
  }
  await setPrefix(page, 'records', true);

  await expect(root).toHaveClass(/records/);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveCSS('outline-style', 'solid');
});

test('Listy prefix updates retain virtual scroll, sticky header and the edited keyed row', async ({
  page
}) => {
  await page.goto('/?fixture=listy-prefix');
  await page.getByRole('checkbox', { name: 'Live Listy prefix', exact: true }).check();
  const scope = page.locator('[data-listy-prefix-scope="normal"]');
  await scope.getByRole('button', { name: 'Scroll grouped list normal', exact: true }).click();
  const part = scope.locator('[data-listy-prefix-part="virtual-grouped"]');
  const root = part.locator('.fixture-listy-prefix');
  const holder = root.locator('.suite-listy-holder');
  const oldList = await root.elementHandle();
  const editor = part.getByRole('textbox', {
    name: 'normal virtual-grouped row-12 draft', exact: true
  });
  await editor.fill('virtual draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(2, 7); });
  const oldEditor = await editor.elementHandle();
  const top = await holder.evaluate(node => node.scrollTop);
  expect(top).toBeGreaterThan(0);

  for (const [prefix, local] of [['next', false], ['records', true]] as const) {
    await setPrefix(page, prefix, local);
    const resolved = local ? prefix : `${prefix}-listy`;

    await expect(root).toHaveClass(new RegExp(resolved));
    expect(await root.evaluate((node, old) => node === old, oldList)).toBe(true);
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(true);
    await expect(editor).toHaveValue('virtual draft');
    await expect(editor).toBeFocused();
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual([2, 7]);
    expect(await root.locator(`.${resolved}-holder`).evaluate(node => node.scrollTop)).toBe(top);
    await expect(root.locator(`.${resolved}-group-header-fixed`)).toHaveText('Group 2');
  }

  await scope.getByRole('button', { name: 'Scroll raw list normal', exact: true }).click();

  expect(await scope.locator('[data-listy-prefix-part="raw-grouped"] .fixture-listy-prefix')
    .evaluate(node => node.scrollTop)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(root.locator('.records-item').first()).toHaveCSS('transition-duration', '0s');
});
