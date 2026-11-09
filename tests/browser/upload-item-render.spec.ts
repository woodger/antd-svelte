import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-item-render-reference.json' with { type: 'json' };
import { snapshotUploadItemRender } from './upload-item-render-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload itemRender matches Source origin and context for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-item-render');
    await page.getByRole('combobox', { name: 'Upload item sample', exact: true })
      .selectOption(String(index));

    await expect.poll(() => page.evaluate(snapshotUploadItemRender)).toEqual(entry.result);
  });
}

for (const entry of reference.actions) {
  test(`Upload itemRender actions preserve Source callbacks and preview cancellation disabled=${entry.disabled}`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-item-render');
      await page.getByRole('checkbox', { name: 'Live Upload item renderer', exact: true }).check();
      await page.getByRole('checkbox', { name: 'Disable item renderer Upload', exact: true })
        .setChecked(entry.disabled);
      const prevented: boolean[] = [];

      for (const action of ['preview', 'download', 'remove']) {
        prevented.push(await page.getByRole('button', { name: `Custom ${action} one`, exact: true })
          .evaluate(node => {
            const event = new MouseEvent('click', { bubbles: true, cancelable: true });
            node.dispatchEvent(event);
            return event.defaultPrevented;
          }));
      }

      expect(prevented).toEqual(entry.prevented);
      await expect(page.getByLabel('Item render events', { exact: true }))
        .toHaveText(JSON.stringify(entry.events));
      await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(2);
    });
}

test('Upload itemRender mode updates retain containers, file input and the outside draft',
  async ({ page }) => {
    await page.goto('/?fixture=upload-item-render');
    await page.getByRole('checkbox', { name: 'Live Upload item renderer', exact: true }).check();
    const first = page.locator('.ant-upload-list-item-container').first();
    const input = page.locator('input[type=file]');
    const editor = page.getByRole('textbox', { name: 'Upload item editor', exact: true });
    const oldFirst = await first.elementHandle();
    const oldInput = await input.elementHandle();
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload item mode', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.mode);

      await expect.poll(() => page.evaluate(snapshotUploadItemRender)).toEqual(step.result);
      expect(await first.evaluate((node, old) => node === old, oldFirst)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
    await page.getByRole('checkbox', { name: 'Reverse item renderer files', exact: true }).check();
    const reversed = reference.cases.find(entry => entry.sample.id === 'reversed')!;

    await expect.poll(() => page.evaluate(snapshotUploadItemRender)).toEqual(reversed.result);
    expect(await page.locator('.ant-upload-list-item-container').last()
      .evaluate((node, old) => node === old, oldFirst)).toBe(true);
    await page.getByRole('button', { name: 'Custom preview one', exact: true }).click();
    await expect(page.getByLabel('Item render events', { exact: true })).toHaveText('["preview:one"]');
    await page.getByRole('checkbox', { name: 'Mount Upload item renderer', exact: true }).uncheck();
    await expect(first).toHaveCount(0);
  });
