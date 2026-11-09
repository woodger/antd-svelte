import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-progress-motion-reference.json' with { type: 'json' };
import { readUploadProgressMotion } from './upload-progress-motion-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload progress motion matches Source for ${entry.sample.id}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
    await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
    await page.goto('/?fixture=upload-progress-motion');
    await page.getByRole('combobox', { name: 'Upload progress motion sample', exact: true })
      .selectOption(String(index));
    const sample = entry.sample;
    const prefix = 'localPrefix' in sample && sample.localPrefix ? sample.localPrefix
      : `${'prefix' in sample && sample.prefix ? sample.prefix : 'ant'}-upload`;

    expect(await page.evaluate(readUploadProgressMotion, prefix)).toBeNull();

    if ('initialStatus' in sample) {
      await page.clock.runFor(350);
      await page.getByRole('button', { name: 'Start upload', exact: true }).click();
      await page.clock.runFor(80);
    } else {
      await page.clock.runFor(299);
      expect(await page.evaluate(readUploadProgressMotion, prefix)).toBeNull();
      await page.clock.runFor(81);
    }
    await page.locator(`.${prefix}-list-item-progress`).evaluate(node => {
      for (const animation of node.getAnimations()) animation.pause();
    });

    expect(await page.evaluate(readUploadProgressMotion, prefix)).toEqual(entry.appeared);

    await page.locator(`.${prefix}-list-item-progress`).evaluate(node => {
      for (const animation of node.getAnimations()) animation.finish();
    });
    await expect.poll(() => page.evaluate(readUploadProgressMotion, prefix))
      .toEqual({ ...entry.appeared, classes: [], animations: [] });
    await page.getByRole('button', { name: 'Complete upload', exact: true }).click();
    await page.clock.runFor(80);
    await page.locator(`.${prefix}-list-item-progress`).evaluateAll(nodes => {
      for (const node of nodes) {
        for (const animation of node.getAnimations()) animation.pause();
      }
    });

    expect(await page.evaluate(readUploadProgressMotion, prefix)).toEqual(entry.leaving);

    await page.locator(`.${prefix}-list-item-progress`).evaluateAll(nodes => {
      for (const node of nodes) {
        for (const animation of node.getAnimations()) animation.finish();
      }
    });

    await expect.poll(() => page.evaluate(readUploadProgressMotion, prefix)).toBeNull();
  });
}

test('Upload progress returns during fade without replacing the bar, input or outside focus',
  async ({ page }) => {
    await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
    await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
    await page.goto('/?fixture=upload-progress-motion');
    await page.clock.runFor(380);
    const progress = page.locator('.ant-upload-list-item-progress');
    await progress.waitFor();
    await progress.evaluate(node => {
      for (const animation of node.getAnimations()) animation.finish();
    });
    const oldProgress = await progress.elementHandle();
    const oldBar = await page.getByRole('progressbar').elementHandle();
    const oldInput = await page.locator('input[type=file]').elementHandle();
    const editor = page.getByRole('textbox', { name: 'Upload progress motion editor', exact: true });
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    await page.getByRole('button', { name: 'Complete upload', exact: true })
      .evaluate((node: HTMLButtonElement) => node.click());
    await page.clock.runFor(80);
    await progress.evaluate(node => {
      for (const animation of node.getAnimations()) animation.pause();
    });
    await page.getByRole('button', { name: 'Start upload', exact: true })
      .evaluate((node: HTMLButtonElement) => node.click());
    await page.clock.runFor(3000);

    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
    expect(await progress.evaluate((node, old) => node === old, oldProgress)).toBe(true);
    expect(await page.getByRole('progressbar').evaluate((node, old) => node === old, oldBar)).toBe(true);
    expect(await page.locator('input[type=file]').evaluate((node, old) => node === old, oldInput))
      .toBe(true);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue('Retained draft');
    expect(await editor.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
  });

test('Upload progress cancels pending timers and fade on unmount', async ({ page }) => {
  await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
  await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
  await page.goto('/?fixture=upload-progress-motion');
  await page.clock.runFor(380);
  await page.getByRole('button', { name: 'Complete upload', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Mount progress Upload', exact: true }).uncheck();

  await page.clock.runFor(3000);

  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await expect(page.locator('[data-ant-upload-root]')).toHaveCount(0);
});

test('Upload progress isolates the shared fade namespace and tokens for the same local prefix',
  async ({ page }) => {
    await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
    await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
    await page.goto('/?fixture=upload-progress-motion');
    await page.getByRole('checkbox', { name: 'Paired progress scopes', exact: true }).check();

    await page.clock.runFor(380);
    await page.locator('.files-list-item-progress').evaluateAll(nodes => {
      for (const node of nodes) {
        for (const animation of node.getAnimations()) animation.pause();
      }
    });

    for (const [prefix, duration] of [['acme', 450], ['beta', 700]] as const) {
      const node = page.locator(`[data-progress-scope=${prefix}] .files-list-item-progress`);
      await expect(node).toHaveClass(new RegExp(`${prefix}-fade-appear-active`));
      expect(await node.evaluate(element => element.getAnimations()
        .map(animation => animation.effect!.getTiming().duration))).toEqual([duration]);
    }
  });

for (const reduced of [false, true]) {
  test(`Upload progress finishes its pending fade after motion is disabled reduced=${reduced}`,
    async ({ page }) => {
      await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
      await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
      await page.goto('/?fixture=upload-progress-motion');
      await page.clock.runFor(380);
      await page.locator('.ant-upload-list-item-progress').evaluate(node => {
        for (const animation of node.getAnimations()) animation.finish();
      });
      await page.getByRole('button', { name: 'Complete upload', exact: true }).click();
      await page.clock.runFor(80);

      if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
      else {
        await page.getByRole('checkbox', { name: 'Disable progress motion', exact: true }).check();
      }

      await expect(page.locator('.ant-upload-list-item-progress')).toHaveCount(0);
      await page.clock.runFor(3000);
      await expect(page.locator('.ant-upload-list-item-progress')).toHaveCount(0);
    });
}
