import { test, expect } from './test';
import reference from './fixtures/ant-design-modal-prefix-reference.json' with { type: 'json' };
import { snapshotModalPrefix } from './modal-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Modal prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=modal-prefix');
      await page.getByRole('combobox', { name: 'Modal prefix sample', exact: true }).selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Modal prefix scope', exact: true }).selectOption(scope);
      await page.getByRole('button', { name: 'Open prefix Modal', exact: true }).click();
      await page.getByLabel('Modal prefix draft', { exact: true }).focus();
      await page.mouse.move(1270, 5);

      const expected = ('nativeLoading' in entry ? entry.nativeLoading?.[scope] : undefined)
        ?? ('freshNamespace' in entry && scope === 'nested' ? entry.freshNamespace?.nested : undefined)
        ?? ('matchedHeader' in entry && scope !== 'sibling'
        ? entry.matchedHeader?.[scope] : undefined) ?? entry.result[scope];

      await expect.poll(() => page.evaluate(snapshotModalPrefix)).toEqual(expected);
    });
  }
}

for (const type of ['modal', 'confirm'] as const) {
  test(`Modal ${type} prefixes retain dialog/input, draft, selection, focus and callbacks`, async ({ page }) => {
    await page.goto('/?fixture=modal-prefix');
    await page.getByRole('checkbox', { name: 'Live Modal prefix', exact: true }).check();
    if (type === 'confirm') {
      await page.getByRole('checkbox', { name: 'Confirm prefix mode', exact: true }).check();
    }
    const opener = page.getByRole('button', { name: 'Open prefix Modal', exact: true });
    await opener.click();
    const root = page.getByRole('dialog', { name: type === 'modal' ? 'Prefix panel' : 'Prefix confirmation', exact: true });
    const editor = page.getByLabel('Modal prefix draft', { exact: true });
    const panel = root.locator('[data-ant-modal-body]');
    await editor.fill('Edited');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4));
    await page.mouse.move(1270, 5);
    const oldRoot = await root.elementHandle();
    const oldInput = await editor.elementHandle();
    const oldPanel = await panel.elementHandle();
    const label = await root.getAttribute('aria-labelledby');

    for (const step of reference.transitions.filter(step => step.type === type)) {
      await page.getByRole('textbox', { name: 'Live Modal prefix value', exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotModalPrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
      expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      expect(await panel.evaluate((node, old) => node === old, oldPanel)).toBe(step.samePanel);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue(step.value);
      expect(await editor.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
        .toEqual(step.selection);
      await expect(root).toHaveAttribute('aria-labelledby', label!);
      expect(await root.evaluate(node => node.matches(':modal'))).toBe(true);
      await expect(page.getByLabel('Modal prefix state', { exact: true })).toHaveText('open:0:pending');
    }
    await page.getByRole('textbox', { name: 'Local Modal prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'window';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(root.locator('[data-ant-modal-panel]')).toHaveClass(/\bwindow\b/);
    await expect(editor).toBeFocused();
    await root.getByRole('button', { name: 'OK', exact: true }).click();

    await expect(root).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(page.getByLabel('Modal prefix state', { exact: true }))
      .toHaveText(type === 'modal' ? 'closed:0:pending' : 'closed:1:true');
    await opener.click();
    await editor.focus();
    await page.keyboard.press('Escape');

    await expect(root).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(page.getByLabel('Modal prefix state', { exact: true }))
      .toHaveText(type === 'modal' ? 'closed:1:pending' : 'closed:2:false');
  });
}
