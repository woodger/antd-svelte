import { test, expect } from './test';
import reference from './fixtures/ant-design-breadcrumb-config-reference.json' with { type: 'json' };
import { snapshotBreadcrumbConfiguration } from './breadcrumb-config-metrics';

test.use({ viewport: reference.reference.viewport });

for (const sample of reference.cases) {
  test(`Breadcrumb config matches source semantics and content for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=breadcrumb-config');
      await page.getByRole('combobox', { name: 'Breadcrumb config preset', exact: true })
        .selectOption(sample.name);
      await page.mouse.move(1300, 1100);
      // Source textContent оставлен сырым; сравниваются видимые trigger/separator fragments.
      const expected: ReturnType<typeof snapshotBreadcrumbConfiguration> = {};
      for (const [key, nodes] of Object.entries(sample.expected)) {
        expected[key] = [];
        for (const { text: _rawText, ...node } of nodes) expected[key].push(node);
      }

      await expect.poll(() => page.evaluate(snapshotBreadcrumbConfiguration))
        .toEqual(expected);
    });
}

test('Breadcrumb configuration retains links, keyed items, focus and nested defaults during updates',
  async ({ page }) => {
    await page.goto('/?fixture=breadcrumb-config');
    await page.getByRole('combobox', { name: 'Breadcrumb config preset', exact: true })
      .selectOption('context-functions');
    const root = page.locator('.breadcrumb-config-main .ant-breadcrumb');
    const first = root.getByRole('link', { name: 'First', exact: true });
    await expect(root).toHaveClass(/context-breadcrumb-root-3-configured/);
    await first.focus();
    const previousRoot = await root.elementHandle();
    const previousFirst = await first.elementHandle();
    const item = root.locator('.ant-breadcrumb-item').first();
    const previousItem = await item.elementHandle();
    await page.getByRole('button', { name: 'Update Breadcrumb configuration', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveClass(/context-breadcrumb-updated/);
    await expect(root).toHaveClass(/context-breadcrumb-root-3-other/);
    await expect(root).toHaveCSS('opacity', '0.6');
    await expect(root).toHaveCSS('outline-offset', '7px');
    await expect(root.locator('.ant-breadcrumb-separator')).toHaveText(['>>', '>>']);
    await expect(root.locator('[data-breadcrumb-icon="updated"]')).toHaveText('U');
    await page.getByRole('button', { name: 'Toggle configured Breadcrumb items', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveClass(/context-breadcrumb-root-2-other/);
    expect(await root.evaluate((node, old) => node === old, previousRoot)).toBe(true);
    expect(await first.evaluate((node, old) => node === old, previousFirst)).toBe(true);
    expect(await item.evaluate((node, old) => node === old, previousItem)).toBe(true);
    await expect(first).toBeFocused();
    await expect(page.getByLabel('Configured Breadcrumb clicks', { exact: true })).toHaveText('0');
    await first.press('Enter');

    await expect(page).toHaveURL(/#breadcrumb-config-first$/);
    await expect(page.getByLabel('Configured Breadcrumb clicks', { exact: true })).toHaveText('1');
    await page.getByRole('button', { name: 'Update Breadcrumb configuration', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveClass(/context-breadcrumb-root-2-configured/);
    await expect(root).toHaveCSS('opacity', '0.65');
    await expect(first).toBeFocused();
    await expect(page.locator('.outside-breadcrumb-config .ant-breadcrumb-link'))
      .toHaveText(['Outside first', 'Outside second']);
    await expect(page.locator('.outside-breadcrumb-config .ant-breadcrumb-separator')).toHaveText('/');
    await expect(page.locator('.outside-breadcrumb-config')).not.toHaveClass(/context-|local-/);
  });

test('Breadcrumb configured icon updates preserve the open native menu and its keyboard callbacks',
  async ({ page }) => {
    await page.goto('/?fixture=breadcrumb-config');
    await page.getByRole('combobox', { name: 'Breadcrumb config preset', exact: true })
      .selectOption('context-defaults');
    const root = page.locator('.breadcrumb-config-main .ant-breadcrumb');
    const trigger = root.getByRole('link', { name: 'Section C', exact: true });
    await trigger.focus();
    await trigger.press('ArrowDown');
    const entry = page.getByRole('menuitem', { name: 'Menu entry', exact: true });
    await expect(entry).toBeFocused();
    const previous = await entry.elementHandle();
    await page.getByRole('button', { name: 'Update Breadcrumb configuration', exact: true })
      .dispatchEvent('click');

    await expect(root.locator('[data-breadcrumb-icon="updated"]')).toHaveText('U');
    await expect(entry).toBeFocused();
    expect(await entry.evaluate((node, old) => node === old, previous)).toBe(true);
    await entry.press('Enter');

    await expect(page.getByLabel('Configured Breadcrumb menu clicks', { exact: true })).toHaveText('1');
    await expect(entry).toBeHidden();
    await expect(root.getByRole('link', { name: 'Section U', exact: true })).toBeFocused();
  });
