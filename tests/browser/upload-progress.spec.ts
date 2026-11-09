import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-progress-reference.json' with { type: 'json' };
import { snapshotUploadProgress } from './upload-progress-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload progress matches Source props for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-progress');
    await page.getByRole('combobox', { name: 'Upload progress sample', exact: true })
      .selectOption(String(index));

    await expect.poll(() => page.evaluate(snapshotUploadProgress)).toEqual(entry.result);
  });
}

test('Upload progress updates preserve the item, input, progress root and outside editor selection',
  async ({ page }) => {
    await page.goto('/?fixture=upload-progress');
    await page.getByRole('checkbox', { name: 'Live Upload progress', exact: true }).check();
    const item = page.locator('.ant-upload-list-item');
    const progress = page.getByRole('progressbar', { name: 'File transfer', exact: true });
    const input = page.locator('input[type=file]');
    const editor = page.getByRole('textbox', { name: 'Upload progress editor', exact: true });
    await expect(progress).toBeVisible();
    const oldItem = await item.elementHandle();
    const oldProgress = await progress.elementHandle();
    const oldInput = await input.elementHandle();
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('combobox', { name: 'Live Upload progress mode', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, step.mode);

      await expect.poll(() => page.evaluate(snapshotUploadProgress)).toEqual(step.result);
      expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(true);
      expect(await progress.evaluate((node, old) => node === old, oldProgress)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue('Retained draft');
      expect(await editor.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    }
    await page.getByRole('spinbutton', { name: 'Upload progress value', exact: true }).fill('73');

    await expect(progress).toHaveAttribute('aria-valuenow', '73');
    await expect(page.getByLabel('Progress file', { exact: true }))
      .toHaveText('{"uid":"one","percent":73}');
    await page.getByRole('checkbox', { name: 'Uploading progress file', exact: true }).uncheck();
    await expect(progress).toHaveCount(0);
    expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(true);
  });

test('Upload progress keeps the 300ms delay and cancels the timer on unmount', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));
  await page.goto('/?fixture=upload-progress');
  const progress = page.getByRole('progressbar', { name: 'File transfer', exact: true });

  await expect(progress).toHaveCount(0);
  await page.clock.runFor(299);
  await expect(progress).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(progress).toBeVisible();
  const mounted = page.getByRole('checkbox', { name: 'Mount Upload progress', exact: true });
  const setMounted = (checked: boolean) => mounted.evaluate((node: HTMLInputElement, value) => {
    node.checked = value;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
  await setMounted(false);
  await setMounted(true);
  await page.clock.runFor(299);
  await expect(progress).toHaveCount(0);
  await setMounted(false);
  await page.clock.runFor(1000);

  await expect(page.locator('.ant-upload-list-item')).toHaveCount(0);
  await expect(progress).toHaveCount(0);
});
