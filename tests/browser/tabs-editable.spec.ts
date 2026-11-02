import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-editable-metrics.json' with { type: 'json' };

const owned = (page: Page) => page.locator('#tabs-editable-main');
const tab = (page: Page, name: string) => owned(page).getByRole('tab', { name, exact: true });
const remove = (page: Page, key: string) => owned(page)
  .locator(`[data-tabs-cell="${key}"] .ant-tabs-tab-remove`);
const events = (page: Page) => page.getByLabel('Tabs edit events', { exact: true });

async function check(page: Page, label: string, value = true) {
  await page.getByLabel(label, { exact: true }).evaluate((element, checked) => {
    const input = element as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto('/?fixture=tabs-editable');
});

for (const sample of reference.cases) {
  test(`editable Tabs match source action controls for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Tabs editable reference', { exact: true }).selectOption(sample.name);
    const root = page.locator('#tabs-editable-reference');
    for (const name of ['remove', 'add'] as const) {
      const control = root.locator(name === 'remove' ? '.ant-tabs-tab-remove' : '.ant-tabs-nav-add');
      const expected = sample[name];
      await expect(control).toHaveCount(expected ? 1 : 0);
      if (!expected) continue;

      expect(await control.evaluate(element => ({
        label: element.getAttribute('aria-label'),
        text: element.textContent,
        tabIndex: (element as HTMLButtonElement).tabIndex,
        box: { width: getComputedStyle(element).width, height: getComputedStyle(element).height },
        paths: [...element.querySelectorAll('path')].map(path => path.getAttribute('d'))
      }))).toEqual(expected);
    }
    await expect(root.locator('button button')).toHaveCount(0);
  });
}

for (const sample of reference.metrics) {
  test(`editable Tabs match source geometry ${sample.direction}/${sample.tabPlacement}/${sample.size}`,
    async ({ page }) => {
      await check(page, 'RTL editable Tabs', sample.direction === 'rtl');
      await page.getByLabel('Editable Tabs placement', { exact: true })
        .selectOption(sample.tabPlacement);
      await page.getByLabel('Editable Tabs size', { exact: true }).selectOption(sample.size);
      const root = page.locator('#tabs-editable-reference');
      const selectors = {
        cell: '.ant-tabs-tab',
        tab: '[role="tab"]',
        remove: '.ant-tabs-tab-remove',
        add: '.ant-tabs-nav-add'
      };
      for (const name of ['cell', 'tab', 'remove', 'add'] as const) {
        const expected = sample[name];
        await expect.poll(() => root.locator(selectors[name]).evaluate((element, fields) => {
          const css = getComputedStyle(element);
          return Object.fromEntries(fields.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
        }, Object.keys(expected)), { message: `${sample.direction}/${sample.tabPlacement}/${name}` })
          .toEqual(expected);
      }
    });
}

test('edit requests leave items and selection with the owner and never submit the form',
  async ({ page }) => {
    await owned(page).getByRole('button', { name: 'Add tab', exact: true }).click();
    await remove(page, 'beta').click();

    await expect(events(page)).toHaveText('[{"action":"add","event":"click"},'
      + '{"action":"remove","key":"beta"}]');
    await expect(owned(page).getByRole('tab')).toHaveCount(5);
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Tabs editable changes', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Tabs editable clicks', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Tabs editable submissions', { exact: true })).toHaveText('0');
  });

test('accepted add keeps the same native add button and respects owner selection', async ({ page }) => {
  await check(page, 'Accept Tabs edits');
  await check(page, 'Select owner edit result');
  const add = owned(page).getByRole('button', { name: 'Add tab', exact: true });
  await add.focus();
  const original = await add.elementHandle();

  await add.press('Enter');

  await expect(tab(page, 'new-1')).toHaveAttribute('aria-selected', 'true');
  await expect(add).toBeFocused();
  expect(await add.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(events(page)).toHaveText('[{"action":"add","event":"click"}]');
  await expect(page.getByLabel('Tabs editable changes', { exact: true })).toHaveText('[]');
});

test('keyboard addition keeps the focused action inside the scroll viewport', async ({ page }) => {
  await check(page, 'Accept Tabs edits');
  await check(page, 'Select owner edit result');
  const add = owned(page).getByRole('button', { name: 'Add tab', exact: true });
  await add.focus();

  for (let index = 1; index <= 5; index++) {
    await add.press('Space');

    await expect(tab(page, `new-${index}`)).toHaveAttribute('aria-selected', 'true');
    await expect(add).toBeFocused();
    await expect.poll(() => add.evaluate(element => {
      const viewport = element.closest('.ant-tabs-nav-wrap')!.getBoundingClientRect();
      const bounds = element.getBoundingClientRect();
      return bounds.left >= viewport.left - 1 && bounds.right <= viewport.right + 1;
    })).toBe(true);
  }
});

for (const key of ['Delete', 'Backspace', 'Control+Delete']) {
  test(`${key} requests removal and moves focus even when the owner declines`, async ({ page }) => {
    await tab(page, 'Beta').focus();
    await tab(page, 'Beta').press(key);

    await expect(events(page)).toHaveText('[{"action":"remove","key":"beta"}]');
    await expect(tab(page, 'Gamma')).toBeFocused();
    await expect(tab(page, 'Beta')).toHaveCount(1);
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Tabs editable changes', { exact: true })).toHaveText('[]');
  });
}

test('removing the last enabled tab focuses its predecessor and skips disabled entries',
  async ({ page }) => {
    await check(page, 'Accept Tabs edits');
    await tab(page, 'Gamma').focus();
    await tab(page, 'Gamma').press('Delete');

    await expect(tab(page, 'Gamma')).toHaveCount(0);
    await expect(tab(page, 'Beta')).toBeFocused();
    await expect(events(page)).toHaveText('[{"action":"remove","key":"gamma"}]');
  });

test('middle mouse removal preserves native activation and neighboring focus', async ({ page }) => {
  await check(page, 'Accept Tabs edits');
  await tab(page, 'Beta').focus();
  await tab(page, 'Beta').click({ button: 'middle' });

  await expect(tab(page, 'Beta')).toHaveCount(0);
  await expect(tab(page, 'Gamma')).toBeFocused();
  await expect(events(page)).toHaveText('[{"action":"remove","key":"beta"}]');
  await expect(page.getByLabel('Tabs editable clicks', { exact: true })).toHaveText('[]');
});

test('nonclosable and disabled tabs reject removal while provider disabled does not block edits',
  async ({ page }) => {
    await expect(remove(page, 'fixed')).toHaveCount(0);
    await expect(remove(page, 'locked')).toHaveCount(0);
    await tab(page, 'Fixed').focus();
    await tab(page, 'Fixed').press('Delete');

    await expect(events(page)).toHaveText('[]');
    await check(page, 'Disable Tabs provider');
    await remove(page, '').click();

    await expect(events(page)).toHaveText('[{"action":"remove","key":""}]');
    await expect(tab(page, 'Locked')).toBeDisabled();
  });

test('closing the active empty key preserves fallback and repairs focus without change callbacks',
  async ({ page }) => {
    await check(page, 'Accept Tabs edits');
    await remove(page, '').click();

    await expect(tab(page, 'Alpha')).toHaveCount(0);
    await expect(tab(page, 'Fixed')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'Fixed')).toBeFocused();
    await expect(events(page)).toHaveText('[{"action":"remove","key":""}]');
    await expect(page.getByLabel('Tabs editable changes', { exact: true })).toHaveText('[]');
  });

test('removing a different pane retains native drafts, focus and form data', async ({ page }) => {
  await check(page, 'Accept Tabs edits');
  await tab(page, 'Beta').click();
  const input = owned(page).getByRole('textbox', { name: 'Editable Beta draft', exact: true });
  await input.fill('Retained Beta');
  const original = await input.elementHandle();

  await remove(page, 'gamma').evaluate(element => (element as HTMLButtonElement).click());

  await expect(tab(page, 'Gamma')).toHaveCount(0);
  await expect(input).toHaveValue('Retained Beta');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await owned(page).evaluate(element => [...new FormData(element.closest('form')!).entries()]))
    .toEqual([['alpha', 'Alpha draft'], ['beta', 'Retained Beta']]);
});

test('switching editable structure preserves keyed pane content and focused tab identity by key',
  async ({ page }) => {
    const draft = owned(page).getByRole('textbox', { name: 'Editable Alpha draft', exact: true });
    await draft.fill('Kept Alpha');
    const original = await draft.elementHandle();
    await tab(page, 'Beta').focus();

    for (const type of ['line', 'card', 'editable-card']) {
      await page.getByLabel('Editable Tabs type', { exact: true }).evaluate((element, type) => {
        const select = element as HTMLSelectElement;
        select.value = type;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }, type);

      await expect(tab(page, 'Beta')).toBeFocused();
      await expect(draft).toHaveValue('Kept Alpha');
      expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    }
  });

test('hiding a focused add button returns focus to an eligible tab', async ({ page }) => {
  await owned(page).getByRole('button', { name: 'Add tab', exact: true }).focus();
  await check(page, 'Hide Tabs add');

  await expect(owned(page).getByRole('button', { name: 'Add tab', exact: true })).toHaveCount(0);
  await expect(tab(page, 'Alpha')).toBeFocused();
  await expect(events(page)).toHaveText('[]');
});

for (const setting of ['Disable editable Beta', 'Close editable Beta']) {
  test(`changing ${setting} repairs focused remove controls`, async ({ page }) => {
    await remove(page, 'beta').focus();
    await check(page, setting, setting === 'Disable editable Beta');

    await expect(remove(page, 'beta')).toHaveCount(0);
    await expect(tab(page, setting === 'Disable editable Beta' ? 'Alpha' : 'Beta')).toBeFocused();
    await expect(events(page)).toHaveText('[]');
  });
}

test('owner focus after a keyboard edit remains outside Tabs', async ({ page }) => {
  await check(page, 'Accept Tabs edits');
  await check(page, 'Owner focus after edit');
  await tab(page, 'Beta').focus();
  await tab(page, 'Beta').press('Delete');

  await expect(tab(page, 'Beta')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Editable Tabs outside', exact: true }))
    .toBeFocused();
});

test('localized passive action icons keep accessible names and native keyboard removal',
  async ({ page }) => {
    await check(page, 'Localized Tabs actions');
    await check(page, 'Custom Tabs action icons');
    await check(page, 'RTL editable Tabs');
    await check(page, 'Dark editable Tabs');
    await check(page, 'Compact editable Tabs');
    const add = owned(page).getByRole('button', { name: 'Add section', exact: true });

    await expect(add).toContainText('Add icon');
    await expect(remove(page, '')).toHaveAccessibleName('Close section');
    await expect(remove(page, '')).toContainText('Remove icon');
    await remove(page, '').focus();
    await remove(page, '').press('Space');

    await expect(events(page)).toHaveText('[{"action":"remove","key":""}]');
    await expect(page.getByLabel('Tabs editable submissions', { exact: true })).toHaveText('0');
  });

test('unmounting during an edit cancels deferred focus repair and keeps owner focus',
  async ({ page }) => {
    await check(page, 'Unmount during Tabs edit');
    await check(page, 'Owner focus after edit');
    await tab(page, 'Beta').focus();
    await tab(page, 'Beta').press('Delete');

    await expect(owned(page)).toHaveCount(0);
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    await expect(page.getByRole('textbox', { name: 'Editable Tabs outside', exact: true }))
      .toBeFocused();
    await expect(events(page)).toHaveText('[{"action":"remove","key":"beta"}]');
    await expect(page.getByLabel('Tabs editable changes', { exact: true })).toHaveText('[]');
  });
