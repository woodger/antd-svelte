import { test, expect } from './test';
import reference from './fixtures/ant-design-menu-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/?fixture=menu-theme');
});

for (const sample of reference.cases) {
  test(`Menu matches Ant Design source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Menu token preset', { exact: true }).selectOption(sample.name);
    const selectors: Record<string, string> = {};
    for (const mode of ['inline', 'vertical', 'horizontal', 'collapsed']) {
      for (const appearance of ['light', 'dark']) {
        const name = `${mode}-${appearance}`;
        const root = `.menu-token-${name}`;
        selectors[name] = root;
        for (const item of ['selected', 'normal', 'disabled', 'danger']) {
          selectors[name + '-' + item] = `${root} > .sample-${item}`;
        }
        selectors[name + '-icon'] = root + ' > .sample-normal .ant-menu-item-icon';
        selectors[name + '-title'] = root + ' > .sample-parent > .ant-menu-submenu-title';
        selectors[name + '-arrow'] = selectors[name + '-title'] + ' > .ant-menu-submenu-arrow';
        const nested = root + ' > .sample-parent > .ant-menu-sub';
        selectors[name + '-nested'] = nested;
        selectors[name + '-leaf'] = nested + ' > .sample-leaf';
        selectors[name + '-group'] = nested + ' .ant-menu-item-group-title';
        selectors[name + '-divider'] = nested + ' > .ant-menu-item-divider';
      }
    }
    for (const appearance of ['light', 'dark']) {
      const name = `popup-${appearance}`;
      const popup = '.menu-token-main .menu-popup:not([hidden])';
      const list = popup + ' > .ant-menu';
      selectors[name] = popup;
      selectors[name + '-list'] = list;
      selectors[name + '-leaf'] = list + ' > .sample-leaf';
      selectors[name + '-group'] = list + ' .ant-menu-item-group-title';
      selectors[name + '-child'] = list + ' > .sample-child';
      selectors[name + '-divider'] = list + ' > .ant-menu-item-divider';
    }

    for (const [name, expected] of Object.entries(sample.metrics)) {
      if (name === 'popup-light') {
        await page.locator('.menu-token-main').evaluate(element => {
          element.scrollIntoView({ block: 'center' });
        });
        await page.getByRole('button', { name: 'Open themed Menu popup', exact: true })
          .evaluate(element => (element as HTMLButtonElement).click());
      }
      if (name === 'popup-dark') {
        await page.getByLabel('Themed Menu appearance', { exact: true }).evaluate(element => {
          const select = element as HTMLSelectElement;
          select.value = 'dark';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      await expect.poll(() => page.locator(selectors[name]).evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: `${sample.name}/${name}` }).toEqual(expected);
    }
  });
}

test('theme colors retain popup position, focused nodes and selection callbacks', async ({ page }) => {
  const root = page.locator('.menu-token-main');
  await root.getByRole('menuitem', { name: 'Parent', exact: true }).click();
  const popup = root.locator('.menu-popup');
  const leaf = popup.getByRole('menuitem', { name: 'Leaf', exact: true });
  await leaf.focus();
  const original = await leaf.elementHandle();
  const position = await popup.evaluate(element => [element.style.left, element.style.top]);

  await page.getByLabel('Menu selected background', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(leaf).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  expect(await popup.evaluate(element => [element.style.left, element.style.top])).toEqual(position);
  expect(await leaf.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(leaf).toBeFocused();
  await expect(page.getByLabel('Menu theme selected', { exact: true }))
    .toHaveText('["selected","leaf"]');
  await expect(page.getByLabel('Menu theme opened', { exact: true })).toHaveText('["parent"]');
  await expect(page.getByLabel('Menu theme events', { exact: true })).toHaveText('[]');

  await leaf.press('Enter');

  await expect(page.getByLabel('Menu theme selected', { exact: true })).toHaveText('["selected"]');
  await expect(page.getByLabel('Menu theme events', { exact: true })).toHaveText('["deselect:leaf"]');
  await expect(popup).toBeVisible();
});

test('component algorithms retain focused items and keyboard selection', async ({ page }) => {
  const item = page.locator('.menu-token-main').getByRole('menuitem', {
    name: /Normal$/
  });
  await item.focus();
  const original = await item.elementHandle();

  await page.getByLabel('Menu token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'own-algorithm';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(item).toHaveCSS('font-size', '18px');
  expect(await item.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(item).toBeFocused();
  await expect(page.getByLabel('Menu theme events', { exact: true })).toHaveText('[]');
  await item.press('Enter');

  await expect(page.getByLabel('Menu theme selected', { exact: true }))
    .toHaveText('["selected","leaf","normal"]');
  await expect(page.getByLabel('Menu theme events', { exact: true })).toHaveText('["select:normal"]');
});

test('plain overrides reach inline children while popup variables keep their own scope', async ({ page }) => {
  await page.getByLabel('Themed Menu mode', { exact: true }).selectOption('inline');
  await page.getByLabel('Override Menu root variables', { exact: true }).check();
  const root = page.locator('.menu-token-main');
  await root.getByRole('menuitem', { name: 'Parent', exact: true }).click();

  await expect(root.getByRole('menuitem', { name: 'Leaf', exact: true }))
    .toHaveCSS('background-color', 'rgb(255, 221, 238)');

  await page.getByLabel('Themed Menu mode', { exact: true }).selectOption('vertical');
  await root.getByRole('menuitem', { name: 'Parent', exact: true }).click();
  const leaf = root.locator('.menu-popup').getByRole('menuitem', { name: 'Leaf', exact: true });
  await expect(leaf).toHaveCSS('background-color', 'rgb(230, 244, 255)');
  await page.getByLabel('Menu selected background', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(leaf).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  await expect(root.locator('> .sample-selected'))
    .toHaveCSS('background-color', 'rgb(255, 221, 238)');
});

test('native compact returns without replacing focused popup items', async ({ page }) => {
  await page.getByLabel('Menu token preset', { exact: true }).selectOption('own-tokens');
  await page.getByLabel('Native compact Menu', { exact: true }).check();
  const root = page.locator('.menu-token-main');
  await root.getByRole('menuitem', { name: 'Parent', exact: true }).click();
  const popup = root.locator('.menu-popup');
  const leaf = popup.getByRole('menuitem', { name: 'Leaf', exact: true });
  await leaf.focus();
  const original = await leaf.elementHandle();

  await page.getByLabel('Apply source Menu tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(leaf).toHaveCSS('font-size', '12px');
  await expect(leaf).toHaveCSS('height', '35px');
  await expect(leaf).toBeFocused();
  await expect(popup).toBeVisible();
  expect(await leaf.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await popup.evaluate(element => element.style.left)).not.toBe('');
  expect(await popup.evaluate(element => element.style.getPropertyValue('--ant-menu-item-height')))
    .toBe('');
  await expect(root).not.toHaveClass(/ant-menu-source-theme/);
  await expect(page.locator('head style[data-ant-svelte-theme="menu-source-scope"]'))
    .toHaveCount(0);
  await expect(page.getByLabel('Menu theme events', { exact: true })).toHaveText('[]');
});

test('a zero-height source title at the viewport edge keeps its controlled popup visible', async ({ page }) => {
  await page.getByLabel('Menu token preset', { exact: true }).selectOption('zero');
  const root = page.locator('.menu-token-main');
  await root.evaluate(element => {
    element.style.position = 'fixed';
    element.style.top = '0px';
    element.style.left = '20px';
  });
  await page.getByRole('button', { name: 'Open themed Menu popup', exact: true })
    .evaluate(element => (element as HTMLButtonElement).click());

  await expect(root.locator('.menu-popup')).toBeVisible();
  await expect(page.getByLabel('Menu theme opened', { exact: true })).toHaveText('["parent"]');
});

test('provider scope resets aliases inherited from surrounding content', async ({ page }) => {
  await page.getByLabel('Parent Menu aliases', { exact: true }).check();
  const root = page.locator('.menu-token-main');
  const item = root.getByRole('menuitem', { name: /Normal$/ });

  await expect(item).toHaveCSS('font-size', '14px');
  await expect(item).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  await root.getByRole('menuitem', { name: 'Parent', exact: true }).click();
  await expect(root.locator('.menu-popup').getByRole('menuitem', { name: 'Child', exact: true }))
    .toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
});

test('light and dark hover tokens apply without selecting disabled items', async ({ page }) => {
  await page.getByLabel('Menu token preset', { exact: true }).selectOption('own-tokens');
  const root = page.locator('.menu-token-main');
  const normal = root.getByRole('menuitem', { name: /Normal$/ });
  await normal.hover();

  await expect(normal).toHaveCSS('background-color', 'rgb(255, 238, 204)');
  await expect(normal).toHaveCSS('color', 'rgb(136, 68, 17)');
  await page.getByLabel('Menu token preset', { exact: true }).selectOption('dark-tokens');
  await page.getByLabel('Themed Menu appearance', { exact: true }).selectOption('dark');
  await normal.hover();

  await expect(normal).toHaveCSS('background-color', 'rgb(51, 68, 17)');
  await expect(normal).toHaveCSS('color', 'rgb(136, 255, 238)');
  const disabled = root.getByRole('menuitem', { name: 'Disabled', exact: true });
  await disabled.click({ force: true });

  await expect(disabled).toHaveCSS('color', 'rgb(119, 136, 153)');
  await expect(page.getByLabel('Menu theme events', { exact: true })).toHaveText('[]');
});

test('prerendered horizontal popups stay hidden and leave provider controls accessible', async ({ page }) => {
  const popups = page.locator('.menu-token-horizontal-light .menu-popup, .menu-token-horizontal-dark .menu-popup');
  await expect(popups).toHaveCount(2);
  await expect(popups.nth(0)).toBeHidden();
  await expect(popups.nth(1)).toBeHidden();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByLabel('Apply source Menu tokens', { exact: true }).uncheck();

  await expect(popups.nth(0)).toBeHidden();
  await expect(popups.nth(1)).toBeHidden();
  await page.getByLabel('Right to left', { exact: true }).uncheck();
});

test('custom prefix and narrow RTL keep popup bounds, keyboard return and scope cleanup', async ({ page }) => {
  await page.getByLabel('Menu token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Hash themed Menu', { exact: true }).uncheck();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.setViewportSize({ width: 320, height: 900 });
  const root = page.locator('.menu-token-main');
  const title = root.getByRole('menuitem', { name: 'Parent', exact: true });
  await title.click();
  const popup = root.locator('.menu-popup');
  const leaf = popup.getByRole('menuitem', { name: 'Leaf', exact: true });
  await leaf.focus();

  await expect(popup).toHaveCSS('--mnu-2-menu-dropdown-width', '195px');
  await expect(leaf).toHaveCSS('height', '42px');
  expect(await root.evaluate(element =>
    [...element.classList].some(name => name.startsWith('css-')))).toBe(false);
  const bounds = (await popup.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  await leaf.press('Escape');

  await expect(popup).toBeHidden();
  await expect(title).toBeFocused();
  await page.getByLabel('Mount themed Menu', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="menu-source-scope"]'))
    .toHaveCount(0);
});
