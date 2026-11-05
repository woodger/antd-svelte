import { test, expect } from './test';
import reference from './fixtures/ant-design-splitter-theme-reference.json' with { type: 'json' };
import { snapshotSplitterTheme, snapshotSplitterThemeInteraction } from './splitter-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Splitter component tokens match source styles and geometry for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=splitter-theme');
      await page.getByLabel('Splitter token preset', { exact: true }).selectOption(sample.name);
      await page.mouse.move(0, 0);

      await expect.poll(() => page.evaluate(snapshotSplitterTheme)).toEqual(sample.metrics);
      if ('states' in sample && sample.states) {
        const dragger = page.locator('[data-splitter-theme="normal"] .ant-splitter-bar-dragger');
        await dragger.hover();

        await expect.poll(() => page.evaluate(snapshotSplitterThemeInteraction))
          .toEqual(sample.states.hover);
        await page.mouse.down();

        await expect.poll(() => page.evaluate(snapshotSplitterThemeInteraction))
          .toEqual(sample.states.active);
        await page.mouse.up();
      }
    });
}

test('Splitter token updates preserve panels, drafts, focus, refs and independent theme scopes',
  async ({ page }) => {
    await page.goto('/?fixture=splitter-theme');
    const root = page.locator('[data-splitter-theme="normal"] .ant-splitter');
    const draft = root.getByRole('textbox', { name: 'Splitter theme draft normal', exact: true });
    await draft.fill('Preserved Splitter draft');
    await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 6));
    const input = await draft.elementHandle();
    const original = await root.elementHandle();
    await page.getByRole('button', { name: 'Update Splitter trigger size', exact: true })
      .dispatchEvent('click');

    for (const id of ['normal', 'rtl', 'disabled', 'custom', 'lazy']) {
      await expect(page.locator(`[data-splitter-theme="${id}"] .ant-splitter-bar-dragger`))
        .toHaveCSS('width', '22px');
    }
    await expect(page.locator('[data-splitter-theme="vertical"] .ant-splitter-bar-dragger'))
      .toHaveCSS('height', '22px');
    for (const [id, size] of [['nested', 10], ['reset', 8], ['sibling', 12], ['outside', 6]]) {
      await expect(page.locator(`[data-splitter-theme="${id}"] .ant-splitter-bar-dragger`))
        .toHaveCSS('width', `${size}px`);
    }
    await expect(draft).toHaveValue('Preserved Splitter draft');
    await expect(draft).toBeFocused();
    expect(await draft.evaluate(node => [
      (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
    ])).toEqual([2, 6]);
    expect(await draft.evaluate((node, before) => node === before, input)).toBe(true);
    expect(await root.evaluate((node, before) => node === before, original)).toBe(true);
    await expect(page.getByLabel('Splitter theme events', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Splitter theme ref', { exact: true })).toHaveText('mounted');
    await page.getByLabel('Inherit child Splitter tokens', { exact: true }).dispatchEvent('click');

    await expect.poll(() => page.locator('[data-splitter-theme="nested"] .ant-splitter-bar-dragger')
      .evaluate(node => getComputedStyle(node, '::before').width)).toBe('2px');
    await page.getByLabel('Apply source Splitter tokens', { exact: true }).dispatchEvent('click');

    await expect(root.getByRole('separator')).toHaveCSS('width', '6px');
    await expect(draft).toHaveValue('Preserved Splitter draft');
    await expect(draft).toBeFocused();
    const box = (await root.getByRole('separator').boundingBox())!;
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 4 };
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 30, point.y);
    await page.mouse.up();

    await expect(root.locator(':scope > .ant-splitter-panel').first())
      .toHaveCSS('flex-basis', '222px');
    await expect(page.getByLabel('Splitter theme events', { exact: true })).toHaveText(JSON.stringify([
      { event: 'start', sizes: [192, 288] },
      { event: 'resize', sizes: [222, 258] },
      { event: 'end', sizes: [222, 258] }
    ]));
    await page.getByLabel('Mount themed Splitter controls', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-splitter-theme="outside"] .ant-splitter'))
      .toBeVisible();
  });

test('Splitter updates lazy preview thickness during a drag without committing panel sizes',
  async ({ page }) => {
    await page.goto('/?fixture=splitter-theme');
    const root = page.locator('[data-splitter-theme="lazy"] .ant-splitter');
    const separator = root.getByRole('separator');
    await separator.scrollIntoViewIfNeeded();
    const box = (await separator.boundingBox())!;
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 4 };
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 30, point.y);
    const preview = root.locator('.ant-splitter-bar-preview-active');

    await expect(preview).toHaveCSS('width', '4px');
    await expect(root.locator(':scope > .ant-splitter-panel').first())
      .toHaveCSS('flex-basis', '192px');
    await page.getByRole('button', { name: 'Update Splitter bar size', exact: true })
      .dispatchEvent('click');

    await expect(preview).toHaveCSS('width', '7px');
    await expect(preview).toHaveCSS('--ant-splitter-bar-preview-offset', '30px');
    await expect(root.locator(':scope > .ant-splitter-panel').first())
      .toHaveCSS('flex-basis', '192px');
    await page.mouse.up();

    await expect(preview).toHaveCount(0);
    await expect(root.locator(':scope > .ant-splitter-panel').first())
      .toHaveCSS('flex-basis', '222px');
  });
