import { test, expect } from './test';
import reference from './fixtures/ant-design-cascader-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/?fixture=cascader-theme');
});

for (const sample of reference.cases) {
  test(`Cascader matches Ant Design source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Cascader token preset', { exact: true }).selectOption(sample.name);
    const popup = '.popup:not([hidden])';
    const selectors: Record<string, string> = {};
    for (const mode of ['single', 'multiple']) {
      for (const size of ['middle', 'small', 'large']) {
        const name = `${mode}-${size}`;
        selectors[name] = `.cascader-token-${name}`;
        selectors[name + '-input'] = `${selectors[name]} .ant-select-input`;
        selectors[name + '-suffix'] = `${selectors[name]} .suffix`;
        if (mode === 'multiple') {
          selectors[name + '-tag'] = `${selectors[name]} .ant-select-selection-item`;
        }
      }
    }
    selectors.disabled = '.cascader-token-disabled';
    selectors.disabledTag = '.cascader-token-disabled .ant-select-selection-item';
    selectors.clear = '.cascader-token-popup .clear';
    for (const context of ['popup', 'panel']) {
      const root = context === 'popup' ? popup : '.cascader-token-panel';
      selectors[context] = root;
      selectors[context + 'Column'] = root + ' .ant-cascader-menu:first-child';
      selectors[context + 'Expand'] = root + ' .ant-cascader-menu-item-expand-icon';
      for (const name of ['Parent', 'Alpha', 'Beta', 'Disabled']) {
        selectors[context + name] = `${root} .ant-cascader-menu-item:has(.ant-cascader-menu-item-content:text-is("${name}"))`;
      }
      for (const name of ['Parent', 'Checked', 'Disabled', 'Gamma']) {
        const checks = context === 'popup' ? popup : '.cascader-token-panel-checks';
        selectors[context + name + 'Checkbox'] = `${checks} .ant-cascader-menu-item:has(.ant-cascader-menu-item-content:text-is("${name}")) .ant-cascader-checkbox`;
      }
    }
    selectors.searchColumn = popup + ' .ant-cascader-menu';
    selectors.searchItem = popup + ' .ant-cascader-menu-item';
    selectors.keyword = popup + ' .ant-cascader-menu-item-keyword';
    selectors.empty = popup + ' .ant-cascader-menu-item';
    selectors.panelEmpty = '.cascader-token-panel-empty';
    await page.getByRole('combobox', { name: 'Themed path popup', exact: true }).click();

    for (const [name, expected] of Object.entries(sample.metrics)) {
      if (name === 'popupParentCheckbox') {
        await page.getByRole('combobox', { name: 'Themed path checks', exact: true }).click();
      }
      if (name === 'searchColumn') {
        await page.getByRole('combobox', { name: 'Themed path search', exact: true }).click();
      }
      if (name === 'empty') {
        await page.getByRole('combobox', { name: 'Themed path empty', exact: true }).click();
      }
      await expect.poll(() => page.locator(selectors[name]).evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: `${sample.name}/${name}` }).toEqual(expected);
    }
  });

  test(`Cascader responsive tags match source for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Cascader token preset', { exact: true }).selectOption(sample.name);
    const tags = page.locator('.cascader-token-responsive [data-cascader-tag]:not([inert])');
    await expect(tags).toHaveCount(sample.overflow['200']);

    await page.getByLabel('Cascader responsive width', { exact: true }).fill('400');

    await expect(tags).toHaveCount(sample.overflow['400']);
  });
}

test('color updates retain popup position, input selection and active search rows', async ({ page }) => {
  await page.getByLabel('Cascader token preset', { exact: true }).selectOption('cascader-tokens');
  const input = page.getByRole('combobox', { name: 'Themed path popup', exact: true });
  await input.fill('remote draft');
  await input.press('ArrowDown');
  await input.evaluate(element => {
    (element as HTMLInputElement).setSelectionRange(2, 8, 'backward');
  });
  const popup = page.locator('.popup:not([hidden])');
  const row = popup.getByRole('menuitemcheckbox', { name: 'Parent / Alpha', exact: true });
  const original = await input.elementHandle();
  const originalRow = await row.elementHandle();
  const position = await popup.evaluate(element => [element.style.left, element.style.top]);
  expect(position.every(Boolean)).toBe(true);

  await page.getByLabel('Cascader color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(row.locator('..')).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  expect(await popup.evaluate(element => [element.style.left, element.style.top]))
    .toEqual(position);
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await row.evaluate((element, previous) => element === previous, originalRow)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('remote draft');
  expect(await input.evaluate(element => {
    const input = element as HTMLInputElement;
    return [input.selectionStart, input.selectionEnd, input.selectionDirection];
  })).toEqual([2, 8, 'backward']);
  await expect(page.getByLabel('Cascader theme value', { exact: true })).toHaveText('["p","a"]');
  await expect(page.getByLabel('Cascader theme changes', { exact: true })).toHaveText('0');
  await expect(page.getByLabel('Cascader theme searches', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Cascader theme focus events', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Cascader theme openings', { exact: true })).toHaveText('[true]');
});

test('search layout updates retain the current component variables', async ({ page }) => {
  await page.getByLabel('Cascader token preset', { exact: true }).selectOption('cascader-tokens');
  const input = page.getByRole('combobox', { name: 'Themed path popup', exact: true });
  await input.click();
  const popup = page.locator('.popup:not([hidden])');
  const original = await popup.elementHandle();
  await expect(popup.locator('.ant-cascader-menu')).toHaveCount(2);

  await input.fill('Alp');

  await expect(popup.locator('.ant-cascader-menu')).toHaveCount(1);
  await expect(popup).toHaveCSS('--ant-cascader-control-item-width', '140px');
  await expect(popup.locator('.ant-cascader-menu-item').first()).toHaveCSS('padding-top', '7px');
  expect(await popup.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await input.fill('');

  await expect(popup.locator('.ant-cascader-menu')).toHaveCount(2);
  await expect(popup).toHaveCSS('--ant-cascader-control-item-width', '140px');
  expect(await popup.evaluate(element => Boolean(element.style.left && element.style.top)))
    .toBe(true);
});

test('popup variable overrides keep priority through theme and search changes', async ({ page }) => {
  await page.getByLabel('Cascader token preset', { exact: true }).selectOption('cascader-tokens');
  await page.getByLabel('Cascader popup variable override', { exact: true }).fill('1px 3px');
  const input = page.getByRole('combobox', { name: 'Themed path popup', exact: true });
  await input.click();
  const popup = page.locator('.popup:not([hidden])');
  await expect(popup).toHaveCSS('--ant-cascader-option-padding', '1px 3px');

  await page.getByLabel('Cascader color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await input.fill('Alp');

  await expect(popup.locator('.ant-cascader-menu-item').first()).toHaveCSS('padding-top', '1px');
  await expect(popup).toHaveCSS('--ant-cascader-option-padding', '1px 3px');
  await expect(input).toBeFocused();
  await page.getByLabel('Cascader popup variable override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(popup).toHaveCSS('--ant-cascader-option-padding', '7px 15px');
  await expect(input).toBeFocused();
});

test('algorithm updates retain field nodes and keyboard path selection', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed path popup', exact: true });
  await input.click();
  const alpha = page.locator('.popup:not([hidden])')
    .getByRole('menuitemcheckbox', { name: 'Alpha', exact: true });
  const original = await alpha.elementHandle();

  await page.getByLabel('Cascader token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'compact';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(input).toHaveCSS('font-size', '12px');
  await expect(alpha.locator('..')).toHaveCSS('padding-block-start', '4px');
  expect(await alpha.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await input.press('ArrowDown');
  await input.press('Enter');

  await expect(page.getByLabel('Cascader theme value', { exact: true })).toHaveText('["p","b"]');
  await expect(page.getByLabel('Cascader theme changes', { exact: true })).toHaveText('1');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('removing source settings restores native styles without replacing the editor', async ({ page }) => {
  await page.getByLabel('Cascader token preset', { exact: true }).selectOption('cascader-aliases');
  const input = page.getByRole('combobox', { name: 'Themed path popup', exact: true });
  await input.fill('draft');
  const original = await input.elementHandle();

  await page.getByLabel('Apply source Cascader tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(input).toHaveCSS('font-size', '14px');
  await expect(page.locator('.popup:not([hidden])'))
    .not.toHaveAttribute('style', /--ant-cascader-option-padding/);
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toHaveValue('draft');
  await expect(input).toBeFocused();
  await expect(page.locator('head style[data-ant-svelte-theme="cascader-source-scope"]'))
    .toHaveCount(0);
});

test('source settings chosen before first open do not leave old popup variables', async ({ page }) => {
  await page.getByLabel('Apply source Cascader tokens', { exact: true }).uncheck();
  const input = page.getByRole('combobox', { name: 'Themed path popup', exact: true });
  await input.click();
  const popup = page.locator('.popup:not([hidden])');
  await expect(popup).not.toHaveAttribute('style', /--ant-cascader-option-padding/);

  await page.getByLabel('Apply source Cascader tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(popup).toHaveCSS('--ant-cascader-option-padding', '5px 12px');
  await expect(input).toBeFocused();
});

test('custom prefixes and RTL scopes retain paths and clean up on unmount', async ({ page }) => {
  await page.getByLabel('Cascader token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Hash themed Cascader', { exact: true }).uncheck();
  await page.setViewportSize({ width: 375, height: 1400 });
  const input = page.getByRole('combobox', { name: 'Themed single path middle', exact: true });
  await input.click();
  const popup = page.locator('.popup:not([hidden])');

  await expect(popup).toHaveCSS('--cas-2-cascader-control-item-width', '125px');
  expect(await page.locator('.cascader-token-single-middle').evaluate(element =>
    [...element.classList].some(name => name.startsWith('css-')))).toBe(false);
  await expect.poll(async () => {
    const box = (await popup.boundingBox())!;
    return Math.max(-box.x, box.x + box.width - 375);
  }).toBeLessThanOrEqual(0);
  await input.press('ArrowDown');
  await input.press('Enter');

  await expect(page.locator('.cascader-token-single-middle')).toContainText('Parent / Beta');
  await expect(input).toBeFocused();
  await page.getByLabel('Mount themed Cascader', { exact: true }).uncheck();

  await expect(input).toHaveCount(0);
  await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="cascader-source-scope"]'))
    .toHaveCount(0);
});

test('source clear retains its native keyboard target and controlled path callbacks', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed path popup', exact: true });
  await input.click();
  await input.press('Escape');
  const clear = page.locator('.cascader-token-popup').getByRole('button', {
    name: 'Очистить', exact: true
  });
  await clear.focus();

  await expect(clear).toHaveCSS('opacity', '1');
  await clear.press('Enter');

  await expect(input).toBeFocused();
  await expect(page.getByLabel('Cascader theme value', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Cascader theme changes', { exact: true })).toHaveText('1');
});
