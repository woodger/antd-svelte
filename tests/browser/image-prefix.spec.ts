import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-image-prefix-reference.json' with { type: 'json' };
import { snapshotImagePrefix } from './image-prefix-metrics';
import { imageTwo } from './fixtures/image-data';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Image prefixes match Source thumbnail/viewer CSS for ${entry.sample.id}/${scope}`, async ({
      page
    }) => {
      await page.goto('/?fixture=image-prefix');
      await page.getByRole('combobox', { name: 'Image prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Image prefix scope', exact: true })
        .selectOption(scope);
      await page.mouse.move(1090, 5);

      await expect.poll(() => page.evaluate(snapshotImagePrefix)).toEqual(entry.result[scope].closed);
      if (entry.result[scope].opened) {
        await page.locator('.fixture-image-prefix').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.mouse.move(1090, 5);

        await expect.poll(() => page.evaluate(snapshotImagePrefix)).toEqual(entry.result[scope].opened);
      } else {
        await expect(page.locator('dialog')).toHaveCount(0);
      }
    });
  }
}

async function setPrefix(page: Page, name: string, value: string) {
  await page.getByRole('textbox', { name, exact: true }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

for (const group of [false, true]) {
  test(`Image ${group ? 'group' : 'single'} prefix updates retain viewer, zoom, active image and native focus`, async ({
    page
  }) => {
    await page.goto('/?fixture=image-prefix');
    await page.getByRole('checkbox', { name: 'Live Image prefix', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Group Image prefix', exact: true }).setChecked(group);
    const root = page.locator('.fixture-image-prefix');
    await root.click();
    const viewer = page.getByRole('dialog');
    if (group) await viewer.getByRole('button', { name: 'next', exact: true }).click();
    const zoom = viewer.getByRole('button', { name: 'zoomIn', exact: true });
    await zoom.click();
    await zoom.focus();
    const picture = viewer.locator('img');
    const oldRoot = await root.elementHandle();
    const oldViewer = await viewer.elementHandle();
    const oldImage = await picture.elementHandle();
    const oldZoom = await zoom.elementHandle();
    await page.mouse.move(1090, 5);

    for (const step of reference.transitions.filter(step => step.group === group)) {
      await setPrefix(page, 'Live Image prefix value', step.prefix);

      await expect.poll(() => page.evaluate(snapshotImagePrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
      expect(await viewer.evaluate((node, old) => node === old, oldViewer)).toBe(step.sameViewer);
      expect(await picture.evaluate((node, old) => node === old, oldImage)).toBe(step.sameImage);
      expect(await zoom.evaluate((node, old) => node === old, oldZoom)).toBe(step.sameZoom);
      await expect(zoom).toBeFocused();
      await expect(page.getByLabel('Image prefix refs', { exact: true })).toHaveText('mounted');
      await expect(page.getByLabel('Image prefix openings', { exact: true })).toHaveText('[true]');
      if (group) await expect(picture).toHaveAttribute('src', imageTwo);
    }
    await setPrefix(page, 'Local Image prefix value', 'photo');
    if (group) await setPrefix(page, 'Local Image group prefix value', 'gallery');

    await expect(root).toHaveClass(/\bphoto\b/);
    await expect(viewer).toHaveClass(group ? /gallery-preview/ : /photo-preview/);
    await expect(zoom).toHaveCSS('font-size', '18px');
    await expect(zoom).toBeFocused();
    await zoom.press('Enter');

    await expect(page.getByLabel('Image prefix transforms', { exact: true }))
      .toContainText('"scale":2.25');
    await page.keyboard.press('Escape');

    await expect(viewer).toHaveCount(0);
    await expect(root).toBeFocused();
  });
}
