import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-semantic-reference.json' with { type: 'json' };
import { snapshotUploadSemantics } from './upload-semantic-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload semantic slots match Source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-semantic');
    await page.getByRole('combobox', { name: 'Upload semantic sample', exact: true })
      .selectOption(String(index));

    await expect.poll(() => page.evaluate(snapshotUploadSemantics)).toEqual(entry.result);
  });
}

test('Upload semantic updates preserve the wrapper, item, trigger, input and outside draft',
  async ({ page }) => {
    await page.goto('/?fixture=upload-semantic');
    await page.getByRole('checkbox', { name: 'Live Upload semantics', exact: true }).check();
    const root = page.locator('.ant-upload-wrapper');
    const item = page.locator('.ant-upload-list-item');
    const trigger = page.locator('.ant-upload-select');
    const input = page.locator('input[type=file]');
    const editor = page.getByRole('textbox', { name: 'Upload semantic editor', exact: true });
    const oldRoot = await root.elementHandle();
    const oldItem = await item.elementHandle();
    const oldTrigger = await trigger.elementHandle();
    const oldInput = await input.elementHandle();
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload semantic mode', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.mode);

      await expect.poll(() => page.evaluate(snapshotUploadSemantics)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(true);
      expect(await trigger.evaluate((node, old) => node === old, oldTrigger)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
    await page.getByRole('checkbox', { name: 'Mount Upload semantics', exact: true }).uncheck();
    await expect(root).toHaveCount(0);
  });
