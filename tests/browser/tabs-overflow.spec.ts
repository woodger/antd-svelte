import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-overflow-metrics.json' with { type: 'json' };

async function check(page: Page, name: string, value = true) {
  await page.getByLabel(name, { exact: true }).evaluate(
    (element, checked) => {
      const input = element as HTMLInputElement;
      input.checked = checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    value
  );
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1800 });
  await page.goto('/?fixture=tabs-overflow');
});

for (const sample of reference.cases) {
  test(`More matches official geometry and hidden tabs for ${sample.name}`, async ({ page }) => {
    if (sample.type) await page.getByLabel('Overflow type', { exact: true }).selectOption(sample.type);
    if (sample.tabPlacement) await page.getByLabel('Overflow placement', { exact: true })
      .selectOption(sample.tabPlacement);
    await check(page, 'RTL overflow', sample.direction === 'rtl');
    if (sample.rootIcon) await check(page, 'Root More icon');
    if (sample.localized) await check(page, 'Localized More popup');
    if (sample.iconKind) await page.getByLabel('More icon', { exact: true }).selectOption(sample.iconKind);
    const root = page.locator('#tabs-overflow-main');
    const more = root.locator('.ant-tabs-nav-more');
    await more.hover();
    const menu = page.getByRole('listbox', { name: sample.label, exact: true });

    await expect(menu).toBeVisible();
    expect(await more.evaluate(element => ({
      text: element.textContent,
      paths: [...element.querySelectorAll('path')].map(path => path.getAttribute('d'))
    }))).toEqual(sample.icon);
    const selectors = {
      more,
      operations: root.locator('.ant-tabs-nav-operations'),
      menu,
      item: menu.locator('.ant-tabs-dropdown-menu-item').first(),
      remove: menu.locator('.ant-tabs-dropdown-menu-item').first()
        .locator('.ant-tabs-dropdown-menu-item-remove')
    };
    for (const key of ['more', 'operations', 'menu', 'item', 'remove'] as const) {
      const expected = sample.metrics[key];
      if (!expected) {
        await expect(selectors[key]).toHaveCount(0);
        continue;
      }
      await expect.poll(
        () => selectors[key].evaluate(
          (element, fields) => {
            const css = getComputedStyle(element);
            return Object.fromEntries(fields.map(name => [name, css[name as keyof CSSStyleDeclaration]]));
          },
          Object.keys(expected)
        ),
        { message: `${sample.name}/${key}` }
      ).toEqual(expected);
    }
    await expect.poll(() => menu.locator('.ant-tabs-dropdown-menu-item').evaluateAll(rows =>
      rows.map(row => {
        const option = row.querySelector<HTMLButtonElement>('[role="option"]')!;
        return {
          label: option.textContent!.trim(),
          disabled: option.disabled,
          removable: !!row.querySelector('.ant-tabs-dropdown-menu-item-remove')
        };
      }))).toEqual(sample.hidden);
    await expect(page.locator('button button')).toHaveCount(0);
  });
}

test('More exposes offscreen tabs and selects a native panel without submitting', async ({ page }) => {
  const root = page.locator('#tabs-overflow-main');
  const more = root.getByRole('button', { name: 'ellipsis', exact: true });
  await more.hover();
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });

  await expect(menu).toBeVisible();
  await expect(menu.getByRole('option', { name: 'Tab 10', exact: true })).toBeEnabled();
  await menu.getByRole('option', { name: 'Tab 10', exact: true }).click();

  await expect(root.getByRole('tab', { name: 'Tab 10', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
  await expect(menu).toBeHidden();
  await expect(page.getByLabel('Overflow changes', { exact: true })).toHaveText('["9"]');
  await expect(page.getByLabel('Overflow submissions', { exact: true })).toHaveText('0');
});

test('More keeps the original Add button while moving it between list and operations',
  async ({ page }) => {
    await page.getByLabel('Overflow type', { exact: true }).selectOption('editable-card');
    const root = page.locator('#tabs-overflow-main');
    const add = root.getByRole('button', { name: 'Add tab', exact: true });
    await add.focus();
    const original = await add.elementHandle();
    await expect(root.locator('.ant-tabs-nav-operations .ant-tabs-nav-add')).toHaveCount(1);

    await page.getByLabel('Overflow count', { exact: true }).evaluate(element => {
      const input = element as HTMLInputElement;
      input.value = '1';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await expect(root.locator('.ant-tabs-nav-list .ant-tabs-nav-add')).toHaveCount(1);
    await expect(add).toBeFocused();
    expect(await add.evaluate((element, previous) => element === previous, original)).toBe(true);
    await add.press('Enter');
    await expect(page.getByLabel('Overflow edits', { exact: true }))
      .toHaveText('[{"action":"add"}]');
  });

test('More keyboard opens without selection and activates through the MouseEvent contract',
  async ({ page }) => {
    const root = page.locator('#tabs-overflow-main');
    const more = root.getByRole('button', { name: 'ellipsis', exact: true });
    await more.focus();
    await more.press('ArrowDown');
    const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });

    await expect(menu).toBeVisible();
    await expect(menu).not.toHaveAttribute('aria-activedescendant');
    await more.press('ArrowDown');
    const selected = await menu.getAttribute('aria-activedescendant');
    const option = page.locator(`[id="${selected}"]`);
    const name = await option.textContent();
    await more.press('Enter');

    await expect(root.getByRole('tab', { name: name!.trim(), exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    await expect(menu).toBeVisible();
    await expect(page.getByLabel('Overflow clicks', { exact: true })).toContainText('"mouse":true');
    await more.press('Escape');

    await expect(menu).toBeHidden();
    await expect(more).toBeFocused();
  });

test('More follows source hidden items after native scrolling, including disabled and empty keys',
  async ({ page }) => {
    const root = page.locator('#tabs-overflow-main');
    await root.getByRole('tab', { name: 'Tab 10', exact: true }).focus();
    await root.locator('.ant-tabs-nav-more').hover();
    const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
    const source = reference.behavior.find(item => item.scenario === 'scrolled')!;

    await expect(menu).toBeVisible();
    await expect.poll(() => menu.getByRole('option').evaluateAll(elements => elements.map(element => ({
      label: element.textContent!.trim(),
      disabled: (element as HTMLButtonElement).disabled,
      removable: !!element.parentElement!.querySelector('.ant-tabs-dropdown-menu-item-remove')
    })))).toEqual(source.hidden);
    await expect(menu.getByRole('option', { name: 'Tab 2', exact: true })).toBeDisabled();
    await menu.getByRole('option', { name: 'Tab 1', exact: true }).click();

    await expect(root.getByRole('tab', { name: 'Tab 1', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Overflow changes', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Overflow clicks', { exact: true })).toContainText('"key":""');
  });

test('More close requests preserve the menu, selection and event boundaries when declined',
  async ({ page }) => {
    await page.getByLabel('Overflow type', { exact: true }).selectOption('editable-card');
    await check(page, 'Owner overflow focus');
    await page.locator('#tabs-overflow-main .ant-tabs-nav-more').hover();
    const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
    await menu.getByRole('button', { name: 'remove', exact: true }).first().click();

    await expect(page.getByLabel('Overflow edits', { exact: true }))
      .toHaveText('[{"action":"remove","key":"3"}]');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('option', { name: 'Tab 4', exact: true })).toHaveCount(1);
    await expect(page.getByLabel('Overflow changes', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Overflow clicks', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Overflow overlay clicks', { exact: true })).toHaveText('0');
    await expect(page.getByRole('textbox', { name: 'Overflow outside', exact: true })).toBeFocused();
  });

test('More removes accepted items without activating them or stealing owner focus', async ({ page }) => {
  await page.getByLabel('Overflow type', { exact: true }).selectOption('editable-card');
  await check(page, 'Accept overflow edits');
  await check(page, 'Owner overflow focus');
  await page.locator('#tabs-overflow-main .ant-tabs-nav-more').hover();
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  await menu.getByRole('button', { name: 'remove', exact: true }).first().click();

  await expect(page.locator('#tabs-overflow-main').getByRole('tab', { name: 'Tab 4', exact: true }))
    .toHaveCount(0);
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('option', { name: 'Tab 4', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Overflow outside', exact: true })).toBeFocused();
  await expect(page.getByLabel('Overflow changes', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Overflow overlay clicks', { exact: true })).toHaveText('0');
});

test('More preserves native cancellation while closing a clicked option', async ({ page }) => {
  await check(page, 'Cancel overflow selection');
  await page.locator('#tabs-overflow-main .ant-tabs-nav-more').hover();
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  await menu.getByRole('option', { name: 'Tab 10', exact: true }).click();

  await expect(menu).toBeHidden();
  await expect(page.locator('#tabs-overflow-main').getByRole('tab', { name: 'Tab 1', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Overflow clicks', { exact: true })).toContainText('"key":"9"');
  await expect(page.getByLabel('Overflow changes', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Overflow overlay clicks', { exact: true })).toHaveText('1');
});

test('More supports click and contextMenu triggers and controlled owner visibility', async ({ page }) => {
  await page.getByLabel('More trigger', { exact: true }).selectOption('click');
  await check(page, 'Control More visibility');
  const more = page.locator('#tabs-overflow-main .ant-tabs-nav-more');
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  await more.click();

  await expect(menu).toBeVisible();
  await more.click();

  await expect(menu).toBeHidden();
  await expect(page.getByLabel('Overflow visibility', { exact: true })).toHaveText('[true,false]');
  await page.getByLabel('More trigger', { exact: true }).selectOption('contextMenu');
  await more.click({ button: 'right' });

  await expect(menu).toBeVisible();
  await page.getByRole('textbox', { name: 'Overflow outside', exact: true }).click();

  await expect(menu).toBeHidden();
  await expect(page.getByLabel('Overflow visibility', { exact: true }))
    .toHaveText('[true,false,true,false]');
});

test('More lets an owner decline opening and keeps keyboard requests internal as in rc-tabs',
  async ({ page }) => {
    await page.getByLabel('More trigger', { exact: true }).selectOption('click');
    await check(page, 'Control More visibility');
    await check(page, 'Accept More visibility', false);
    const more = page.locator('#tabs-overflow-main .ant-tabs-nav-more');
    await more.click();

    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(page.getByLabel('Overflow visibility', { exact: true })).toHaveText('[true]');
    await more.press('ArrowDown');

    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

test('More keeps custom popup drafts and onClose while clearing pending hover after unmount',
  async ({ page }) => {
    await check(page, 'Custom More popup');
    const more = page.locator('#tabs-overflow-main .ant-tabs-nav-more');
    await more.hover();
    const draft = page.getByRole('textbox', { name: 'Tabs custom popup draft', exact: true });
    await draft.fill('Retained popup draft');
    const original = await draft.elementHandle();
    await page.getByRole('button', { name: 'Close custom Tabs popup', exact: true }).click();

    await expect(draft).toBeHidden();
    await more.hover();

    await expect(draft).toHaveValue('Retained popup draft');
    expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    await page.clock.install();
    await page.mouse.move(1200, 10);
    await check(page, 'Mount overflow', false);
    await page.clock.runFor(500);

    await expect(page.locator('[data-tabs-popup-owner="tabs-overflow-main"]')).toHaveCount(0);
    await expect(page.getByLabel('Overflow clicks', { exact: true })).toHaveText('[]');
  });

test('More preserves popup style variables and dark RTL tokens in a custom container',
  async ({ page }) => {
    await check(page, 'Portal More popup');
    await check(page, 'Styled More popup');
    await check(page, 'RTL overflow');
    await page.locator('#tabs-overflow-main .ant-tabs-nav-more').hover();
    const popup = page.locator('#tabs-more-container > .ant-tabs-dropdown');

    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS('color', 'rgb(20, 40, 60)');
    await expect(popup).toHaveCSS('background-color', 'rgb(1, 2, 3)');
    await expect(popup).toHaveCSS('direction', 'rtl');
    await check(page, 'Dark overflow');
    await check(page, 'Compact overflow');

    await expect(popup).toHaveCSS('color', 'rgb(20, 40, 60)');
    await expect(popup.locator('.ant-tabs-dropdown-menu')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
    await expect(popup.getByRole('option').first()).toHaveCSS('font-size', '12px');
  });

test('More uses source Tab focus transfer and repairs focus when all tabs fit', async ({ page }) => {
  const more = page.locator('#tabs-overflow-main .ant-tabs-nav-more');
  await more.focus();
  await more.press('ArrowDown');
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  await more.press('Tab');

  await expect(menu).toBeFocused();
  await menu.press('ArrowDown');
  await expect(menu.getByRole('option', { name: 'Tab 6', exact: true })).toBeFocused();
  await page.getByLabel('Overflow count', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(menu).toBeHidden();
  await expect(page.locator('#tabs-overflow-main').getByRole('tab', { name: 'Tab 1', exact: true }))
    .toBeFocused();
});

test('Tabs repairs focus from the More portal when its enclosing panel is hidden', async ({ page }) => {
  await check(page, 'Nested overflow Tabs');
  const more = page.locator('#tabs-overflow-main .ant-tabs-nav-more');
  await more.focus();
  await more.press('ArrowDown');
  await more.press('Tab');
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  await expect(menu).toBeFocused();
  await page.getByRole('button', { name: 'Switch outer Tabs', exact: true })
    .evaluate(element => {
      if (!(element instanceof HTMLButtonElement)) throw new Error('Expected a native button');
      element.click();
    });

  await expect(menu).toBeHidden();
  await expect(page.locator('#tabs-overflow-outer').getByRole('tab', { name: 'Other panel', exact: true }))
    .toBeFocused();
});

test('More retains focused custom controls and their focus events while popup styles change',
  async ({ page }) => {
    await check(page, 'Custom More popup');
    await page.locator('#tabs-overflow-main .ant-tabs-nav-more').hover();
    const draft = page.getByRole('textbox', { name: 'Tabs custom popup draft', exact: true });
    await draft.fill('Style update draft');
    const original = await draft.elementHandle();

    await check(page, 'Styled More popup');

    await expect(draft).toBeFocused();
    await expect(page.locator('[data-tabs-popup-owner="tabs-overflow-main"]'))
      .toBeInViewport({ ratio: 1 });
    await expect(draft).toHaveValue('Style update draft');
    expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    await expect(page.getByLabel('Overflow popup focuses', { exact: true })).toHaveText('1');
    await check(page, 'Styled More popup', false);

    await expect(draft).toBeFocused();
    await expect(page.locator('[data-tabs-popup-owner="tabs-overflow-main"]'))
      .toBeInViewport({ ratio: 1 });
    await expect(page.getByLabel('Overflow popup focuses', { exact: true })).toHaveText('1');
  });

test('More menu moves native option focus through Home, End and disabled headers', async ({ page }) => {
  const root = page.locator('#tabs-overflow-main');
  await root.getByRole('tab', { name: 'Tab 10', exact: true }).focus();
  const more = root.locator('.ant-tabs-nav-more');
  await more.focus();
  await more.press('ArrowDown');
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  await expect(menu.getByRole('option', { name: 'Tab 1', exact: true })).toBeVisible();
  await more.press('Tab');
  await expect(menu).toBeFocused();
  await menu.press('Home');

  await expect(menu.getByRole('option', { name: 'Tab 1', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');

  await expect(menu.getByRole('option', { name: 'Tab 3', exact: true })).toBeFocused();
  await page.keyboard.press('End');

  await expect(menu.getByRole('option', { name: 'Tab 5', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(menu).toBeHidden();
  await expect(root.getByRole('tab', { name: 'Tab 5', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
});

test('More leaves Escape to a nested Select before closing its own popup', async ({ page }) => {
  await check(page, 'Custom More popup');
  const more = page.locator('#tabs-overflow-main .ant-tabs-nav-more');
  await more.hover();
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  const select = page.getByRole('combobox', { name: 'More nested Select', exact: true });
  await select.click();

  await expect(page.getByRole('option', { name: 'Alpha option', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.getByRole('option', { name: 'Alpha option', exact: true })).toBeHidden();
  await expect(menu).toBeVisible();
  await expect(select).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();
});

test('More autofocus waits for the popup and cancels pending focus after unmount', async ({ page }) => {
  await check(page, 'Autofocus More popup');
  const more = page.locator('#tabs-overflow-main .ant-tabs-nav-more');
  await more.focus();
  await more.press('ArrowDown');
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });

  await expect(menu).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await more.press('ArrowDown');
  const outside = page.getByRole('textbox', { name: 'Overflow outside', exact: true });
  await outside.focus();
  await check(page, 'Mount overflow', false);
  await page.clock.runFor(200);

  await expect(outside).toBeFocused();
  await expect(page.locator('[data-tabs-popup-owner="tabs-overflow-main"]')).toHaveCount(0);
});

test.describe('mobile user agents', () => {
  test.use({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit Safari' });

  test('More follows source mobile detection while native scrolling remains available', async ({ page }) => {
    const root = page.locator('#tabs-overflow-main');
    await expect(root.getByRole('button', { name: 'ellipsis', exact: true })).toHaveCount(0);
    const last = root.getByRole('tab', { name: 'Tab 10', exact: true });
    await last.focus();

    await expect(last).toBeFocused();
    await expect.poll(() => root.locator('.ant-tabs-nav-wrap').evaluate(element => element.scrollLeft))
      .toBeGreaterThan(0);
  });
});
