import { test, expect } from './test';
import reference from './fixtures/ant-design-dropdown-metrics.json' with { type: 'json' };
import type { DropdownPlacement } from 'antd-svelte';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/?fixture=dropdown-theme');
});

for (const sample of reference.cases) {
  test(`Dropdown matches Ant Design source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Dropdown token preset', { exact: true }).selectOption(sample.name);
    const popup = page.locator('#dropdown-theme-fixture .ant-dropdown');
    const selectors: Record<string, string> = {
      popup: '#dropdown-theme-fixture .ant-dropdown',
      menu: '#dropdown-theme-fixture .ant-dropdown-menu',
      icon: '#dropdown-theme-fixture .ant-dropdown-menu-item-icon',
      divider: '#dropdown-theme-fixture .ant-dropdown-menu-item-divider'
    };
    for (const name of ['normal', 'disabled', 'danger', 'link']) {
      selectors[name] = `#dropdown-theme-fixture [data-dropdown-key="${name}"]`;
      selectors[name + '-hover'] = selectors[name];
    }

    for (const [name, expected] of Object.entries(sample.metrics)) {
      const node = page.locator(selectors[name]);
      if (name.endsWith('-hover')) await node.hover();

      await expect.poll(() => node.evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: `${sample.name}/${name}` }).toEqual(expected);

      if (name.endsWith('-hover')) await page.mouse.move(1270, 1390);
    }
    for (const [placement, expected] of Object.entries(sample.arrows)) {
      await page.getByLabel('Themed Dropdown placement', { exact: true }).selectOption(placement);
      const arrow = popup.locator('.ant-dropdown-arrow');
      for (const [part, metrics] of Object.entries(expected)) {
        await expect.poll(() => arrow.evaluate((element, input) => {
          const css = getComputedStyle(element, input.pseudo);
          return Object.fromEntries(input.keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
        }, { keys: Object.keys(metrics), pseudo: part === 'root' ? null : '::' + part }), {
          message: `${sample.name}/${placement}/${part}`
        }).toEqual(metrics);
      }
      await expect.poll(async () => {
        const surface = (await popup.boundingBox())!;
        const trigger = (await page.getByRole('button', {
          name: 'Open themed Dropdown', exact: true
        }).boundingBox())!;
        return placement.startsWith('top')
          ? trigger.y - surface.y - surface.height : surface.y - trigger.y - trigger.height;
      }).toBeCloseTo(sample.gaps[placement as DropdownPlacement], 5);
    }
    await page.getByLabel('Themed Dropdown arrow', { exact: true }).evaluate(element => {
      const input = element as HTMLInputElement;
      input.checked = false;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.getByLabel('Themed Dropdown placement', { exact: true }).selectOption('bottomLeft');

    await expect.poll(async () => {
      const surface = (await popup.boundingBox())!;
      const trigger = (await page.getByRole('button', {
        name: 'Open themed Dropdown', exact: true
      }).boundingBox())!;
      return surface.y - trigger.y - trigger.height;
    }).toBeCloseTo(sample.gaps.withoutArrow, 5);
  });
}

test('theme colors retain popup position, focused links and native navigation callbacks', async ({ page }) => {
  const popup = page.locator('#dropdown-theme-fixture .ant-dropdown');
  const menu = page.getByRole('menu', { name: 'Themed Dropdown commands', exact: true });
  const link = menu.getByRole('menuitem', { name: 'Native link', exact: true });
  await link.focus();
  const original = await link.elementHandle();
  const position = await popup.evaluate(element => [element.style.left, element.style.top]);

  await page.getByLabel('Dropdown background', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(menu).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  expect(await popup.evaluate(element => [element.style.left, element.style.top])).toEqual(position);
  expect(await link.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(link).toBeFocused();
  await expect(page.getByLabel('Dropdown theme changes', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Dropdown theme events', { exact: true })).toHaveText('[]');
  await link.press('Enter');

  await expect(page).toHaveURL(/#dropdown-theme-destination$/);
  await expect(popup).toBeHidden();
  await expect(page.getByLabel('Dropdown theme events', { exact: true })).toHaveText('["link"]');
  await expect(page.getByLabel('Dropdown theme changes', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Dropdown theme clicks', { exact: true })).toHaveText('0');
});

test('component algorithms retain focused commands and keyboard navigation', async ({ page }) => {
  const menu = page.getByRole('menu', { name: 'Themed Dropdown commands', exact: true });
  const normal = menu.getByRole('menuitem', { name: 'Normal', exact: true });
  await normal.focus();
  const original = await normal.elementHandle();

  await page.getByLabel('Dropdown token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'own-algorithm';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(normal).toHaveCSS('font-size', '18px');
  expect(await normal.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(normal).toBeFocused();
  await expect(page.getByLabel('Dropdown theme changes', { exact: true })).toHaveText('[]');
  await normal.press('ArrowDown');
  const danger = menu.getByRole('menuitem', { name: 'Danger', exact: true });
  await expect(danger).toBeFocused();
  await danger.press('Enter');

  await expect(page.getByLabel('Dropdown theme events', { exact: true })).toHaveText('["danger"]');
  await expect(page.getByLabel('Dropdown theme changes', { exact: true })).toHaveText('[]');
});

test('native compact returns on the same focused command after source removal', async ({ page }) => {
  await page.getByLabel('Dropdown token preset', { exact: true }).selectOption('own-aliases');
  await page.getByLabel('Native compact Dropdown', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const popup = page.locator('#dropdown-theme-fixture .ant-dropdown');
  const normal = popup.getByRole('menuitem', { name: 'Normal', exact: true });
  await normal.focus();
  const original = await normal.elementHandle();

  await page.getByLabel('Apply source Dropdown tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(normal).toHaveCSS('font-size', '12px');
  await expect(normal).toHaveCSS('padding-top', '4px');
  await expect(normal).toBeFocused();
  await expect(popup).toBeVisible();
  expect(await normal.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await popup.evaluate(element => element.style.getPropertyValue('--ant-dropdown-padding-block')))
    .toBe('');
  expect(await popup.evaluate(element => element.style.left)).not.toBe('');
  await expect(page.locator('head style[data-ant-svelte-theme="dropdown-source-scope"]'))
    .toHaveCount(0);
  await expect(page.getByLabel('Dropdown theme changes', { exact: true })).toHaveText('[]');
});

test('popup scope resets surrounding aliases and retains component aliases', async ({ page }) => {
  await page.getByLabel('Parent Dropdown aliases', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const normal = page.getByRole('menu', { name: 'Themed Dropdown commands', exact: true })
    .getByRole('menuitem', { name: 'Normal', exact: true });
  await expect(normal).toHaveCSS('font-size', '14px');
  await expect(normal).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');

  await page.getByLabel('Dropdown token preset', { exact: true }).selectOption('own-aliases');

  await expect(normal).toHaveCSS('font-size', '20px');
  await expect(normal).toHaveCSS('color', 'rgb(18, 52, 86)');
});

test('arrow updates retain focused commands and use the global placement gap', async ({ page }) => {
  const popup = page.locator('#dropdown-theme-fixture .ant-dropdown');
  const normal = popup.getByRole('menuitem', { name: 'Normal', exact: true });
  await normal.focus();

  await page.getByLabel('Themed Dropdown arrow', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(popup.locator('.ant-dropdown-arrow')).toHaveCount(0);
  await expect(normal).toBeFocused();
  await expect.poll(async () => {
    const surface = (await popup.boundingBox())!;
    const trigger = (await page.getByRole('button', {
      name: 'Open themed Dropdown', exact: true
    }).boundingBox())!;
    return surface.y - trigger.y - trigger.height;
  }).toBe(4);
  await expect(page.getByLabel('Dropdown theme changes', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Dropdown theme events', { exact: true })).toHaveText('[]');
});

test('custom prefix and narrow RTL retain popup bounds, focus return and scope cleanup', async ({ page }) => {
  await page.getByLabel('Dropdown token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Hash themed Dropdown', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.getByLabel('Right to left', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.getByLabel('Themed Dropdown placement', { exact: true }).selectOption('bottomRight');
  await page.setViewportSize({ width: 320, height: 1100 });
  const popup = page.locator('#dropdown-theme-fixture .ant-dropdown');
  const normal = popup.getByRole('menuitem', { name: 'Normal', exact: true });
  await normal.focus();

  await expect(popup).toHaveCSS('--drp-2-dropdown-padding-block', '7px');
  await expect(normal).toHaveCSS('padding-top', '7px');
  expect(await popup.evaluate(element =>
    [...element.classList].some(name => name.startsWith('css-')))).toBe(false);
  const bounds = (await popup.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  await normal.press('Escape');

  await expect(popup).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open themed Dropdown', exact: true })).toBeFocused();
  await page.getByLabel('Mount themed Dropdown', { exact: true }).uncheck();

  await expect(popup).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="dropdown-source-scope"]'))
    .toHaveCount(0);
});
