import { test, expect } from './test';
import reference from './fixtures/ant-design-dropdown-prefix-reference.json' with { type: 'json' };
import { snapshotDropdownPrefix } from './dropdown-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Dropdown prefixes match Source menu and arrow CSS for ${entry.sample.id}/${scope}`, async ({
      page
    }) => {
      await page.goto('/?fixture=dropdown-prefix');
      await page.getByRole('combobox', { name: 'Dropdown prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Dropdown prefix scope', exact: true })
        .selectOption(scope);
      await expect(page.getByRole('menu', { name: 'Prefix commands', exact: true })).toBeVisible();
      await page.mouse.move(1090, 5);

      await expect.poll(() => page.evaluate(snapshotDropdownPrefix)).toEqual(entry.nativeLayout[scope]);
    });
  }
}

test('Dropdown prefix changes retain popup/menu/command and trigger identity, focus and native link behavior', async ({
  page
}) => {
  await page.goto('/?fixture=dropdown-prefix');
  await page.getByRole('checkbox', { name: 'Live Dropdown prefix', exact: true }).check();
  const trigger = page.getByRole('button', { name: 'Open commands', exact: true });
  const popup = page.locator('[data-ant-dropdown-popup]');
  const menu = page.getByRole('menu', { name: 'Prefix commands', exact: true });
  const command = menu.getByRole('menuitem', { name: 'Normal', exact: true });
  await command.focus();
  await page.mouse.move(1090, 5);
  const oldTrigger = await trigger.elementHandle();
  const oldPopup = await popup.elementHandle();
  const oldMenu = await menu.elementHandle();
  const oldCommand = await command.elementHandle();
  const menuId = await menu.getAttribute('id');
  const controls = await trigger.getAttribute('aria-controls');

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Dropdown prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotDropdownPrefix)).toEqual({
      ...step.result, title: reference.nativeLayoutLive.title
    });
    expect(await trigger.evaluate((node, old) => node === old, oldTrigger)).toBe(step.sameTrigger);
    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(step.samePopup);
    expect(await menu.evaluate((node, old) => node === old, oldMenu)).toBe(step.sameMenu);
    expect(await command.evaluate((node, old) => node === old, oldCommand)).toBe(step.sameCommand);
    await expect(command).toBeFocused();
    await expect(menu).toHaveAttribute('id', menuId!);
    await expect(trigger).toHaveAttribute('aria-controls', controls!);
    await expect(page.getByLabel('Dropdown prefix events', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Dropdown prefix changes', { exact: true })).toHaveText('[]');
  }
  await page.getByRole('textbox', { name: 'Local Dropdown prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'commands';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(popup).toHaveClass(/\bcommands\b/);
  await expect(menu).toHaveClass(/\bcommands-menu\b/);
  await expect(command).toBeFocused();
  await command.press('r');

  await expect(menu.getByRole('menuitem', { name: 'Rich label', exact: true })).toBeFocused();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/#dropdown-prefix-destination$/);
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByLabel('Dropdown prefix events', { exact: true })).toHaveText('["link"]');
  await expect(page.getByLabel('Dropdown prefix changes', { exact: true })).toHaveText('[]');
});

test('Dropdown custom prefix keeps native reduced motion rules above Source item transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fixture=dropdown-prefix');
  await page.getByRole('combobox', { name: 'Dropdown prefix sample', exact: true }).selectOption('local');
  const popup = page.locator('[data-ant-dropdown-popup]');
  const menu = page.getByRole('menu', { name: 'Prefix commands', exact: true });
  const command = menu.getByRole('menuitem', { name: 'Normal', exact: true });
  await command.hover();

  await expect(popup).toHaveCSS('transition-duration', '0s');
  await expect(menu).toHaveCSS('transition-duration', '0s');
  await expect(command).toHaveCSS('transition-duration', '0s');
});
