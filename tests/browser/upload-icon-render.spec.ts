import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-icon-render-reference.json' with { type: 'json' };
import { snapshotUploadIconRender } from './upload-icon-render-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload iconRender matches Source visible content for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-icon-render');
    await page.getByRole('combobox', { name: 'Upload icon sample', exact: true })
      .selectOption(String(index));

    await expect.poll(() => page.evaluate(snapshotUploadIconRender)).toEqual(entry.result);
  });
}

test('Upload iconRender updates preserve the item, filename, file input and outside editor focus',
  async ({ page }) => {
    await page.goto('/?fixture=upload-icon-render');
    await page.getByRole('checkbox', { name: 'Live Upload icon renderer', exact: true }).check();
    const item = page.locator('.ant-upload-list-item');
    const name = item.locator('.ant-upload-list-item-name');
    const input = page.locator('input[type=file]');
    const editor = page.getByRole('textbox', { name: 'Upload icon editor', exact: true });
    const oldItem = await item.elementHandle();
    const oldName = await name.elementHandle();
    const oldInput = await input.elementHandle();
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload icon mode', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.mode);

      await expect.poll(() => page.evaluate(snapshotUploadIconRender)).toEqual(step.result);
      expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(true);
      expect(await name.evaluate((node, old) => node === old, oldName)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
    await page.getByRole('checkbox', { name: 'Mount Upload icon renderer', exact: true }).uncheck();
    await expect(item).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Mount Upload icon renderer', exact: true }).check();

    await expect.poll(() => page.evaluate(snapshotUploadIconRender))
      .toEqual(reference.transitions.at(-1)!.result);
  });
