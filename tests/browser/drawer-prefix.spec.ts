import { test, expect } from './test';
import reference from './fixtures/ant-design-drawer-prefix-reference.json' with { type: 'json' };
import { snapshotDrawerPrefix } from './drawer-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Drawer prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=drawer-prefix');
      await page.getByRole('combobox', { name: 'Drawer prefix sample', exact: true }).selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Drawer prefix scope', exact: true }).selectOption(scope);
      await page.getByRole('button', { name: 'Open prefix Drawer', exact: true }).click();
      await page.getByLabel('Drawer prefix draft', { exact: true }).focus();
      await page.mouse.move(1270, 5);

      await expect.poll(() => page.evaluate(snapshotDrawerPrefix)).toEqual(entry.result[scope]);
    });
  }
}

test('Drawer prefixes retain open dialog/panel/input, draft, selection, focus and restore the opener', async ({ page }) => {
  await page.goto('/?fixture=drawer-prefix');
  await page.getByRole('checkbox', { name: 'Live Drawer prefix', exact: true }).check();
  const opener = page.getByRole('button', { name: 'Open prefix Drawer', exact: true });
  await opener.click();
  const root = page.getByRole('dialog', { name: 'Prefix panel', exact: true });
  const editor = page.getByLabel('Drawer prefix draft', { exact: true });
  const panel = root.locator('[data-ant-drawer-section]');
  await editor.fill('Edited');
  await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4));
  await page.mouse.move(1270, 5);
  const oldRoot = await root.elementHandle();
  const oldInput = await editor.elementHandle();
  const oldPanel = await panel.elementHandle();
  const id = await root.getAttribute('id');
  const label = await root.getAttribute('aria-labelledby');

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Drawer prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotDrawerPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await panel.evaluate((node, old) => node === old, oldPanel)).toBe(step.samePanel);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual(step.selection);
    await expect(root).toHaveAttribute('id', id!);
    await expect(root).toHaveAttribute('aria-labelledby', label!);
    expect(await root.evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(page.getByLabel('Drawer prefix state', { exact: true })).toHaveText('open:0');
  }
  await page.getByRole('textbox', { name: 'Local Drawer prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'panel';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(root).toHaveClass(/\bpanel\b/);
  await expect(editor).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(root).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.getByLabel('Drawer prefix state', { exact: true })).toHaveText('closed:1');
  await opener.click();
  await page.locator('[data-ant-drawer-mask]').click({ position: { x: 12, y: 400 } });

  await expect(root).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.getByLabel('Drawer prefix state', { exact: true })).toHaveText('closed:2');
});
