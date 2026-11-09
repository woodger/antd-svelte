import { test, expect } from './test';
import reference from './fixtures/ant-design-menu-prefix-reference.json' with { type: 'json' };
import { snapshotMenuPrefix } from './menu-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const mode of ['inline', 'vertical', 'horizontal', 'collapsed'] as const) {
    for (const scope of ['normal', 'nested', 'sibling'] as const) {
      test(`Menu prefixes match Source ${entry.sample.id}/${mode}/${scope}`, async ({ page }) => {
        await page.goto('/?fixture=menu-prefix');
        await page.getByRole('combobox', { name: 'Menu prefix sample', exact: true }).selectOption(entry.sample.id);
        await page.getByRole('combobox', { name: 'Menu prefix mode', exact: true }).selectOption(mode);
        await page.getByRole('combobox', { name: 'Menu prefix scope', exact: true }).selectOption(scope);
        await page.mouse.move(1270, 5);

        await expect.poll(() => page.evaluate(snapshotMenuPrefix)).toEqual(entry.matchedDivider
          ? entry.matchedDivider[mode][scope] : entry.result[mode][scope]);
      });
    }
  }
}

for (const mode of ['inline', 'vertical', 'horizontal']) {
  test(`Menu ${mode} live prefixes preserve root/item/title, focus, state and native selection`, async ({ page }) => {
    await page.goto('/?fixture=menu-prefix');
    await page.getByRole('combobox', { name: 'Menu prefix mode', exact: true }).selectOption(mode);
    await page.getByRole('checkbox', { name: 'Live Menu prefix', exact: true }).check();
    const root = page.locator('.fixture-menu-prefix');
    const item = root.locator(':scope > .sample-normal');
    const title = root.locator(':scope > .sample-parent > [role="menuitem"]');
    await item.focus();
    await page.mouse.move(1270, 5);
    const oldRoot = await root.elementHandle();
    const oldItem = await item.elementHandle();
    const oldTitle = await title.elementHandle();
    const id = await item.getAttribute('id');
    const controls = await title.getAttribute('aria-controls');

    for (const step of reference.transitions.filter(step => step.mode === mode)) {
      await page.getByRole('textbox', { name: 'Live Menu prefix value', exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotMenuPrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
      expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(step.sameItem);
      expect(await title.evaluate((node, old) => node === old, oldTitle)).toBe(step.sameTitle);
      await expect(item).toBeFocused();
      await expect(item).toHaveAttribute('id', id!);
      await expect(title).toHaveAttribute('aria-controls', controls!);
      await expect(page.getByLabel('Menu prefix ref', { exact: true })).toHaveText('mounted');
      await expect(page.getByLabel('Menu prefix events', { exact: true })).toHaveText('[]');
    }
    await page.getByRole('textbox', { name: 'Local Menu prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'navigation';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(root).toHaveClass(/navigation-root/);
    await expect(item).toHaveClass(/navigation-item/);
    await expect(item).toBeFocused();
    await item.press('Enter');

    await expect(item).toHaveClass(/navigation-item-selected/);
    await expect(page.getByLabel('Menu prefix events', { exact: true })).toHaveText('["normal"]');
    if (mode !== 'inline') await title.click();
    const link = page.getByRole('link', { name: 'Native link', exact: true });
    await link.focus();
    await link.press('Enter');

    await expect(page).toHaveURL(/#menu-prefix-destination$/);
    await expect(page.getByLabel('Menu prefix events', { exact: true })).toHaveText('["normal","link"]');
  });
}
