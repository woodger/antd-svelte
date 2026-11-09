import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-link-props-reference.json' with { type: 'json' };
import { snapshotUploadLinkProps } from './upload-link-props-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload linkProps preserves Source attributes and click order for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-link-props');
      await page.getByRole('combobox', { name: 'Upload link sample', exact: true })
        .selectOption(String(index));

      await expect.poll(() => page.evaluate(snapshotUploadLinkProps)).toEqual(entry.result);
      const name = page.locator(
        '[data-upload-link-host] .ant-upload-list-item-name, [data-upload-link-host] [data-file-link]'
      );
      const prevented = await name.evaluate(node => {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        node.dispatchEvent(event);
        return event.defaultPrevented;
      });

      expect(prevented).toBe(entry.click.prevented);
      await expect(page.getByLabel('Link props events', { exact: true }))
        .toHaveText(JSON.stringify(entry.click.events));
    });
}

test('Upload linkProps updates preserve the filename, file input and outside editor selection',
  async ({ page }) => {
    await page.goto('/?fixture=upload-link-props');
    await page.getByRole('checkbox', { name: 'Live Upload link props', exact: true }).check();
    const item = page.locator('.ant-upload-list-item');
    const name = item.locator('a');
    const input = page.locator('input[type=file]');
    const editor = page.getByRole('textbox', { name: 'Upload link editor', exact: true });
    const oldItem = await item.elementHandle();
    const oldName = await name.elementHandle();
    const oldInput = await input.elementHandle();
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload link mode', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.mode);

      await expect.poll(() => page.evaluate(snapshotUploadLinkProps)).toEqual(step.result);
      expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(true);
      expect(await name.evaluate((node, old) => node === old, oldName)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
    await page.getByRole('checkbox', { name: 'Mount Upload link props', exact: true }).uncheck();
    await expect(item).toHaveCount(0);
  });
