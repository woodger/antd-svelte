import { test, expect } from './test';
import structure from './fixtures/ant-design-upload-trigger-structure-reference.json' with { type: 'json' };
import motion from './fixtures/ant-design-upload-trigger-motion-reference.json' with { type: 'json' };
import { readUploadTriggerMotion, readUploadTriggerStructure } from './upload-trigger-metrics';

for (const [index, entry] of structure.cases.entries()) {
  test(`Upload trigger structure matches Source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-trigger');
    await page.getByRole('combobox', { name: 'Upload trigger sample', exact: true })
      .selectOption(`structure:${index}`);

    await expect.poll(() => page.evaluate(readUploadTriggerStructure)).toEqual(entry.result);
  });
}

for (const [index, entry] of motion.cases.entries()) {
  test(`Upload trigger motion matches Source for ${entry.sample.id}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
    await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
    await page.goto('/?fixture=upload-trigger');
    await page.getByRole('combobox', { name: 'Upload trigger sample', exact: true })
      .selectOption(`motion:${index}`);
    const sample = entry.sample;
    const prefix = 'localPrefix' in sample && sample.localPrefix ? sample.localPrefix
      : `${'prefix' in sample && sample.prefix ? sample.prefix : 'ant'}-upload`;
    const trigger = page.locator(`.${prefix}-select`);
    const input = page.locator('[data-upload-trigger-host] input[type=file]');
    const oldTrigger = await trigger.elementHandle();
    const oldInput = await input.elementHandle();

    await expect.poll(() => page.evaluate(readUploadTriggerMotion, prefix)).toEqual(entry.initial);

    await page.getByRole('button', { name: 'Hide trigger', exact: true }).click();
    await page.clock.runFor(80);
    await trigger.evaluate(node => {
      for (const animation of node.getAnimations()) animation.pause();
    });

    expect(await page.evaluate(readUploadTriggerMotion, prefix)).toEqual(entry.hidden);

    await page.getByRole('button', { name: 'Show trigger', exact: true }).click();
    await page.clock.runFor(80);
    await trigger.evaluate(node => {
      for (const animation of node.getAnimations()) animation.pause();
    });

    expect(await page.evaluate(readUploadTriggerMotion, prefix)).toEqual(entry.returned);
    expect(await trigger.evaluate((node, old) => node === old, oldTrigger))
      .toBe(entry.identity.trigger);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(entry.identity.input);

    await trigger.evaluate(node => {
      for (const animation of node.getAnimations()) animation.finish();
    });
    await page.clock.runFor(2100);

    await expect.poll(() => page.evaluate(readUploadTriggerMotion, prefix)).toEqual(entry.settled);
  });
}

test('Upload retains the selected native file and outside focus through a hidden trigger',
  async ({ page }) => {
    await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
    await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
    await page.goto('/?fixture=upload-trigger');
    await page.getByRole('combobox', { name: 'Upload trigger sample', exact: true })
      .selectOption('motion:0');
    const input = page.locator('[data-upload-trigger-host] input[type=file]');
    const oldInput = await input.elementHandle();
    await input.evaluate((node: HTMLInputElement) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['draft'], 'retained.txt', { type: 'text/plain' }));
      node.files = transfer.files;
    });
    const editor = page.getByRole('textbox', { name: 'Upload trigger editor', exact: true });
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    await page.getByRole('button', { name: 'Hide trigger', exact: true })
      .evaluate((node: HTMLButtonElement) => node.click());
    await page.clock.runFor(2200);

    await expect(input).not.toHaveAttribute('id');
    await expect(page.locator('.ant-upload-select')).toHaveCSS('display', 'none');

    await page.getByRole('button', { name: 'Show trigger', exact: true })
      .evaluate((node: HTMLButtonElement) => node.click());
    await page.clock.runFor(2200);

    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
    expect(await input.evaluate((node: HTMLInputElement) => [...node.files!].map(file => file.name)))
      .toEqual(['retained.txt']);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue('Retained draft');
    expect(await editor.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
  });

for (const listType of ['picture-card', 'picture-circle']) {
  test(`UploadDragger ${listType} opens one picker and publishes one manual selection`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-trigger');
      await page.getByRole('combobox', { name: 'Upload trigger sample', exact: true })
        .selectOption(listType === 'picture-card' ? 'structure:10' : 'structure:14');
      await expect(page.locator('[data-upload-trigger-host] input[type=file]')).toHaveCount(1);
      const chooserPromise = page.waitForEvent('filechooser');

      await page.locator('[data-upload-trigger-host] button').click();
      const chooser = await chooserPromise;
      await chooser.setFiles({ name: 'manual.txt', mimeType: 'text/plain', buffer: Buffer.from('file') });

      await expect(page.locator('[data-trigger-changes]')).toHaveText('1');
      await expect(page.locator('[data-upload-trigger-host] input[type=file]')).toHaveCount(1);
      await expect(page.locator('[data-upload-trigger-host] .ant-upload-select')).toHaveCount(0);
    });
}

test('Upload cancels trigger motion after unmount and preserves outside focus', async ({ page }) => {
  await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
  await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
  await page.goto('/?fixture=upload-trigger');
  await page.getByRole('combobox', { name: 'Upload trigger sample', exact: true })
    .selectOption('motion:0');
  await page.getByRole('button', { name: 'Hide trigger', exact: true }).click();
  await page.clock.runFor(80);

  await page.getByRole('checkbox', { name: 'Mount trigger Upload', exact: true }).uncheck();
  const editor = page.getByRole('textbox', { name: 'Upload trigger editor', exact: true });
  await editor.fill('Outside');
  await page.clock.runFor(3000);

  await expect(page.locator('[data-upload-trigger-host] input[type=file]')).toHaveCount(0);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Outside');
});
