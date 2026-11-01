import { test, expect } from './test';
import reference from './fixtures/ant-design-auto-complete-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto('/?fixture=auto-complete-theme');
});

for (const sample of reference.cases) {
  test(`AutoComplete matches Ant Design source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Completion token preset', { exact: true }).selectOption(sample.name);
    const selectors: Record<string, string> = {};
    for (const name of [
      'middle', 'small', 'large', 'filled', 'borderless', 'underlined',
      'disabled', 'custom', 'textarea'
    ]) {
      selectors[name] = `.completion-token-${name}`;
      selectors[name + '-input'] = `${selectors[name]} :is(input,textarea)`;
    }
    selectors.popup = '.completion-token-popup .ant-select-dropdown';
    selectors.clear = '.completion-token-popup .ant-select-clear';
    selectors.group = '.completion-token-popup .ant-select-item-group';
    selectors.empty = '.completion-token-empty .ant-select-item-empty';
    for (const name of ['Alpha', 'Beta', 'Disabled', 'Gamma']) {
      selectors[name] = `.completion-token-popup [role="option"]:has-text("${name}")`;
    }
    await page.getByRole('combobox', { name: 'Themed completion popup', exact: true }).click();

    for (const [name, expected] of Object.entries(sample.metrics)) {
      if (name === 'empty') {
        await page.getByRole('combobox', { name: 'Themed completion empty', exact: true }).click();
      }
      await expect.poll(() => page.locator(selectors[name]).evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: `${sample.name}/${name}` }).toEqual(expected);
    }
  });
}

test('theme colors preserve popup position and editor state', async ({ page }) => {
  await page.getByLabel('Completion token preset', { exact: true }).selectOption('own-tokens');
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.fill('remote draft');
  await input.evaluate(element => {
    (element as HTMLInputElement).setSelectionRange(2, 8, 'backward');
  });
  const original = await input.elementHandle();
  const popup = page.getByRole('listbox', { name: 'Themed completion popup', exact: true });
  await expect(popup).toBeVisible();
  const position = await popup.evaluate(element => [element.style.left, element.style.top]);
  expect(position.every(Boolean)).toBe(true);

  await page.getByLabel('Completion color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(page.locator('.completion-token-popup'))
    .toHaveCSS('background-color', 'rgb(18, 52, 86)');
  await expect(popup).toBeVisible();
  expect(await popup.evaluate(element => [element.style.left, element.style.top]))
    .toEqual(position);
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('remote draft');
  expect(await input.evaluate(element => {
    const input = element as HTMLInputElement;
    return [input.selectionStart, input.selectionEnd, input.selectionDirection];
  })).toEqual([2, 8, 'backward']);
  expect(await page.locator('#themed-completion-form').evaluate(element => {
    const data = new FormData(element as HTMLFormElement);
    return Object.fromEntries(data.entries());
  })).toEqual({ query: 'remote draft', custom: 'b', notes: 'b' });
  await expect(page.getByLabel('Completion theme changes', { exact: true }))
    .toHaveText('["remote draft"]');
  await expect(page.getByLabel('Completion theme searches', { exact: true }))
    .toHaveText('["remote draft"]');
  await expect(page.getByLabel('Completion theme focus events', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Completion theme openings', { exact: true })).toHaveText('[true]');
});

test('popup dimensions update without removing controller position styles', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.click();
  const popup = page.getByRole('listbox', { name: 'Themed completion popup', exact: true });
  const original = await popup.elementHandle();

  const dimensions = [['Completion popup width', '300'], ['Completion list height', '100']];
  for (const [label, value] of dimensions) {
    await page.getByLabel(label, { exact: true }).evaluate((element, value) => {
      const input = element as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
  }

  await expect(popup).toHaveCSS('width', '300px');
  await expect(popup).toHaveCSS('max-height', '100px');
  expect(await popup.evaluate(element => Boolean(element.style.left && element.style.top)))
    .toBe(true);
  expect(await popup.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Completion theme openings', { exact: true })).toHaveText('[true]');
});

test('algorithm changes preserve option nodes and keyboard selection', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.click();
  const popup = page.getByRole('listbox', { name: 'Themed completion popup', exact: true });
  const alpha = popup.getByRole('option', { name: 'Alpha', exact: true });
  const original = await alpha.elementHandle();

  await page.getByLabel('Completion token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'compact';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(alpha).toHaveCSS('min-height', '28px');
  await expect(alpha).toHaveCSS('padding-inline-start', '24px');
  await expect(input).toBeFocused();
  expect(await alpha.evaluate((element, previous) => element === previous, original)).toBe(true);
  await input.press('ArrowDown');
  await input.press('Enter');

  await expect(input).toHaveValue('c');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(popup).toHaveCount(0);
  await expect(page.getByLabel('Completion theme changes', { exact: true })).toHaveText('["c"]');
  await expect(page.getByLabel('Completion theme selections', { exact: true })).toHaveText('["c"]');
  await expect(page.getByLabel('Completion theme searches', { exact: true })).toHaveText('[]');
});

test('custom Input keeps its own tokens and native ref', async ({ page }) => {
  await page.getByLabel('Completion token preset', { exact: true })
    .selectOption('custom-input-tokens');
  await page.getByRole('button', { name: 'Focus themed custom completion', exact: true }).click();
  const input = page.getByRole('combobox', { name: 'Themed completion custom', exact: true });
  const original = await input.elementHandle();
  await input.fill('custom draft');
  await input.evaluate(element => (element as HTMLInputElement).setSelectionRange(1, 5));

  await page.getByLabel('Completion color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#778899';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(input).toBeFocused();
  await expect(input).toHaveCSS('font-size', '18px');
  await expect(input).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  await expect(input).toHaveCSS('height', '36.0625px');
  await expect(page.locator('.completion-token-custom')).toHaveCSS('min-height', '0px');
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await input.evaluate(element => (element as HTMLInputElement).selectionStart)).toBe(1);
  await expect(input).toHaveValue('custom draft');
  await expect(page.getByRole('listbox', { name: 'Themed completion custom', exact: true }))
    .toBeVisible();
});

test('native styles return without replacing the open editor', async ({ page }) => {
  await page.getByLabel('Completion token preset', { exact: true }).selectOption('own-aliases');
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.fill('draft');
  const original = await input.elementHandle();
  const optionContent = page.getByRole('option', { name: 'Alpha', exact: true }).locator('span');
  const originalContent = await optionContent.elementHandle();

  await page.getByLabel('Apply source completion tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(page.locator('.completion-token-popup')).not.toHaveClass(/ant-select-source-theme/);
  await expect(page.locator('.completion-token-popup')).toHaveCSS('font-size', '14px');
  await expect(page.locator('.completion-token-popup .ant-select-dropdown'))
    .not.toHaveAttribute('style', /--ant-select-option-height/);
  await expect(page.locator('head style[data-ant-svelte-theme="completion-source-scope"]'))
    .toHaveCount(0);
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await optionContent.evaluate((element, previous) => element === previous, originalContent))
    .toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('draft');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
});

test('custom prefixes and hash settings clean up on unmount', async ({ page }) => {
  await page.getByLabel('Completion token preset', { exact: true }).selectOption('custom-prefix');
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.click();
  await expect(page.locator('.completion-token-popup')).toHaveClass(/completion-source-scope/);
  await expect(page.locator('.completion-token-popup'))
    .toHaveCSS('--select-2-select-option-height', '45px');
  await expect(page.getByRole('option', { name: 'Alpha', exact: true }))
    .toHaveCSS('min-height', '45px');
  await page.getByLabel('Hash themed completion', { exact: true }).uncheck();

  await expect(page.locator('.completion-token-popup'))
    .not.toHaveClass(/(^|\s)css-[a-z0-9]+(\s|$)/);
  await page.getByLabel('Mount themed completion', { exact: true }).uncheck();

  await expect(input).toHaveCount(0);
  await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="completion-source-scope"]'))
    .toHaveCount(0);
});

test('source clear preserves focus and its callback sequence', async ({ page }) => {
  await page.getByLabel('Completion token preset', { exact: true }).selectOption('own-tokens');
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.fill('typed');
  await input.press('Escape');
  const clear = page.locator('.completion-token-popup')
    .getByRole('button', { name: 'Очистить', exact: true });
  await clear.focus();

  await expect(clear).toHaveCSS('opacity', '1');
  await clear.press('Enter');

  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Completion theme changes', { exact: true }))
    .toHaveText('["typed","undefined",""]');
  await expect(page.getByLabel('Completion theme searches', { exact: true }))
    .toHaveText('["typed",""]');
  await expect(page.getByLabel('Completion theme selections', { exact: true })).toHaveText('[]');
});

test('component scopes reset aliases inherited from surrounding content', async ({ page }) => {
  await page.getByLabel('Parent completion aliases', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.click();

  await expect(input).toHaveCSS('font-size', '14px');
  await expect(input).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  await expect(page.getByRole('option', { name: 'Alpha', exact: true }))
    .toHaveCSS('font-size', '14px');
  await expect(page.getByRole('combobox', { name: 'Themed completion custom', exact: true }))
    .toHaveCSS('font-size', '14px');
});

test('disabling source before first open leaves no inline tokens', async ({ page }) => {
  await page.getByLabel('Apply source completion tokens', { exact: true }).uncheck();
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.click();
  const popup = page.getByRole('listbox', { name: 'Themed completion popup', exact: true });

  await expect(popup).toBeVisible();
  await expect(popup).not.toHaveAttribute('style', /--ant-select-option-height/);
  await expect(input).toHaveCSS('font-size', '14px');
});

test('RTL keeps group indentation and popup inside a narrow viewport', async ({ page }) => {
  await page.getByLabel('Completion token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.setViewportSize({ width: 375, height: 1200 });
  const input = page.getByRole('combobox', { name: 'Themed completion popup', exact: true });
  await input.click();
  const popup = page.getByRole('listbox', { name: 'Themed completion popup', exact: true });

  await expect(page.locator('.completion-token-popup')).toHaveClass(/ant-select-rtl/);
  await expect(popup).toHaveClass(/ant-select-dropdown-rtl/);
  await expect(popup.getByRole('option', { name: 'Alpha', exact: true }))
    .toHaveCSS('padding-inline-start', '24px');
  const box = (await popup.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  await input.press('Escape');

  await expect(input).toBeFocused();
  await expect(popup).toHaveCount(0);
});
