import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-paste-reference.json' with { type: 'json' };

type ClipboardSample = {
  files?: { name: string; type: string }[];
  text?: string;
  emptyFileItem?: boolean;
};
async function paste(page: Page, sample: ClipboardSample, selector?: string) {
  return page.evaluate(async ({ sample, selector }) => {
    const data = new DataTransfer();
    if (sample.text) data.setData('text/plain', sample.text);
    for (const file of sample.files ?? [])
      data.items.add(new File([file.name], file.name, { type: file.type }));
    const event = new ClipboardEvent('paste', {
      clipboardData: data, bubbles: true, cancelable: true
    });
    if (sample.emptyFileItem) Object.defineProperty(event, 'clipboardData', {
      value: { files: [], items: [{ kind: 'file' }] }
    });
    const target = selector ? document.querySelector(selector) : document;
    if (!target) throw new Error('Paste target is missing');

    target.dispatchEvent(event);
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    return event.defaultPrevented;
  }, { sample, selector });
}

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload pastable follows Source file handling for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-paste');
    await page.getByRole('combobox', { name: 'Upload paste sample', exact: true })
      .selectOption(String(index));
    const blocked = entry.sample.disabled || entry.sample.providerDisabled;
    const expected = blocked ? { prevented: false, before: [], changes: [] } : entry.result;

    // Raw Source не проверяет disabled у document paste handler; Native сохраняет запрет.
    expect(await paste(page, entry.sample)).toBe(expected.prevented);
    await expect(page.getByLabel('Paste before', { exact: true }))
      .toHaveText(JSON.stringify(expected.before));
    await expect(page.getByLabel('Paste changes', { exact: true }))
      .toHaveText(JSON.stringify(expected.changes));
  });
}

test('Upload pastable toggles the document listener without replacing refs or trigger',
  async ({ page }) => {
    await page.goto('/?fixture=upload-paste');
    await page.getByRole('checkbox', { name: 'Live pastable Upload', exact: true }).check();
    const input = page.locator('input[type=file]');
    const trigger = page.getByRole('button', { name: 'Paste upload', exact: true });
    const oldInput = await input.elementHandle();
    const oldTrigger = await trigger.elementHandle();
    const sample = { files: [{ name: 'notes.txt', type: 'text/plain' }] };
    for (const step of reference.transitions) {
      await page.getByRole('checkbox', { name: 'Enable file paste', exact: true })
        .setChecked(step.pastable);
      await page.getByRole('button', { name: 'Clear paste events', exact: true }).click();

      expect(await paste(page, sample)).toBe(step.prevented);
      await expect(page.getByLabel('Paste before', { exact: true }))
        .toHaveText(JSON.stringify(step.before));
      await expect(page.getByLabel('Paste changes', { exact: true }))
        .toHaveText(JSON.stringify(step.changes));
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      expect(await trigger.evaluate((node, old) => node === old, oldTrigger)).toBe(true);
      await expect(page.getByLabel('Paste refs', { exact: true })).toHaveText('true');
    }
    await page.getByRole('checkbox', { name: 'Mount pastable Upload', exact: true }).uncheck();

    expect(await paste(page, sample)).toBe(reference.afterUnmount.prevented);
    await expect(input).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Mount pastable Upload', exact: true }).check();
    await expect(page.getByLabel('Paste changes', { exact: true })).toHaveText('[]');
    expect(await paste(page, sample)).toBe(true);
    await expect(page.getByLabel('Paste before', { exact: true }))
      .toHaveText('[{"name":"notes.txt","batch":["notes.txt"]}]');
  });

test('Upload document paste retains an outside editor focus and sends files through customRequest',
  async ({ page }) => {
    await page.goto('/?fixture=upload-paste');
    await page.getByRole('checkbox', { name: 'Live pastable Upload', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Enable file paste', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Manual paste Upload', exact: true }).uncheck();
    const editor = page.getByRole('textbox', { name: 'Outside Upload editor', exact: true });
    await editor.fill('Editor draft');
    await editor.evaluate((node: HTMLTextAreaElement) => node.setSelectionRange(1, 5, 'backward'));

    expect(await paste(page, { files: [{ name: 'notes.txt', type: 'text/plain' }] }, 'textarea'))
      .toBe(true);

    await expect(page.getByLabel('Paste requests', { exact: true })).toHaveText('["notes.txt"]');
    await expect(page.getByLabel('Paste changes', { exact: true })).toHaveText(JSON.stringify([
      { name: 'notes.txt', status: 'uploading', list: ['notes.txt'] },
      { name: 'notes.txt', status: 'done', list: ['notes.txt'] }
    ]));
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue('Editor draft');
    expect(await editor.evaluate((node: HTMLTextAreaElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
  });

test('UploadDragger pastable respects disabled changes and retains input selection',
  async ({ page }) => {
    await page.goto('/?fixture=upload-paste');
    await page.getByRole('checkbox', { name: 'Live pastable Upload', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Enable file paste', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Paste through Dragger', exact: true }).check();
    const sample = { files: [{ name: 'notes.txt', type: 'text/plain' }] };
    await page.getByRole('checkbox', { name: 'Disable pastable Upload', exact: true }).check();

    expect(await paste(page, sample)).toBe(false);
    await expect(page.getByLabel('Paste before', { exact: true })).toHaveText('[]');
    await page.getByRole('checkbox', { name: 'Disable pastable Upload', exact: true }).uncheck();
    expect(await paste(page, sample)).toBe(true);
    await expect(page.getByLabel('Paste changes', { exact: true }))
      .toHaveText('[{"name":"notes.txt","status":null,"list":["notes.txt"]}]');
    await page.locator('input[type=file]').setInputFiles({
      name: 'selected.txt', mimeType: 'text/plain', buffer: Buffer.from('Selected')
    });

    await expect(page.getByLabel('Paste changes', { exact: true }))
      .toContainText('selected.txt');
    await expect(page.getByLabel('Paste refs', { exact: true })).toHaveText('true');
  });
