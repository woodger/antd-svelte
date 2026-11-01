import { test, expect } from './test';
import reference from './fixtures/ant-design-select-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=select-theme');
  await expect(page.getByRole('heading', { name: 'Source Select tokens', exact: true })).toBeVisible();
});

for (const sample of reference.cases) {
  test(`Select styles match official UMD for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Select token preset', { exact: true }).selectOption(sample.name);
    const selectors: Record<string, string> = {};
    for (const mode of ['single', 'multiple']) {
      for (const size of ['middle', 'small', 'large']) {
        const name = `${mode}-${size}`;
        selectors[name] = `.select-token-${name} .ant-select`;
        selectors[`${name}-input`] = `${selectors[name]} .ant-select-input`;
        selectors[`${name}-suffix`] = `${selectors[name]} .ant-select-suffix`;
        if (mode === 'multiple') {
          selectors[`${name}-tag`] = `${selectors[name]} .ant-select-selection-item`;
        }
      }
    }
    selectors.disabled = '.select-token-disabled .ant-select';
    selectors.disabledTag = '.select-token-disabled .ant-select-selection-item';
    selectors.popup = '.select-token-popup .ant-select-dropdown';
    selectors.clear = '.select-token-popup .ant-select-clear';
    selectors.empty = '.select-token-empty .ant-select-item-empty';
    for (const name of ['Alpha', 'Beta', 'Disabled']) {
      selectors[name] = `.select-token-popup [role="option"]:has-text("${name}")`;
    }
    await page.getByRole('combobox', { name: 'Themed popup', exact: true }).click();

    for (const [name, expected] of Object.entries(sample.metrics)) {
      if (name === 'empty') {
        await page.getByRole('combobox', { name: 'Themed empty', exact: true }).click();
      }
      await expect.poll(() => page.locator(selectors[name]).evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: name }).toEqual(expected);
    }
  });
}

test('token updates retain the native search editor, selection, focus and form values', async ({ page }) => {
  await page.getByLabel('Select token preset', { exact: true }).selectOption('own-tokens');
  const input = page.getByRole('combobox', { name: 'Themed popup', exact: true });
  await input.fill('remote draft');
  const original = await input.elementHandle();
  await input.evaluate(element => (element as HTMLInputElement).setSelectionRange(2, 8, 'backward'));

  await page.getByLabel('Select color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(page.locator('.select-token-popup .ant-select'))
    .toHaveCSS('background-color', 'rgb(18, 52, 86)');
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toHaveValue('remote draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate(element => {
    const input = element as HTMLInputElement;
    return [input.selectionStart, input.selectionEnd, input.selectionDirection];
  })).toEqual([2, 8, 'backward']);
  await expect(page.getByRole('listbox', { name: 'Themed popup', exact: true })).toBeVisible();
  await expect(page.getByLabel('Select value changes', { exact: true })).toHaveText('0');
  await expect(page.getByLabel('Select search changes', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Select focus events', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Select focus receiver', { exact: true })).toHaveText('true');
  expect(await page.locator('#themed-select-form').evaluate(element => {
    const data = new FormData(element as HTMLFormElement);
    return { project: data.get('project'), teams: data.getAll('teams') };
  })).toEqual({ project: 'b', teams: ['b'] });
});

test('changing the algorithm keeps the open list and option nodes while updating dimensions', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed popup', exact: true });
  await input.click();
  const option = page.getByRole('option', { name: 'Alpha', exact: true });
  const original = await option.elementHandle();

  await page.getByLabel('Select token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'compact';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(page.locator('.select-token-popup .ant-select')).toHaveCSS('font-size', '12px');
  await expect(option).toHaveCSS('min-height', '28px');
  await expect(page.locator('.select-token-multiple-middle .ant-select-selection-item'))
    .toHaveCSS('height', '20px');
  expect(await option.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Select value changes', { exact: true })).toHaveText('0');
  await expect(page.getByLabel('Select search changes', { exact: true })).toHaveText('0');
});

test('native focus activates source border tokens and keyboard selection preserves callbacks', async ({ page }) => {
  await page.getByLabel('Select token preset', { exact: true }).selectOption('own-tokens');
  const input = page.getByRole('combobox', { name: 'Themed popup', exact: true });
  const root = page.locator('.select-token-popup .ant-select');
  await input.focus();

  await expect(root).toHaveClass(/ant-select-focused/);
  await expect(root).toHaveCSS('border-color', 'rgb(17, 68, 136)');
  await expect(root).toHaveCSS('outline-style', 'none');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await input.press('Enter');

  await expect(input).toHaveValue('Gamma');
  await expect(input).toBeFocused();
  await expect(root).toHaveClass(/ant-select-focused/);
  await expect(page.getByLabel('Select value changes', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Select focus events', { exact: true })).toHaveText('1');
  await page.getByLabel('Select token preset', { exact: true }).focus();
  await expect(root).not.toHaveClass(/ant-select-focused/);
});

test('removing source settings restores native styling without replacing the open control', async ({ page }) => {
  await page.getByLabel('Select token preset', { exact: true }).selectOption('own-aliases');
  const input = page.getByRole('combobox', { name: 'Themed popup', exact: true });
  await input.click();
  const original = await input.elementHandle();

  await page.getByLabel('Apply source Select tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  const root = page.locator('.select-token-popup .ant-select');
  await expect(root).not.toHaveClass(/ant-select-source-theme/);
  await expect(root).toHaveCSS('font-size', '14px');
  await expect(root).toHaveCSS('outline-style', 'solid');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(page.locator('head style[data-ant-svelte-theme="select-source-scope"]')).toHaveCount(0);
  await page.getByLabel('Native compact Select', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(root).toHaveCSS('height', '28px');
  await page.getByLabel('Select token preset', { exact: true }).focus();
  await input.focus();
  await expect(page.getByLabel('Select focus receiver', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Select focus events', { exact: true })).toHaveText('2');
});

test('custom prefixes and parent aliases retain the Select scope without hash classes', async ({ page }) => {
  await page.getByLabel('Select token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Parent Select aliases', { exact: true }).check();
  await page.getByLabel('Hash themed Select', { exact: true }).uncheck();
  const input = page.getByRole('combobox', { name: 'Themed popup', exact: true });
  await input.click();

  await expect(page.locator('.select-token-popup .container')).toHaveClass(/select-source-scope/);
  await expect(page.locator('.select-token-popup .container')).not.toHaveClass(/css-dev-only/);
  await expect(page.locator('.select-token-popup .ant-select')).toHaveCSS('font-size', '14px');
  await expect(page.getByRole('option', { name: 'Alpha', exact: true })).toHaveCSS('min-height', '45px');
  await expect(page.getByRole('listbox', { name: 'Themed popup', exact: true }))
    .toHaveCSS('--select-2-select-option-height', '45px');
  await page.getByLabel('Mount themed Select', { exact: true }).uncheck();

  await expect(page.locator('.samples .ant-select')).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="select-source-scope"]')).toHaveCount(0);
});

test('source clear keeps its native button and returns focus without changing search', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed popup', exact: true });
  await input.fill('query');
  await page.locator('.select-token-popup .clear').click();

  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByLabel('Select value changes', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Select search changes', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Select search text', { exact: true })).toHaveText('query');
  await expect(page.locator('.select-token-popup .clear')).toHaveCount(0);
});

test('source multiple tags use logical spacing and selection in RTL', async ({ page }) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  const root = page.locator('.select-token-multiple-middle .ant-select');
  const input = page.getByRole('combobox', { name: 'Themed multiple middle', exact: true });

  await expect(root).toHaveCSS('direction', 'rtl');
  await expect(root.locator('.ant-select-selection-item')).toHaveCSS('margin-left', '4px');
  await input.click();
  await page.getByRole('option', { name: 'Alpha', exact: true }).click();

  await expect(input).toBeFocused();
  await expect(root.locator('.ant-select-selection-item')).toHaveCount(2);
  await expect(page.getByLabel('Select value changes', { exact: true })).toHaveText('1');
});

test('filtering switches between empty and option layout without losing focus or selection', async ({ page }) => {
  await page.getByLabel('Select token preset', { exact: true }).selectOption('undefined-component-values');
  await page.getByLabel('Filter themed Select locally', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Themed popup', exact: true });
  await input.fill('missing');
  const list = page.getByRole('listbox', { name: 'Themed popup', exact: true });
  const original = await list.elementHandle();

  await expect(list).toHaveText('No results');
  await expect(list.locator('.ant-select-item-empty')).toHaveCSS('min-height', '0px');
  await expect(input).toBeFocused();
  expect(await page.locator('#themed-select-form').evaluate(element =>
    new FormData(element as HTMLFormElement).get('project'))).toBe('b');
  await input.fill('Gamma');

  const option = list.getByRole('option', { name: 'Gamma', exact: true });
  await expect(option).toHaveCSS('min-height', 'auto');
  expect(await list.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Select value changes', { exact: true })).toHaveText('0');
  await input.press('Enter');

  await expect(input).toHaveValue('Gamma');
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Select value changes', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Select search changes', { exact: true })).toHaveText('2');
});
