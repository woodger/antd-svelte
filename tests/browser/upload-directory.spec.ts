import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-directory-reference.json' with { type: 'json' };
import { createDirectoryTransfer, type DirectoryFixtureNode } from './fixtures/upload-directory-transfer.dom';

async function transfer(page: Page, sample: { nodes?: DirectoryFixtureNode[]; paste?: boolean }) {
  await page.evaluate(async ({ sample, source }) => {
    const create = new Function(`return (${source})`)() as typeof createDirectoryTransfer;
    const { transfer, calls } = create(sample.nodes ?? []);
    Object.assign(window, { directoryCalls: calls });
    const event = sample.paste
      ? new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true })
      : new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true });
    const target = sample.paste ? document : document.querySelector('input[type=file]')!.parentElement!;
    target.dispatchEvent(event);
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }, { sample, source: createDirectoryTransfer.toString() });
}

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload directory matches Source attributes and metadata for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-directory');
      await page.getByRole('combobox', { name: 'Upload directory sample', exact: true })
        .selectOption(String(index));
      const input = page.locator('input[type=file]');
      expect(await input.evaluate((node: HTMLInputElement) => ({
        directory: node.getAttribute('directory'), webkitdirectory: node.getAttribute('webkitdirectory'),
        directoryProperty: node.webkitdirectory, multiple: node.multiple
      }))).toEqual(entry.attributes);
      if ('files' in entry.sample && entry.sample.files) {
        await input.evaluate((node: HTMLInputElement, files) => {
          const transfer = new DataTransfer();
          for (const source of files) {
            const file = new File([source.name], source.name, { type: source.type || 'text/plain' });
            Object.defineProperty(file, 'webkitRelativePath', { value: source.path });
            transfer.items.add(file);
          }
          node.files = transfer.files;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, entry.sample.files);
      } else await transfer(page, entry.sample);

      const expected = entry.readableCounterpart ?? entry;
      // Source пропускает error callback файла; Native продолжает оставшимися читаемыми файлами.
      await expect(page.getByLabel('Directory before', { exact: true }))
        .toHaveText(JSON.stringify(expected.before));
      await expect(page.getByLabel('Directory changes', { exact: true }))
        .toHaveText(JSON.stringify(expected.changes));
      await expect(page.getByLabel('Directory refs', { exact: true })).toHaveText('true');
    });
}

test('Upload directory toggles picker attributes without replacing refs or the focused trigger',
  async ({ page }) => {
    await page.goto('/?fixture=upload-directory');
    await page.getByRole('checkbox', { name: 'Live directory Upload', exact: true }).check();
    const input = page.locator('input[type=file]');
    const trigger = page.getByRole('button', { name: 'Upload directory', exact: true });
    const oldInput = await input.elementHandle();
    const oldTrigger = await trigger.elementHandle();
    await trigger.focus();

    for (const enabled of [false, true]) {
      await page.getByRole('checkbox', { name: 'Enable directory', exact: true })
        .evaluate((node: HTMLInputElement, enabled) => {
          node.checked = enabled;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, enabled);

      await expect.poll(() => input.evaluate((node: HTMLInputElement) => node.webkitdirectory))
        .toBe(enabled);
      expect(await input.getAttribute('directory')).toBe(enabled ? 'directory' : null);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      expect(await trigger.evaluate((node, old) => node === old, oldTrigger)).toBe(true);
      await expect(trigger).toBeFocused();
    }
  });

test('UploadDragger directory retains nested file paths and reuses the existing file controller',
  async ({ page }) => {
    await page.goto('/?fixture=upload-directory');
    await page.getByRole('checkbox', { name: 'Directory Dragger', exact: true }).check();
    await transfer(page, reference.cases[0].sample);

    await expect(page.getByLabel('Directory before', { exact: true }))
      .toHaveText(JSON.stringify(reference.cases[0].before));
    await expect(page.getByLabel('Directory changes', { exact: true }))
      .toHaveText(JSON.stringify(reference.cases[0].changes));
    await expect(page.getByLabel('Directory refs', { exact: true })).toHaveText('true');
  });

for (const action of ['disable', 'unmount'] as const) {
  test(`Upload directory ignores a late file read after ${action}`, async ({ page }) => {
    await page.goto('/?fixture=upload-directory');
    await page.getByRole('checkbox', { name: 'Live directory Upload', exact: true }).check();
    await page.evaluate(() => {
      const file = new File(['Pending'], 'pending.txt');
      const transfer = new DataTransfer();
      transfer.items.add(file);
      Object.defineProperty(transfer, 'items', { value: [{
        webkitGetAsEntry: () => ({
          isFile: true, isDirectory: false, fullPath: '/pending.txt',
          file: (complete: (file: File) => void) => {
            Object.assign(window, { completeDirectoryRead: () => complete(file) });
          }
        })
      }] });
      const event = new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true });
      document.querySelector('input[type=file]')!.parentElement!.dispatchEvent(event);
    });
    await expect(page.getByLabel('Directory observed', { exact: true })).toHaveText('[]');
    if (action === 'disable') await page.getByRole('checkbox', {
      name: 'Disable directory Upload', exact: true
    }).check();
    else await page.getByRole('checkbox', { name: 'Mount directory Upload', exact: true }).uncheck();

    await page.evaluate(async () => {
      (window as unknown as { completeDirectoryRead: () => void }).completeDirectoryRead();
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    });

    await expect(page.getByLabel('Directory observed', { exact: true })).toHaveText('[]');
    if (action === 'disable') {
      await expect(page.getByLabel('Directory before', { exact: true })).toHaveText('[]');
    }
  });
}


test('Upload directory picker preserves real Chromium relative paths and applies accept',
  async ({ page }) => {
    await page.goto('/?fixture=upload-directory');
    const index = reference.cases.findIndex(entry => entry.sample.id === 'picker-filter');
    await page.getByRole('combobox', { name: 'Upload directory sample', exact: true })
      .selectOption(String(index));
    const input = page.locator('input[type=file]');
    const oldInput = await input.elementHandle();

    await input.setInputFiles(fileURLToPath(new URL('./fixtures/upload-directory-data', import.meta.url)));

    await expect.poll(async () => {
      const entries = JSON.parse((await page.getByLabel('Directory before', { exact: true })
        .textContent())!) as { file: { path: string } }[];
      return entries.map(entry => entry.file.path).sort();
    }).toEqual(['upload-directory-data/first.txt', 'upload-directory-data/nested/second.txt']);
    expect(await input.evaluate((node: HTMLInputElement) => node.files?.length)).toBe(0);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
  });
