import { test, expect } from './test';
import reference from './fixtures/ant-design-image-theme-reference.json' with { type: 'json' };
import { snapshotImageTheme } from './image-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Image theme matches source single/group viewers and isolated scopes for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=image-theme');
      await page.getByLabel('Image theme preset', { exact: true }).selectOption(sample.name);
      const prefix = sample.config.cssVar?.prefix ?? 'ant';

      for (const [id, expected] of Object.entries(sample.metrics)) {
        const trigger = page.locator(`[data-image-theme="${id}"] .ant-image`).first();
        await trigger.click();
        const viewer = page.locator(`.image-theme-preview-${id}.ant-image-preview`);
        await expect(viewer).toBeVisible();
        await page.mouse.move(1090, 5);

        await expect.poll(() => page.evaluate(snapshotImageTheme, { id, prefix }))
          .toEqual(expected.normal);
        const action = viewer.locator('.ant-image-preview-actions-action-zoomIn');
        await action.hover();

        await expect(action).toHaveCSS('color', expected.hoverColor);
        await page.keyboard.press('Escape');

        await expect(viewer).not.toBeVisible();
        await expect(trigger).toBeFocused();
      }
    });
}

test('Image token updates preserve the open viewer, transform, focus and refs without new callbacks',
  async ({ page }) => {
    await page.goto('/?fixture=image-theme');
    const trigger = page.getByRole('button', { name: 'Theme single', exact: true });
    await trigger.click();
    const viewer = page.getByRole('dialog', { name: 'Theme single', exact: true });
    const zoom = viewer.getByRole('button', { name: 'zoomIn', exact: true });
    const picture = viewer.locator('img');
    await zoom.press('Enter');
    await expect(page.getByLabel('Image theme transforms', { exact: true }))
      .toContainText('"scale":1.5');
    await zoom.focus();
    const before = {
      root: await viewer.elementHandle(),
      image: await picture.elementHandle(),
      button: await zoom.elementHandle(),
      trigger: await trigger.elementHandle(),
      transforms: await page.getByLabel('Image theme transforms', { exact: true }).textContent()
    };
    await page.getByRole('button', { name: 'Update Image tokens', exact: true })
      .dispatchEvent('click');

    await expect(zoom).toHaveCSS('font-size', '34px');
    await expect(zoom).toHaveCSS('color', 'rgb(19, 82, 0)');
    await expect(viewer).toHaveCSS('z-index', '2500');
    await expect(viewer).toHaveCSS('--ant-image-progress-animation-duration', '7s');
    await expect(zoom).toBeFocused();
    expect(await viewer.evaluate((node, old) => node === old, before.root)).toBe(true);
    expect(await picture.evaluate((node, old) => node === old, before.image)).toBe(true);
    expect(await zoom.evaluate((node, old) => node === old, before.button)).toBe(true);
    expect(await trigger.evaluate((node, old) => node === old, before.trigger)).toBe(true);
    await expect(page.getByLabel('Image theme transforms', { exact: true }))
      .toHaveText(before.transforms!);
    await expect(page.getByLabel('Image theme openings', { exact: true })).toHaveText('[true]');
    await expect(page.getByLabel('Image theme native ref', { exact: true })).toHaveText('mounted');
    await expect(page.getByLabel('Image theme img ref', { exact: true })).toHaveText('mounted');
    await page.keyboard.press('Escape');

    await expect(trigger).toBeFocused();
    for (const [id, size, zIndex] of [
      ['nested', '22px', '2500'],
      ['reset', '24px', '1080'],
      ['sibling', '20px', '1080'],
      ['outside', '18px', '1080'],
      ['explicit', '34px', '2300'],
      ['explicit-group', '34px', '2300']
    ]) {
      await page.locator(`[data-image-theme="${id}"] .ant-image`).first().click();
      const current = page.locator(`.image-theme-preview-${id}.ant-image-preview`);

      await expect(current).toHaveCSS('z-index', zIndex);
      await expect(current.locator('.ant-image-preview-actions-action-zoomIn'))
        .toHaveCSS('font-size', size);
      await page.keyboard.press('Escape');
    }
  });

test('Image group theme updates preserve index, counter, keyboard navigation and opener focus',
  async ({ page }) => {
    await page.goto('/?fixture=image-theme');
    const trigger = page.getByRole('button', { name: 'Theme group two', exact: true });
    await trigger.click();
    const viewer = page.locator('.image-theme-preview-group.ant-image-preview');
    await expect(viewer.locator('.ant-image-preview-progress')).toHaveText('2 / 2');
    await viewer.getByRole('button', { name: 'zoomIn', exact: true }).click();
    await expect(viewer.locator('img'))
      .toHaveAttribute('style', /scale3d\(1\.5,\s*1\.5,\s*1\)/);
    const transform = await viewer.locator('img').getAttribute('style');
    const root = await viewer.elementHandle();
    await page.getByRole('button', { name: 'Update Image tokens', exact: true })
      .dispatchEvent('click');

    await expect(viewer.locator('.ant-image-preview-progress')).toHaveText('2 / 2');
    await expect(viewer.locator('img')).toHaveAttribute('style', transform!);
    expect(await viewer.evaluate((node, old) => node === old, root)).toBe(true);
    await expect(viewer).toHaveCSS('z-index', '2500');
    await page.keyboard.press('ArrowLeft');

    await expect(viewer.locator('.ant-image-preview-progress')).toHaveText('1 / 2');
    await expect(viewer.getByRole('button', { name: 'zoomOut', exact: true })).toBeDisabled();
    await page.keyboard.press('Escape');

    await expect(trigger).toBeFocused();
  });

test('Image disabling theme inheritance and unmount preserve focus return and remove viewer resources',
  async ({ page }) => {
    await page.goto('/?fixture=image-theme');
    const nested = page.locator('[data-image-theme="nested"] .ant-image');
    await nested.click();
    const nestedViewer = page.locator('.image-theme-preview-nested.ant-image-preview');
    await expect(nestedViewer).toHaveCSS('z-index', '2100');
    await page.getByLabel('Inherit child Image theme', { exact: true }).dispatchEvent('click');

    await expect(nestedViewer).toHaveCSS('z-index', '1080');
    await expect(nestedViewer.locator('.ant-image-preview-actions-action-zoomIn'))
      .toHaveCSS('font-size', '22px');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Theme single', exact: true }).click();
    const viewer = page.locator('.image-theme-preview-single.ant-image-preview');
    const root = await viewer.elementHandle();
    await page.getByLabel('Apply source Image theme', { exact: true }).dispatchEvent('click');

    await expect(viewer).toHaveCSS('z-index', '1080');
    await expect(viewer.locator('.ant-image-preview-actions-action-zoomIn'))
      .toHaveCSS('font-size', '18px');
    await page.getByLabel('Mount themed Image controls', { exact: true }).dispatchEvent('click');

    await expect(viewer).toHaveCount(0);
    expect(await root!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.getByRole('button', { name: 'Theme outside', exact: true })).toBeVisible();
  });

test('Image themes reach single and group viewers above Modal while preserving the native dialog stack',
  async ({ page }) => {
    await page.goto('/?fixture=image-theme');
    await page.getByRole('button', { name: 'Open themed Image modal', exact: true }).click();
    const host = page.getByRole('dialog', { name: 'Themed Image host modal', exact: true });

    for (const name of ['Themed modal single', 'Themed modal group two']) {
      const trigger = host.getByRole('button', { name, exact: true });
      await trigger.click();
      const viewer = page.locator('dialog.ant-image-preview[open]');

      await expect(viewer).toBeVisible();
      await expect(viewer).toHaveCSS('z-index', '2100');
      await expect(viewer.getByRole('button', { name: 'zoomIn', exact: true }))
        .toHaveCSS('font-size', '30px');
      expect(await viewer.evaluate(node => node.matches(':modal'))).toBe(true);
      await page.keyboard.press('Escape');

      await expect(viewer).toHaveCount(0);
      await expect(host).toBeVisible();
      await expect(trigger).toBeFocused();
      await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    }
    await page.keyboard.press('Escape');

    await expect(host).not.toBeVisible();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  });
