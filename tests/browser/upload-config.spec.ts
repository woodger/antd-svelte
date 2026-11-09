import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-config-reference.json' with { type: 'json' };
import { snapshotUploadConfig } from './upload-config-metrics';
import { snapshotUploadProgress } from './upload-progress-metrics';

const samples = [...reference.cases, ...reference.progress];

for (const [index, entry] of samples.entries()) {
  test(`Upload config matches Source inheritance and priority for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-config');
      await page.getByRole('combobox', { name: 'Upload config sample', exact: true })
        .selectOption(String(index));

      await expect.poll(() => page.evaluate(snapshotUploadConfig)).toEqual(entry.result);
      if ('progress' in entry) {
        await expect.poll(() => page.evaluate(snapshotUploadProgress)).toEqual(entry.progress);
      }
    });
}

for (const entry of reference.publicRequests) {
  test(`Upload config selects the Source custom request local=${entry.local}`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-config');
      await page.getByRole('checkbox', { name: 'Configured request mode', exact: true }).check();
      await page.getByRole('checkbox', { name: 'Local configured request', exact: true })
        .setChecked(entry.local);
      await page.locator('input[type=file]').setInputFiles({
        name: 'report.txt', mimeType: 'text/plain', buffer: Buffer.from('report')
      });

      await expect(page.getByLabel('Configured request events', { exact: true }))
        .toHaveText(JSON.stringify(entry.events));
      await expect(page.locator('.ant-upload-list-item-done')).toHaveCount(1);
      await page.getByRole('checkbox', { name: 'Mount Upload config', exact: true }).uncheck();
      await expect(page.locator('.ant-upload-wrapper')).toHaveCount(0);
      await expect(page.getByLabel('Retained configured request events', { exact: true }))
        .toHaveText(JSON.stringify(entry.events));
    });
}

test('Upload config updates preserve wrapper, item, input and the outside editor draft',
  async ({ page }) => {
    await page.goto('/?fixture=upload-config');
    await page.getByRole('checkbox', { name: 'Live Upload config', exact: true }).check();
    const root = page.locator('.ant-upload-wrapper');
    const item = page.locator('.ant-upload-list-item');
    const input = page.locator('input[type=file]');
    const editor = page.getByRole('textbox', { name: 'Upload config editor', exact: true });
    const oldRoot = await root.elementHandle();
    const oldItem = await item.elementHandle();
    const oldInput = await input.elementHandle();
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload provider', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.provider);

      await expect.poll(() => page.evaluate(snapshotUploadConfig)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
  });

test('Upload config changes affect future requests while the running transport remains active',
  async ({ page }) => {
    await page.goto('/?fixture=upload-config');
    await page.getByRole('checkbox', { name: 'Configured request mode', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Hold configured requests', exact: true }).check();
    const input = page.locator('input[type=file]');
    const oldInput = await input.elementHandle();
    await input.setInputFiles({
      name: 'first.txt', mimeType: 'text/plain', buffer: Buffer.from('first')
    });
    await expect(page.locator('.ant-upload-list-item-uploading')).toHaveCount(1);
    await page.getByRole('checkbox', { name: 'Local configured request', exact: true }).check();
    await input.setInputFiles({
      name: 'second.txt', mimeType: 'text/plain', buffer: Buffer.from('second')
    });

    await expect(page.locator('.ant-upload-list-item-uploading')).toHaveCount(2);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
    await expect(page.getByLabel('Configured request events', { exact: true }))
      .toHaveText('["change:first.txt:uploading","request:provider:first.txt","change:second.txt:uploading","request:local:second.txt"]');
    await page.getByRole('button', { name: 'Complete configured requests', exact: true }).click();

    await expect(page.locator('.ant-upload-list-item-done')).toHaveCount(2);
    await expect(page.getByLabel('Configured request events', { exact: true }))
      .not.toContainText('abort:');
    await input.setInputFiles({
      name: 'third.txt', mimeType: 'text/plain', buffer: Buffer.from('third')
    });
    await expect(page.locator('.ant-upload-list-item-uploading')).toHaveCount(1);
    await page.getByRole('checkbox', { name: 'Mount Upload config', exact: true }).uncheck();
    await expect(page.locator('.ant-upload-wrapper')).toHaveCount(0);
    await expect(page.getByLabel('Retained configured request events', { exact: true }))
      .toContainText('abort:local');
    expect(await page.getByLabel('Retained configured request events', { exact: true })
      .evaluate(node => JSON.parse(node.textContent ?? '[]')
        .filter((event: string) => event.startsWith('abort:')))).toEqual(['abort:local']);
  });
