import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-thumbnail-fallback-reference.json' with { type: 'json' };
import { snapshotUploadThumbnailFallback } from './upload-thumbnail-fallback-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload thumbnail fallback matches Source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-thumbnail-fallback');
    await page.getByRole('combobox', { name: 'Upload thumbnail sample', exact: true })
      .selectOption(String(index));

    await expect.poll(() => page.evaluate(snapshotUploadThumbnailFallback)).toEqual(entry.result);
  });
}

test('Upload thumbnail fallback preserves the row, input and source anchor until no image remains',
  async ({ page }) => {
    await page.goto('/?fixture=upload-thumbnail-fallback');
    await page.getByRole('checkbox', { name: 'Live Upload thumbnail fallback', exact: true }).check();
    const row = page.locator('.ant-upload-list-item');
    const input = page.locator('input[type=file]');
    const thumbnail = page.locator('.ant-upload-list-item-thumbnail');
    const editor = page.getByRole('textbox', { name: 'Upload thumbnail editor', exact: true });
    const oldRow = await row.elementHandle();
    const oldInput = await input.elementHandle();
    const oldThumbnail = await thumbnail.elementHandle();
    let sourceDisappeared = false;
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload thumbnail mode', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.mode);

      await expect.poll(() => page.evaluate(snapshotUploadThumbnailFallback)).toEqual(step.result);
      expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      sourceDisappeared ||= step.result.thumbnail.tag !== 'A';
      if (!sourceDisappeared) {
        expect(await thumbnail.evaluate((node, old) => node === old, oldThumbnail)).toBe(true);
      }
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
  });
