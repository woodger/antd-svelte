import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-ref-reference.json' with { type: 'json' };
import transport from './fixtures/ant-design-upload-ref-transport-reference.json' with { type: 'json' };
import { readUploadRefTransport } from './upload-ref-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload ref matches Source lifecycle for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-ref');
    await page.getByRole('combobox', { name: 'Upload ref sample', exact: true })
      .selectOption(String(index));

    await page.getByRole('button', { name: 'Run Upload ref scenario', exact: true }).click();

    await expect.poll(async () => {
      const text = await page.locator('[data-upload-ref-result]').textContent();
      return text ? JSON.parse(text) : null;
    }).toEqual(entry.result);
    await expect(page.locator('[data-ref-before]')).toHaveText('0');
    await expect(page.locator('[data-ref-requests]')).toHaveText('0');
  });
}

for (const entry of transport.cases) {
  const drag = entry.sample.drag;
  const title = drag ? 'UploadDragger' : 'Upload';
  test(`${title} delegated abort retains the list and cancels transport after imperative success`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-ref');
      await page.getByRole('combobox', { name: 'Upload ref sample', exact: true })
        .selectOption(drag ? '10' : '1');
      await page.locator('[data-upload-ref-host] input[type=file]').setInputFiles({
        name: 'pending.txt', mimeType: 'text/plain', buffer: Buffer.from('draft')
      });
      await expect.poll(() => page.evaluate(readUploadRefTransport)).toEqual(entry.initial);

      await page.getByRole('button', { name: 'Complete Upload through ref', exact: true }).click();
      await expect.poll(() => page.evaluate(readUploadRefTransport)).toEqual(entry.completed);
      await page.getByRole('button', { name: 'Abort delegated Upload', exact: true }).click();
      await expect.poll(() => page.evaluate(readUploadRefTransport)).toEqual(entry.aborted);
      await page.getByRole('button', { name: 'Abort delegated Upload', exact: true }).click();

      await expect.poll(() => page.evaluate(readUploadRefTransport)).toEqual(entry.repeated);
      await expect(page.locator('.ant-upload-list-item-done')).toHaveCount(1);
      await expect(page.locator('.ant-upload-list-item-name')).toHaveText('pending.txt');

      await page.getByRole('button', { name: 'Progress Upload transport', exact: true }).click();

      await expect.poll(() => page.evaluate(readUploadRefTransport)).toEqual(entry.progressed);
    });

  test(`${title} held ref suppresses callbacks after unmount and clears native refs`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-ref');
      await page.getByRole('combobox', { name: 'Upload ref sample', exact: true })
        .selectOption(drag ? '10' : '1');
      await page.locator('[data-upload-ref-host] input[type=file]').setInputFiles({
        name: 'pending.txt', mimeType: 'text/plain', buffer: Buffer.from('draft')
      });
      await expect(page.locator('[data-ref-callbacks]')).toHaveText('1');

      await page.getByRole('button', { name: 'Unmount ref Upload', exact: true }).click();
      const editor = page.getByRole('textbox', { name: 'Upload ref editor', exact: true });
      await editor.fill('Retained draft');
      await page.getByRole('button', { name: 'Call held Upload ref', exact: true })
        .evaluate((node: HTMLButtonElement) => node.click());
      await page.getByRole('button', { name: 'Progress Upload transport', exact: true })
        .evaluate((node: HTMLButtonElement) => node.click());

      await expect(page.locator('[data-ref-clean]')).toHaveText('true');
      await expect(page.locator('[data-ref-aborted]')).toHaveText('1');
      await expect(page.locator('[data-ref-callbacks]')).toHaveText('1');
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
    });
}
