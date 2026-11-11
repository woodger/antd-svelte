import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-metrics.json' with { type: 'json' };

test('bound root and input refs survive theme updates and clear on unmount', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.fill('draft');
  await expect(page.getByLabel('TreeSelect native refs', { exact: true }))
    .toHaveText('{"root":true,"input":true,"contains":true}');

  await page.getByLabel('TreeSelect token preset', { exact: true }).evaluate(node => {
    const select = node as HTMLSelectElement;
    select.value = 'compact';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await input.press('Escape');
  await page.getByRole('button', { name: 'Focus bound TreeSelect', exact: true }).click();

  await expect(input).toBeFocused();
  await expect(page.getByLabel('TreeSelect native refs', { exact: true }))
    .toHaveText('{"root":true,"input":true,"contains":true}');
  await page.getByLabel('Mount themed TreeSelect', { exact: true }).uncheck();
  await expect(page.getByLabel('TreeSelect native refs', { exact: true }))
    .toHaveText('{"root":false,"input":false,"contains":false}');
});

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto('/?fixture=tree-select-theme');
});

for (const sample of reference.cases) {
  test(`TreeSelect matches Ant Design source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('TreeSelect token preset', { exact: true }).selectOption(sample.name);
    expect(await page.locator('.tree-token-single-middle').evaluate(element =>
      element.classList.contains('ant-tree-select-css-var'))).toBe(sample.rootHasTreeScope);
    const selectors: Record<string, string> = {};
    for (const mode of ['single', 'multiple']) {
      for (const size of ['middle', 'small', 'large']) {
        const name = `${mode}-${size}`;
        selectors[name] = `.tree-token-${name}`;
        selectors[name + '-input'] = `${selectors[name]} .ant-select-input`;
        selectors[name + '-suffix'] = `${selectors[name]} .suffix`;
        if (mode === 'multiple') {
          selectors[name + '-tag'] = `${selectors[name]} .ant-select-selection-item`;
        }
      }
    }
    selectors.disabled = '.tree-token-disabled';
    selectors.disabledTag = '.tree-token-disabled .ant-select-selection-item';
    selectors.clear = '.tree-token-popup .clear';
    selectors.popup = '.popup.ant-tree-select-dropdown:not([hidden])';
    selectors.tree = selectors.popup + ' .ant-tree';
    selectors.indent = selectors.popup + ' .ant-tree-treenode:has(.ant-tree-title:text-is("Alpha")) .ant-tree-indent-unit';
    selectors.empty = '.ant-select-empty';
    for (const name of ['Parent', 'Alpha', 'Disabled', 'Gamma']) {
      const row = `${selectors.popup} .ant-tree-treenode:has(.ant-tree-title:text-is("${name}"))`;
      selectors[name + 'Row'] = row;
      selectors[name + 'Title'] = row + ' .ant-tree-node-content-wrapper';
      selectors[name + 'Switcher'] = row + ' .ant-tree-switcher';
      selectors[name + 'Checkbox'] = row + ' .ant-tree-checkbox';
    }
    await page.getByRole('combobox', { name: 'Themed tree popup', exact: true }).click();

    for (const [name, expected] of Object.entries(sample.metrics)) {
      if (name === 'ParentCheckbox') {
        await page.getByRole('combobox', { name: 'Themed tree checks', exact: true }).click();
      }
      if (name === 'empty') {
        await page.getByRole('combobox', { name: 'Themed tree empty', exact: true }).click();
      }
      await expect.poll(() => page.locator(selectors[name]).evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: `${sample.name}/${name}` }).toEqual(expected);
    }
  });
}

test('color updates preserve popup position and editor state', async ({ page }) => {
  await page.getByLabel('TreeSelect token preset', { exact: true }).selectOption('tree-tokens');
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.fill('remote draft');
  await input.evaluate(element => {
    (element as HTMLInputElement).setSelectionRange(2, 8, 'backward');
  });
  const popup = page.locator('.popup:not([hidden])');
  const alpha = popup.getByRole('treeitem', { name: 'Alpha', exact: true });
  const original = await input.elementHandle();
  const originalTitle = await alpha.elementHandle();
  const position = await popup.evaluate(element => [element.style.left, element.style.top]);
  expect(position.every(Boolean)).toBe(true);

  await page.getByLabel('TreeSelect color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(alpha.locator('.ant-tree-node-content-wrapper'))
    .toHaveCSS('background-color', 'rgb(18, 52, 86)');
  expect(await popup.evaluate(element => [element.style.left, element.style.top]))
    .toEqual(position);
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await alpha.evaluate((element, previous) => element === previous, originalTitle))
    .toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('remote draft');
  expect(await input.evaluate(element => {
    const input = element as HTMLInputElement;
    return [input.selectionStart, input.selectionEnd, input.selectionDirection];
  })).toEqual([2, 8, 'backward']);
  const values = await page.locator('#themed-tree-select-form').evaluate(element =>
    Object.fromEntries(new FormData(element as HTMLFormElement)));
  expect(values).toEqual({ project: 'a', teams: 'a' });
  await expect(page.getByLabel('TreeSelect theme changes', { exact: true })).toHaveText('0');
  await expect(page.getByLabel('TreeSelect theme searches', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('TreeSelect theme focus events', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('TreeSelect theme openings', { exact: true })).toHaveText('[true]');
});

test('algorithm changes retain tree nodes and keyboard selection', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.click();
  const alpha = page.getByRole('treeitem', { name: 'Alpha', exact: true });
  const original = await alpha.elementHandle();

  await page.getByLabel('TreeSelect token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'compact';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(input).toHaveCSS('font-size', '12px');
  await expect(alpha).toHaveCSS('line-height', '21px');
  expect(await alpha.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await input.press('ArrowDown');
  await input.press('Enter');

  await expect(input).toHaveValue('Beta');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByLabel('TreeSelect theme changes', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('TreeSelect theme selections', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('TreeSelect theme searches', { exact: true })).toHaveText('0');
});

test('source changes before first open preserve checkbox state', async ({ page }) => {
  await page.getByLabel('Apply source TreeSelect tokens', { exact: true }).uncheck();
  const input = page.getByRole('combobox', { name: 'Themed tree checks', exact: true });
  await input.click();
  const popup = page.locator('.popup:not([hidden])');
  const checkbox = popup.getByRole('checkbox', { name: 'Alpha', exact: true });
  const original = await checkbox.elementHandle();
  await expect(popup).not.toHaveAttribute('style', /--ant-tree-select-title-height/);
  await expect(checkbox).toHaveCSS('border-top-width', '0px');

  await page.getByLabel('Apply source TreeSelect tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(checkbox).toHaveCSS('border-top-width', '1px');
  await expect(checkbox).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  expect(await checkbox.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  await expect(input).toBeFocused();
});

test('native styles return on the existing open tree', async ({ page }) => {
  await page.getByLabel('TreeSelect token preset', { exact: true }).selectOption('tree-aliases');
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.fill('draft');
  const original = await input.elementHandle();
  const alpha = page.getByRole('treeitem', { name: 'Alpha', exact: true });
  const originalAlpha = await alpha.elementHandle();

  await page.getByLabel('Apply source TreeSelect tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(input).toHaveCSS('font-size', '14px');
  await expect(alpha).toHaveCSS('line-height', '24px');
  await expect(page.locator('.popup:not([hidden])'))
    .not.toHaveAttribute('style', /--ant-tree-select-title-height/);
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await alpha.evaluate((element, previous) => element === previous, originalAlpha))
    .toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('draft');
  await expect(page.locator('head style[data-ant-svelte-theme="tree-select-source-scope"]'))
    .toHaveCount(0);
});

test('provider scope resets aliases inherited from surrounding content', async ({ page }) => {
  await page.getByLabel('Parent TreeSelect aliases', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.click();

  await expect(input).toHaveCSS('font-size', '14px');
  await expect(input).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  await expect(page.getByRole('treeitem', { name: 'Alpha', exact: true }))
    .toHaveCSS('font-size', '14px');
});

test('custom prefixes and RTL scopes clean up on unmount', async ({ page }) => {
  await page.getByLabel('TreeSelect token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Right to left', { exact: true }).check();
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.click();
  const popup = page.locator('.popup:not([hidden])');
  await expect(popup).toHaveCSS('--tree-2-tree-select-title-height', '30px');
  await expect(page.getByRole('treeitem', { name: 'Alpha', exact: true })
    .locator('.ant-tree-indent-unit')).toHaveCSS('width', '32px');
  await page.getByLabel('Hash themed TreeSelect', { exact: true }).uncheck();
  await expect(page.locator('.tree-token-popup')).not.toHaveClass(/(^|\s)css-[a-z0-9]+(\s|$)/);
  await input.click();
  await page.setViewportSize({ width: 375, height: 1200 });

  await expect(popup).toBeVisible();
  await expect.poll(async () => {
    const box = (await popup.boundingBox())!;
    return Math.max(-box.x, box.x + box.width - 375);
  }).toBeLessThanOrEqual(0);
  await page.getByLabel('Mount themed TreeSelect', { exact: true }).uncheck();

  await expect(input).toHaveCount(0);
  await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="tree-select-source-scope"]'))
    .toHaveCount(0);
});

test('clear keeps its keyboard target and restores editor focus', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.click();
  await input.press('Escape');
  const clear = page.locator('.tree-token-popup').getByRole('button', {
    name: 'Очистить', exact: true
  });
  await clear.focus();

  await expect(clear).toHaveCSS('opacity', '1');
  await clear.press('Enter');

  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
  expect(await page.locator('#themed-tree-select-form').evaluate(element =>
    new FormData(element as HTMLFormElement).get('project'))).toBeNull();
  await expect(page.getByLabel('TreeSelect theme changes', { exact: true })).toHaveText('1');
});

test('popup dimensions preserve inline position and input focus', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Themed tree popup', exact: true });
  await input.click();
  const popup = page.locator('.popup:not([hidden])');
  const original = await popup.elementHandle();
  const dimensions = [['TreeSelect popup width', '300'], ['TreeSelect list height', '100']];

  for (const [label, value] of dimensions) {
    await page.getByLabel(label, { exact: true }).evaluate((element, value) => {
      const input = element as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
  }

  await expect(popup).toHaveCSS('width', '300px');
  await expect(popup.locator('.ant-tree-list-holder')).toHaveCSS('max-height', '100px');
  expect(await popup.evaluate(element => Boolean(element.style.left && element.style.top)))
    .toBe(true);
  expect(await popup.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(page.getByLabel('TreeSelect theme openings', { exact: true })).toHaveText('[true]');
});
