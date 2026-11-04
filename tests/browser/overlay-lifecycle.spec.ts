import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-lifecycle-reference.json' with { type: 'json' };
import { snapshotOverlayLifecycle } from './overlay-lifecycle-metrics';

test.use({ viewport: reference.viewport });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=overlay-lifecycle');
  await page.getByRole('combobox', { name: 'Lifecycle reference', exact: true }).selectOption(name);
  await expect(page.locator('[data-lifecycle-anchor]')).toBeVisible();
}

const open = (page: Page) => page.getByRole('button', {
  name: 'Open lifecycle popup', exact: true
}).dispatchEvent('click');
const close = (page: Page) => page.getByRole('button', {
  name: 'Close lifecycle popup', exact: true
}).dispatchEvent('click');
const change = (page: Page) => page.getByRole('button', {
  name: 'Change lifecycle settings', exact: true
}).dispatchEvent('click');

for (const sample of reference.cases) {
  test(`Overlay content lifetime follows the source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    await page.clock.install();
    await page.locator('[data-lifecycle-anchor]').hover();
    await page.clock.runFor(1000);
    const snapshot = () => page.evaluate(snapshotOverlayLifecycle);
    const initial = await snapshot();

    expect(initial.visible).toBe(sample.snapshots.initial.visible);
    expect(initial.callbacks).toEqual(sample.snapshots.initial.callbacks);
    // Native defaults сохраняют eager SSR, Typography и destroy остаются ленивыми.
    if (sample.component === 'typography' || sample.snapshots.initial.visible
      || !sample.snapshots.closed.contents.length) {
      expect(initial.contents).toEqual(sample.snapshots.initial.contents);
    }

    await open(page);
    await page.clock.runFor(1000);
    await expect.poll(snapshot).toEqual(sample.snapshots.opened);
    const input = page.getByLabel('Lifecycle draft', { exact: true });
    const original = await input.elementHandle();

    await input.fill('Edited draft');
    await page.getByRole('button', { name: 'Lifecycle count', exact: true }).dispatchEvent('click');
    await page.clock.runFor(100);

    await expect.poll(snapshot).toEqual(sample.snapshots.edited);

    await close(page);
    await page.clock.runFor(1000);

    await expect.poll(snapshot).toEqual(sample.snapshots.closed);
    if ('patch' in sample) {
      await change(page);
      await page.clock.runFor(1000);

      await expect.poll(snapshot).toEqual(sample.snapshots.changed);
    }

    await open(page);
    await page.clock.runFor(1000);

    await expect.poll(snapshot).toEqual(sample.snapshots.reopened);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(sample.retained);
    await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[]');
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm', 'typography']) {
  test(`Enabling destruction retains the open ${component} and clears it on the next close`, async ({ page }) => {
    await select(page, `${component}-reactive`);
    if (component === 'typography') await page.locator('[data-lifecycle-anchor]').hover();
    await open(page);
    const input = page.getByLabel('Lifecycle draft', { exact: true });
    await input.fill('Open draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5));
    const original = await input.elementHandle();

    await change(page);

    await expect(input).toBeVisible();
    await expect(input).toHaveValue('Open draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual([1, 5]);

    await close(page);

    await expect(input).toHaveCount(0);

    await open(page);

    await expect(input).toHaveValue('Draft');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(false);
  });
}

test('Popconfirm releases destroyed pending controls and ignores the old result after reopening', async ({ page }) => {
  await select(page, 'popconfirm-destroy');
  await page.getByLabel('Async lifecycle confirm', { exact: true }).dispatchEvent('click');
  await open(page);
  await page.getByRole('button', { name: 'Confirm lifetime', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm lifetime', exact: true })).toBeDisabled();

  await close(page);

  await expect(page.locator('[data-ant-popconfirm-content]')).toHaveCount(0);

  await open(page);
  await expect(page.getByRole('button', { name: 'Confirm lifetime', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Resolve lifecycle confirm', exact: true }).dispatchEvent('click');

  await expect(page.locator('[data-ant-popconfirm-content]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm lifetime', exact: true })).toBeEnabled();
  await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[]');
});

for (const mode of ['single', 'range']) {
  for (const name of ['default', 'destroy', 'modern-keep']) {
    test(`Slider ${mode} Tooltip follows the source content policy for ${name}`, async ({ page }) => {
      const sample = reference.cases.find(sample => sample.name === `tooltip-${name}`)!;
      await select(page, sample.name);
      await page.getByRole('combobox', { name: 'Lifecycle Slider mode', exact: true }).selectOption(mode);
      const handle = page.getByRole('slider').first();
      const value = mode === 'single' ? 'Value 50' : 'Value 25';

      await handle.focus();

      await expect(page.getByRole('tooltip')).toBeVisible();
      await expect(page.getByRole('tooltip')).toHaveText(value);

      await page.getByRole('button', { name: 'After lifecycle popup', exact: true }).focus();

      await expect(page.getByRole('tooltip')).toBeHidden();
      await expect(page.locator('[data-ant-tooltip-container]'))
        .toHaveText(sample.retained ? value : '');
    });
  }
}

test('Pinned Slider Tooltips destroy both handle contents and reopen with their values', async ({ page }) => {
  await select(page, 'tooltip-destroy');
  await page.getByRole('combobox', { name: 'Lifecycle Slider mode', exact: true }).selectOption('pinned');

  await open(page);

  await expect(page.getByRole('tooltip')).toHaveCount(2);
  await expect(page.getByRole('tooltip')).toHaveText(['Value 25', 'Value 75']);

  await close(page);

  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await expect(page.locator('[data-ant-tooltip-container]')).toHaveText('');

  await open(page);

  await expect(page.getByRole('tooltip')).toHaveText(['Value 25', 'Value 75']);
});
