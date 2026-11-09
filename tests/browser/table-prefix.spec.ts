import { test, expect } from './test';
import reference from './fixtures/ant-design-table-prefix-reference.json' with { type: 'json' };
import { snapshotTablePrefix } from './table-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Table prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=table-prefix');
      await page.getByRole('combobox', { name: 'Table prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Table prefix scope', exact: true })
        .selectOption(scope);
      const root = page.locator('.fixture-table-prefix');
      await expect(root.getByRole('table')).toBeVisible();
      await page.mouse.move(1300, 1100);
      const mode = 'mode' in entry.sample ? entry.sample.mode : undefined;
      if (mode === 'header-hover') await root.locator('th[data-ant-table-sortable]')
        .hover({ position: { x: 4, y: 4 } });
      if (mode === 'selected-hover') await root.locator('tbody tr').first().locator('td').last()
        .hover();
      if (mode === 'expand-hover') await root.locator('button[data-ant-table-part="expand-icon"]')
        .first().hover();
      if (mode === 'filter-hover') await root.locator('[data-ant-table-filter-part="trigger"]')
        .hover();
      if (mode === 'filter-popup') {
        await root.locator('[data-ant-table-filter-part="trigger"]').click();
        await expect(root.getByRole('dialog')).toBeVisible();
        await page.mouse.move(1300, 1100);
      }

      const expected = structuredClone(entry.result[scope]);
      if (entry.inheritedDropdown && scope !== 'sibling') {
        // Source custom menu prefix теряет CSS; Native сохраняет оформление своего списка.
        expected.filterMenu = entry.inheritedDropdown[scope].filterMenu;
      }

      await expect.poll(() => page.evaluate(snapshotTablePrefix)).toEqual(expected);
    });
  }
}

test('Table prefix updates retain expanded draft, DOM, focus, selection and controls',
  async ({ page }) => {
    await page.goto('/?fixture=table-prefix');
    await page.getByRole('checkbox', { name: 'Live Table prefix', exact: true }).check();
    const root = page.locator('.fixture-table-prefix');
    const input = root.getByRole('textbox', { name: 'Table prefix draft', exact: true });
    const table = root.getByRole('table');
    const checkbox = root.locator('tbody tr[data-ant-table-part="row"]').first()
      .getByRole('checkbox');
    await input.fill('Retained draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));
    const oldRoot = await root.elementHandle();
    const oldTable = await table.elementHandle();
    const oldInput = await input.elementHandle();
    const oldCheckbox = await checkbox.elementHandle();
    const id = await checkbox.getAttribute('id');

    for (const step of reference.transitions) {
      await page.getByRole('textbox', { name: 'Live Table prefix value', exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);
      await page.mouse.move(1300, 1100);

      await expect.poll(() => page.evaluate(snapshotTablePrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await table.evaluate((node, old) => node === old, oldTable)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      expect(await checkbox.evaluate((node, old) => node === old, oldCheckbox)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue(step.value);
      expect(await input.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(step.selection);
      await expect(checkbox).toBeChecked();
      expect(await checkbox.getAttribute('id')).toBe(id);
      await expect(page.getByLabel('Table prefix events', { exact: true })).toHaveText('');
    }

    await root.locator('.sort-button').focus();
    await page.keyboard.press('Enter');
    await expect(root.locator('th[aria-sort="ascending"]')).toBeVisible();
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
    await expect(page.getByLabel('Table prefix events', { exact: true })).toHaveText('sort|selection');
    expect(await page.getByRole('form', { name: 'Table prefix form', exact: true }).evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Retained draft');
  });

test('Table local and dropdown prefixes retain an open filter draft and shared child namespaces',
  async ({ page }) => {
    await page.goto('/?fixture=table-prefix');
    await page.getByRole('checkbox', { name: 'Live Table prefix', exact: true }).check();
    const root = page.locator('.fixture-table-prefix');
    const trigger = root.locator('[data-ant-table-filter-part="trigger"]');
    await trigger.click();
    const panel = root.getByRole('dialog');
    const choice = panel.getByRole('checkbox', { name: 'Ten', exact: true });
    await choice.check();
    await choice.focus();
    const oldPanel = await panel.elementHandle();
    const oldChoice = await choice.elementHandle();
    const panelId = await panel.getAttribute('id');
    for (const [label, value] of [['Local Table prefix value', 'grid'],
      ['Dropdown Table prefix value', 'filters'], ['Live Table prefix value', 'inner']]) {
      await page.getByRole('textbox', { name: label, exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);

      await expect(panel).toBeVisible();
      await expect(choice).toBeChecked();
      await expect(choice).toBeFocused();
      expect(await panel.evaluate((node, old) => node === old, oldPanel)).toBe(true);
      expect(await choice.evaluate((node, old) => node === old, oldChoice)).toBe(true);
      await expect(panel).toHaveAttribute('id', panelId!);
    }
    await expect(root).toHaveClass(/\bgrid-wrapper\b/);
    await expect(panel).toHaveClass(/\binner-dropdown\b/);
    await expect(panel.locator('.filters-menu')).toHaveCount(1);
    await expect(panel.locator('.inner-checkbox-wrapper')).toHaveCount(2);
    await expect(panel.locator('.inner-btn')).toHaveCount(2);
    await expect(page.getByLabel('Table prefix events', { exact: true })).toHaveText('');
    await choice.press('Enter');

    await expect(panel).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(root.locator('tbody tr[data-ant-table-part="row"]')).toHaveCount(1);
    await expect(page.getByLabel('Table prefix events', { exact: true })).toHaveText('filter');
    await page.getByRole('checkbox', { name: 'Mount prefix Table', exact: true }).uncheck();

    await expect(root).toHaveCount(0);
    await expect(page.locator('head style[data-ant-svelte-theme^="table-prefix:"]')).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Mount prefix Table', exact: true }).check();

    await expect(root).toHaveClass(/\bgrid-wrapper\b/);
    await expect(page.locator('head style[data-ant-svelte-theme="table-prefix:grid:inner"]'))
      .toHaveCount(1);
    await expect(page.getByLabel('Table prefix events', { exact: true })).toHaveText('');
  });

for (const palette of ['light-blue', 'dark-green', 'compact-purple']) {
  test(`Table preserves canonical ${palette} default styling and fixed scroll during prefix updates`,
    async ({ page }) => {
      await page.goto('/?fixture=table-prefix');
      await page.getByRole('checkbox', { name: 'Live Table prefix', exact: true }).check();
      await page.getByRole('checkbox', { name: 'Source prefix Table theme', exact: true }).uncheck();
      await page.getByRole('combobox', { name: 'Default Table palette', exact: true })
        .selectOption(palette);
      const prefixInput = page.getByRole('textbox', { name: 'Live Table prefix value', exact: true });
      await prefixInput.fill('');
      await page.getByRole('checkbox', { name: 'Fixed prefix Table', exact: true }).check();
      const root = page.locator('.fixture-table-prefix');
      const input = root.getByRole('textbox', { name: 'Table prefix draft', exact: true });
      await input.fill('Fixed draft');
      await root.getByRole('region').evaluate(node => { node.scrollLeft = 120; });
      const scroll = await root.getByRole('region').evaluate(node => node.scrollLeft);
      await page.mouse.move(1300, 1100);
      await page.evaluate(() => Promise.all(document.getAnimations()
        .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map(animation => animation.finished.catch(() => {}))));
      const canonical = await page.evaluate(snapshotTablePrefix);
      const oldInput = await input.elementHandle();

      await prefixInput.evaluate((node: HTMLInputElement) => {
        node.value = 'suite';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

      await expect.poll(() => page.evaluate(snapshotTablePrefix)).toEqual(canonical);
      await expect(input).toHaveValue('Fixed draft');
      await expect(input).toBeFocused();
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      expect(await root.getByRole('region').evaluate(node => node.scrollLeft)).toBe(scroll);
      await expect(root.locator('thead th').first()).toHaveCSS('position', 'sticky');
      await expect(page.getByLabel('Table prefix events', { exact: true })).toHaveText('');
    });
}


test('Table owner updates preserve independent pager focus, page and keyboard actions',
  async ({ page }) => {
    await page.goto('/?fixture=table-prefix');
    await page.getByRole('checkbox', { name: 'Live Table prefix', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Live Table paging', exact: true }).check();
    await page.getByRole('textbox', { name: 'Local Table prefix value', exact: true }).fill('grid');
    const root = page.locator('.fixture-table-prefix');
    const pager = root.getByRole('navigation');
    const second = pager.getByRole('button', { name: 'Page 2', exact: true });
    await second.click();
    await second.focus();
    const oldPager = await pager.elementHandle();
    const oldSecond = await second.elementHandle();
    await expect(root.locator('tbody tr[data-ant-table-part="row"]')).toContainText('Beta');
    await expect(pager.locator('ul')).toHaveClass(/\bsuite-pagination\b/);
    await expect(pager.locator('ul')).toHaveClass(/\bgrid-pagination\b/);

    for (const [label, value] of [['Live Table prefix value', 'next'],
      ['Local Table prefix value', 'ledger']]) {
      await page.getByRole('textbox', { name: label, exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);

      await expect(second).toBeFocused();
      expect(await pager.evaluate((node, old) => node === old, oldPager)).toBe(true);
      expect(await second.evaluate((node, old) => node === old, oldSecond)).toBe(true);
      await expect(second).toHaveAttribute('aria-current', 'page');
    }
    await expect(root).toHaveClass(/\bledger-wrapper\b/);
    await expect(pager.locator('ul')).toHaveClass(/\bnext-pagination\b/);
    await expect(pager.locator('ul')).toHaveClass(/\bledger-pagination\b/);
    await expect(page.getByLabel('Table prefix events', { exact: true })).toHaveText('paginate');
    await pager.getByRole('button', { name: 'Page 1', exact: true }).focus();
    await page.keyboard.press('Enter');

    await expect(root.locator('tbody tr[data-ant-table-part="row"]')).toContainText('Alpha');
    await expect(page.getByLabel('Table prefix events', { exact: true }))
      .toHaveText('paginate|paginate');
  });
