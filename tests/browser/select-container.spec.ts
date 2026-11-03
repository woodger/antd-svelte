import type { Page } from '@playwright/test';
import { expect, test } from './test';
import reference from './fixtures/ant-design-select-container-reference.json' with { type: 'json' };
import type { SelectContainerCase } from './fixtures/select-container-presets';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=select-container');
});

async function open(page: Page, name: string) {
  await page.getByLabel('Select reference', { exact: true }).selectOption(name);
  await page.evaluate(async () => {
    for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
  });
  const source = reference.cases.find(item => item.name === name)!;
  await expect(page.getByLabel('Select container calls', { exact: true }))
    .toHaveText(JSON.stringify(source.beforeOpen));
  await page.getByRole('combobox', { name: 'Container select', exact: true }).click();
  await expect(page.getByRole('listbox', { name: 'Container select', exact: true })).toBeVisible();
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const shadow = document.getElementById('select-shadow')!.shadowRoot!;
    const popup = [...document.querySelectorAll('.ant-select-dropdown'),
      ...shadow.querySelectorAll('.ant-select-dropdown')]
      .find(node => node.getClientRects().length && getComputedStyle(node).display !== 'none')!;
    const trigger = document.querySelector('.ant-select')!;
    const calls: { getter: string; trigger: string; tag: string; }[] = JSON.parse(
      document.querySelector('[aria-label="Select container calls"]')!.textContent!
    );
    return {
      target: popup.getRootNode() instanceof ShadowRoot ? 'shadow'
        : popup.closest<HTMLElement>('[data-select-container]')?.dataset.selectContainer ?? 'default',
      calls: [...new Map(calls.map(call => [JSON.stringify(call), call])).values()],
      matchedWidth: Math.abs(popup.getBoundingClientRect().width
        - trigger.getBoundingClientRect().width) < 1
    };
  });
}

async function check(page: Page, label: string, value: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, value) => {
    const input = node as HTMLInputElement;
    input.checked = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

for (const sample of reference.cases) {
  test(`container precedence and trigger payload match the official source for ${sample.name}`,
    async ({ page }) => {
      await open(page, sample.name);

      await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
      await expect(page.locator('[getpopupcontainer]')).toHaveCount(0);
    });

  test(`replacing the getter retains the source search, focus and selection for ${sample.name}`,
    async ({ page }) => {
      await open(page, sample.name);
      const input = page.getByRole('combobox', { name: 'Container select', exact: true });
      await input.fill('alp');
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 2));
      const original = await input.elementHandle();
      const active = await input.getAttribute('aria-activedescendant');
      const popup = await page.getByRole('listbox').elementHandle();

      await page.getByRole('button', { name: 'Refresh select function', exact: true })
        .evaluate(button => (button as HTMLElement).click());
      await page.evaluate(async () => {
        for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
      });

      expect({
        same: await input.evaluate((node, old) => node === old, original),
        value: await input.inputValue(),
        selection: await input.evaluate(node => [
          (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
        ]),
        focused: await input.evaluate(node => document.activeElement === node),
        activeRetained: await input.getAttribute('aria-activedescendant') === active
      }).toEqual(sample.refresh);
      expect(await page.getByRole('listbox').evaluate((node, old) => node === old, popup)).toBe(true);
      await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
      await expect(page.getByLabel('Select container searches', { exact: true })).toHaveText('["alp"]');
    });
}

for (const component of ['select', 'select-multiple', 'auto-complete',
  'auto-complete-textarea'] as const satisfies readonly SelectContainerCase['component'][]) {
  test(`shadow ${component} supports pointer selection and native FormData`, async ({ page }) => {
    await open(page, `${component}-shadow`);
    const input = page.getByRole('combobox', { name: 'Container select', exact: true });

    await page.getByRole('option', { name: 'Alpha', exact: true }).click();

    expect(await page.locator('#select-container-form').evaluate(node =>
      new FormData(node as HTMLFormElement).getAll('selected'))).toEqual(['alpha']);
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-expanded', String(component === 'select-multiple'));
    if (component === 'select-multiple') {
      await expect(page.getByRole('option', { name: 'Alpha', exact: true }))
        .toHaveAttribute('aria-selected', 'true');
      await page.getByRole('option', { name: 'Beta', exact: true }).click();
      expect(await page.locator('#select-container-form').evaluate(node =>
        new FormData(node as HTMLFormElement).getAll('selected'))).toEqual(['alpha', 'beta']);
    } else await expect(input).toHaveValue(component === 'select' ? 'Alpha' : 'alpha');
  });

  test(`portal ${component} keeps keyboard selection, Escape and outside dismissal`, async ({ page }) => {
    await open(page, `${component}-parent`);
    const input = page.getByRole('combobox', { name: 'Container select', exact: true });
    await input.fill('alp');

    await input.press('ArrowUp');
    await input.press('ArrowDown');
    await input.press('Enter');

    expect(await page.locator('#select-container-form').evaluate(node =>
      new FormData(node as HTMLFormElement).getAll('selected'))).toEqual(['alpha']);
    await expect(input).toBeFocused();
    if (component !== 'select-multiple') await input.click();
    await input.press('Escape');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
    await input.click();
    await page.getByLabel('Select outside', { exact: true }).click();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByLabel('Select outside', { exact: true })).toBeFocused();
  });

  test(`portal ${component} follows container and theme updates without replacing DOM`, async ({ page }) => {
    await open(page, `${component}-parent`);
    const popup = page.getByRole('listbox');
    const original = await popup.elementHandle();
    const input = page.getByRole('combobox', { name: 'Container select', exact: true });
    await input.fill('alp');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 2));

    await check(page, 'Alternate select container', true);
    await expect(page.locator('#select-child [role=listbox]')).toBeVisible();
    await expect(page.locator('#select-parent [role=listbox]')).toHaveCount(0);
    await check(page, 'Override select component theme', true);
    await expect(popup).toHaveCSS('--ant-select-option-height', '42px');
    await expect(popup).toHaveCSS('--ant-color-bg-elevated', '#234567');
    await check(page, 'Dark select theme', true);
    await expect(popup).toHaveCSS('--select-origin', 'dark');
    await expect(popup).toHaveCSS('--ant-color-bg-elevated', '#234567');
    await check(page, 'Override select component theme', false);
    await expect(popup).not.toHaveCSS('--ant-color-bg-elevated', '#234567');
    await expect(popup).toHaveCSS('--ant-select-option-height', '32px');

    expect(await popup.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('alp');
    expect(await input.evaluate(node => [
      (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
    ])).toEqual([1, 2]);
    await popup.evaluate(node => node.dispatchEvent(new Event('scroll')));
    await expect(page.getByLabel('Select container scrolls', { exact: true })).toHaveText('1');
  });

  test(`removing the ${component} provider tree releases portals and callbacks`, async ({ page }) => {
    await open(page, `${component}-shadow`);
    await expect(page.getByRole('listbox')).toBeVisible();
    const calls = await page.getByLabel('Select owner calls', { exact: true }).textContent();

    await check(page, 'Mount select tree', false);
    await page.getByLabel('Select outside', { exact: true }).focus();
    await check(page, 'Dark select theme', true);
    await page.evaluate(async () => {
      for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
    });

    await expect(page.locator('.ant-select-dropdown,[data-select-container]')).toHaveCount(0);
    await expect(page.getByLabel('Select owner calls', { exact: true })).toHaveText(calls!);
    await expect(page.getByLabel('Select outside', { exact: true })).toBeFocused();
  });

  test(`portal ${component} tracks trigger width and RTL after layout changes`, async ({ page }) => {
    await open(page, `${component}-parent`);
    const popup = page.getByRole('listbox');
    await page.locator('#select-container-form').evaluate(node => {
      node.style.width = '380px';
      node.style.marginLeft = '30px';
    });
    await check(page, 'Right to left', true);

    await expect(popup).toHaveAttribute('dir', 'rtl');
    await expect.poll(() => popup.evaluate(node => {
      const anchor = document.querySelector('.ant-select')!.getBoundingClientRect();
      const bounds = node.getBoundingClientRect();
      return {
        width: Math.abs(bounds.width - anchor.width) < 1,
        right: Math.abs(bounds.right - anchor.right) < 1,
        gap: Math.min(Math.abs(bounds.top - anchor.bottom - 4),
          Math.abs(anchor.top - bounds.bottom - 4)) < 1
      };
    })).toEqual({ width: true, right: true, gap: true });
  });

  test(`portal ${component} keeps native dialog selection and Escape ownership`, async ({ page }) => {
    await page.getByLabel('Select reference', { exact: true }).selectOption(`${component}-parent`);
    await check(page, 'Select in native dialog', true);
    const dialog = page.getByRole('dialog', { name: 'Select container dialog', exact: true });
    const input = dialog.getByRole('combobox', { name: 'Container select', exact: true });
    await input.click();
    await page.getByRole('option', { name: 'Alpha', exact: true }).click();
    await expect(input).toBeFocused();
    expect(await dialog.locator('form').evaluate(node =>
      new FormData(node as HTMLFormElement).getAll('selected'))).toEqual(['alpha']);

    if (component !== 'select-multiple') await input.click();
    await input.press('Escape');

    await expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(input).toBeFocused();
    await page.getByLabel('Select outside', { exact: true }).evaluate(node =>
      (node as HTMLElement).focus());
    await expect(input).toBeFocused();
  });

  test(`repeated ${component} popup cycles leave one live surface and no detached options`,
    async ({ page }) => {
      await open(page, `${component}-parent`);
      const input = page.getByRole('combobox', { name: 'Container select', exact: true });
      for (let cycle = 0; cycle < 3; cycle++) {
        await input.press('Escape');

        await expect(page.locator('.ant-select-dropdown'))
          .toHaveCount(component.startsWith('select') ? 0 : 1);
        await expect(page.getByRole('listbox')).toHaveCount(0);
        await expect(input).toBeFocused();
        await input.click();
        await expect(page.getByRole('listbox')).toBeVisible();
        await expect(page.locator('.ant-select-dropdown')).toHaveCount(1);
      }
    });
}

test('Select returns an open portal to its inline layout when the provider getter is removed',
  async ({ page }) => {
    await open(page, 'select-parent');
    const popup = page.getByRole('listbox');
    const original = await popup.elementHandle();
    const input = page.getByRole('combobox', { name: 'Container select', exact: true });

    await check(page, 'Inherit select container', false);

    await expect(page.locator('.container > [role=listbox]')).toBeVisible();
    await expect(popup).not.toHaveAttribute('popover');
    expect(await popup.evaluate((node, old) => node === old, original)).toBe(true);
    await expect.poll(() => snapshot(page)).toMatchObject({ target: 'default', matchedWidth: true });
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toBeFocused();
  });
