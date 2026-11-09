import { test, expect } from './test';
import reference from './fixtures/ant-design-image-independent-preview-reference.json' with { type: 'json' };
import { snapshotImagePrefix } from './image-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Independent Image preview prefix retains Source classes and complete viewer CSS for ${entry.sample.id}`, async ({
    page
  }) => {
    await page.goto('/?fixture=image-prefix');
    await page.getByRole('checkbox', { name: 'Independent Image samples', exact: true }).check();
    await page.getByRole('combobox', { name: 'Image prefix sample', exact: true })
      .selectOption(entry.sample.id);
    await page.locator('.fixture-image-prefix').click();
    const viewer = page.getByRole('dialog');
    const sample = entry.sample;
    const prefix = 'group' in sample && sample.group
      ? `${sample.groupLocal}-preview`
      : 'previewPrefix' in sample && sample.previewPrefix !== undefined
        ? sample.previewPrefix : `${sample.local}-preview`;
    await expect(viewer).toBeVisible();
    await page.mouse.move(1090, 5);

    await expect(viewer).toHaveAttribute('data-ant-image-preview-prefix', prefix);
    await expect.poll(() => page.evaluate(snapshotImagePrefix, prefix)).toEqual(entry.styled);
    if (prefix) {
      expect(await viewer.evaluate((node, prefix) => node.classList.contains(prefix), prefix)).toBe(true);
    } else {
      expect(await viewer.getAttribute('class')).not.toContain('photo-preview');
    }
    expect(await viewer.getByRole('button', { name: 'zoomIn', exact: true })
      .evaluate((node, prefix) => node.classList.contains(`${prefix}-actions-action-zoomIn`), prefix))
      .toBe(true);
  });
}

test('Independent Image preview prefix changes retain image/zoom/dialog/action focus and restore the opener', async ({
  page
}) => {
  await page.goto('/?fixture=image-prefix');
  await page.getByRole('checkbox', { name: 'Live Image prefix', exact: true }).check();
  await page.getByRole('textbox', { name: 'Local Image prefix value', exact: true }).fill('photo');
  const root = page.locator('.fixture-image-prefix');
  await root.click();
  const viewer = page.getByRole('dialog');
  const image = viewer.locator('img');
  const zoom = viewer.getByRole('button', { name: 'zoomIn', exact: true });
  await zoom.click();
  await zoom.focus();
  await page.mouse.move(1090, 5);
  const oldRoot = await root.elementHandle();
  const oldViewer = await viewer.elementHandle();
  const oldImage = await image.elementHandle();
  const oldZoom = await zoom.elementHandle();
  await page.getByRole('checkbox', { name: 'Custom Image viewer prefix', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.checked = true;
      node.dispatchEvent(new Event('change', { bubbles: true }));
    });

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Viewer Image prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.previewPrefix);

    await expect(viewer).toHaveAttribute('data-ant-image-preview-prefix', step.previewPrefix);
    await expect.poll(() => page.evaluate(snapshotImagePrefix, step.previewPrefix))
      .toEqual(reference.liveStyled);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await viewer.evaluate((node, old) => node === old, oldViewer)).toBe(step.sameViewer);
    expect(await image.evaluate((node, old) => node === old, oldImage)).toBe(step.sameImage);
    expect(await zoom.evaluate((node, old) => node === old, oldZoom)).toBe(step.sameZoom);
    await expect(zoom).toBeFocused();
    await expect(page.getByLabel('Image prefix openings', { exact: true })).toHaveText('[true]');
  }
  await zoom.press('Enter');

  await expect(page.getByLabel('Image prefix transforms', { exact: true })).toContainText('"scale":2.25');
  await page.keyboard.press('Escape');

  await expect(viewer).toHaveCount(0);
  await expect(root).toBeFocused();
});
