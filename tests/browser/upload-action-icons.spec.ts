import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-action-icons-reference.json' with { type: 'json' };
import { snapshotUploadActionIcons } from './upload-action-icons-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload action icons match Source content and visibility for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-action-icons');
      await page.getByRole('combobox', { name: 'Upload action sample', exact: true })
        .selectOption(String(index));

      await expect.poll(() => page.evaluate(snapshotUploadActionIcons)).toEqual(entry.result);
    });
}

for (const entry of reference.actions) {
  test(`Upload action icons preserve Source callbacks disabled=${entry.disabled}`, async ({ page }) => {
    await page.goto('/?fixture=upload-action-icons');
    await page.getByRole('checkbox', { name: 'Live Upload action icons', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Disable Upload action icons', exact: true })
      .setChecked(entry.disabled);

    for (const name of ['Preview file', 'Download file', 'Remove file']) {
      const control = page.locator('.ant-upload-list-item-actions').getByLabel(name, { exact: true });
      if (await control.isDisabled()) continue;
      await control.dispatchEvent('click');
    }

    await expect(page.getByLabel('Action icon events', { exact: true }))
      .toHaveText(JSON.stringify(entry.events));
    await expect(page.locator('.ant-upload-list-item')).toHaveCount(1);
  });
}

test('Upload action icon updates preserve controls, input and the outside editor draft',
  async ({ page }) => {
    await page.goto('/?fixture=upload-action-icons');
    await page.getByRole('checkbox', { name: 'Live Upload action icons', exact: true }).check();
    const actions = page.locator('.ant-upload-list-item-actions');
    const preview = actions.getByLabel('Preview file', { exact: true });
    const download = actions.getByLabel('Download file', { exact: true });
    const remove = actions.getByLabel('Remove file', { exact: true });
    const input = page.locator('input[type=file]');
    const editor = page.getByRole('textbox', { name: 'Upload action editor', exact: true });
    const oldPreview = await preview.elementHandle();
    const oldDownload = await download.elementHandle();
    const oldRemove = await remove.elementHandle();
    const oldInput = await input.elementHandle();
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload action mode', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.mode);

      await expect.poll(() => page.evaluate(snapshotUploadActionIcons)).toEqual(step.result);
      expect(await preview.evaluate((node, old) => node === old, oldPreview)).toBe(true);
      expect(await download.evaluate((node, old) => node === old, oldDownload)).toBe(true);
      expect(await remove.evaluate((node, old) => node === old, oldRemove)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
    await remove.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Action icon events', { exact: true })).toHaveText('["remove:one"]');
    await page.getByRole('checkbox', { name: 'Mount Upload action icons', exact: true }).uncheck();
    await expect(actions).toHaveCount(0);
  });
