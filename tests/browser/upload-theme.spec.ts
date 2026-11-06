import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-theme-reference.json' with { type: 'json' };
import { snapshotUploadTheme } from './upload-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=upload-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Upload ${scope} theme matches source areas and file rows for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Upload theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Upload theme scope', { exact: true }).selectOption(scope);
        await page.mouse.move(1300, 1100);

        await expect.poll(() => page.evaluate(snapshotUploadTheme)).toEqual(expected);
      });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Upload ${mode} theme matches source areas and file rows for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Upload theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Upload theme mode', { exact: true }).selectOption(mode);
        await page.mouse.move(1300, 1100);
        if (mode === 'hover' || mode === 'card-hover') {
          const box = await page.locator('.ant-upload-list-item').first().boundingBox();
          expect(box).not.toBeNull();
          await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
          const hovered = await page.locator('.ant-upload-list-item').evaluateAll(nodes =>
            nodes.flatMap((node, index) => node.matches(':hover') ? [index] : []));
          expect(hovered).toEqual(sample.interactions[mode].hoveredIndices);
        }
        if (mode === 'progress') {
          await expect(page.locator('.ant-upload-list-item-progress')).toBeVisible();
        }

        await expect.poll(() => page.evaluate(snapshotUploadTheme)).toEqual(expected);
      });
  }
}

test('Upload token updates keep a pending request, file input and focused trigger alive',
  async ({ page }) => {
    await page.getByLabel('Upload theme mode', { exact: true }).selectOption('picture-card');
    const root = page.locator('.ant-upload-wrapper');
    const input = root.locator('input[type="file"]');
    const trigger = root.getByRole('button', { name: 'Upload', exact: true });
    const originalRoot = await root.elementHandle();
    const originalInput = await input.elementHandle();
    const originalTrigger = await trigger.elementHandle();
    await input.setInputFiles({ name: 'new.txt', mimeType: 'text/plain', buffer: Buffer.from('draft') });
    await expect(page.getByLabel('Upload theme events', { exact: true }))
      .toContainText('request:new.txt');
    await trigger.focus();
    const events = await page.getByLabel('Upload theme events', { exact: true }).textContent();

    await page.getByRole('button', { name: 'Update Upload tokens', exact: true })
      .dispatchEvent('click');

    await expect(root.locator('.ant-upload-select')).toHaveCSS('width', '160px');
    await expect(root.locator('.ant-upload-list-item-container').first())
      .toHaveCSS('height', '160px');
    expect(await root.evaluate((node, old) => node === old, originalRoot)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await trigger.evaluate((node, old) => node === old, originalTrigger)).toBe(true);
    await expect(trigger).toBeFocused();
    await expect(root.locator('.ant-upload-list-item')).toHaveCount(3);
    await expect(page.getByLabel('Upload theme events', { exact: true })).toHaveText(events!);

    await page.getByRole('button', { name: 'Complete pending Upload', exact: true }).click();

    await expect(page.getByLabel('Upload theme events', { exact: true }))
      .toContainText('change:new.txt:done');
    await expect(root.locator('.ant-upload-list-item-done')).toHaveCount(2);
  });

test('Upload inheritance reset preserves its list, action focus and local controller state',
  async ({ page }) => {
    await page.getByLabel('Upload theme scope', { exact: true }).selectOption('nested');
    const root = page.locator('.ant-upload-wrapper');
    const action = root.getByRole('button', { name: 'Download file', exact: true }).first();
    const originalRoot = await root.elementHandle();
    const originalAction = await action.elementHandle();
    await action.focus();

    await page.getByLabel('Inherit Upload theme', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCSS('font-size', '16px');
    expect(await root.evaluate((node, old) => node === old, originalRoot)).toBe(true);
    expect(await action.evaluate((node, old) => node === old, originalAction)).toBe(true);
    await expect(action).toBeFocused();
    await expect(root.locator('.ant-upload-list-item-name')).toHaveText(['note.txt', 'broken.txt']);
    await expect(page.getByLabel('Upload theme events', { exact: true })).toHaveText('[]');

    await action.press('Enter');

    await expect(page.getByLabel('Upload theme events', { exact: true }))
      .toHaveText('["download:note.txt"]');
  });

test('Upload returns to native styling without replacing files and releases its DOM on unmount',
  async ({ page }) => {
    const root = page.locator('.ant-upload-wrapper');
    const input = root.locator('input[type="file"]');
    const trigger = root.getByRole('button', { name: 'Upload', exact: true });
    const originalInput = await input.elementHandle();
    await trigger.focus();

    await page.getByLabel('Apply source Upload theme', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCSS('font-size', '14px');
    await expect(trigger).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    await expect(root.locator('.ant-upload-list-item-name')).toHaveText(['note.txt', 'broken.txt']);
    await expect(page.getByLabel('Upload theme events', { exact: true })).toHaveText('[]');

    await page.getByLabel('Mount themed Upload', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCount(0);
    await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(0);
    await expect(page.locator('.ant-tooltip')).toHaveCount(0);
    expect(await originalInput!.evaluate(node => node.isConnected)).toBe(false);
  });
