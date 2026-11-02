import { test, expect } from './test';
import reference from './fixtures/ant-design-breadcrumb-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/?fixture=breadcrumb-theme');
});

for (const sample of reference.cases) {
  test(`Breadcrumb matches Ant Design source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Breadcrumb token preset', { exact: true }).selectOption(sample.name);
    const root = '.breadcrumb-token-main';
    const first = `${root} .ant-breadcrumb-item:first-child`;
    const overlay = `${root} .ant-breadcrumb-overlay-link`;
    const bare = '.breadcrumb-token-bare .ant-breadcrumb-link';
    const popup = `${root} .ant-dropdown`;
    const selectors: Record<string, string> = {
      root,
      link: first + ' a',
      icon: first + ' .anticon',
      label: first + ' .ant-breadcrumb-link > span:last-child',
      separator: root + ' .ant-breadcrumb-separator:nth-child(2)',
      last: root + ' .ant-breadcrumb-item:last-child',
      overlay,
      'overlay-text': overlay + ' > .breadcrumb-overlay-title',
      arrow: overlay + ' .breadcrumb-arrow',
      'bare-svg': bare + ' > svg',
      'bare-label': bare + ' > span',
      'link-hover': first + ' a',
      'overlay-hover': overlay,
      'arrow-hover': overlay + ' .breadcrumb-arrow',
      focus: first + ' a',
      'popup-menu': popup + ' .ant-dropdown-menu',
      'popup-link': popup + ' [data-dropdown-key="one"]'
    };

    for (const [name, expected] of Object.entries(sample.metrics)) {
      const direction = name.startsWith('rtl-') ? 'rtl' : 'ltr';
      const part = name.slice(4);
      if (part === 'root') {
        await page.getByLabel('RTL themed Breadcrumb', { exact: true }).evaluate((element, rtl) => {
          const input = element as HTMLInputElement;
          input.checked = rtl;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }, direction === 'rtl');
      }
      const target = page.locator(selectors[part]);
      if (part.endsWith('-hover')) {
        await page.locator(part === 'link-hover' ? selectors.link : overlay).hover();
      }
      if (part === 'focus') await target.focus();

      await expect.poll(() => target.evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: `${sample.name}/${name}` }).toEqual(expected);

      if (part === 'link-hover' || part === 'arrow-hover') await page.mouse.move(1270, 1390);
      if (part === 'focus') await target.evaluate(element => (element as HTMLElement).blur());
    }
  });
}

for (const variant of reference.variants) {
  test(`Breadcrumb preserves rich title and arrow ${variant.kind}/${variant.atEnd}/${variant.semantic}`, async ({ page }) => {
    await page.getByLabel('Breadcrumb token preset', { exact: true }).selectOption('own-tokens');
    for (const [name, checked] of [
      ['Rich Breadcrumb menu title', true],
      ['Breadcrumb menu at end', variant.atEnd],
      ['Override Breadcrumb token styles', variant.semantic]
    ] as const) {
      await page.getByLabel(name, { exact: true }).evaluate((element, checked) => {
        const input = element as HTMLInputElement;
        input.checked = checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, checked);
    }
    await page.getByLabel('Breadcrumb arrow content', { exact: true }).selectOption(variant.kind);
    const overlay = page.locator('.breadcrumb-token-main .ant-breadcrumb-overlay-link');
    const targets = {
      overlay,
      text: overlay.locator('> .breadcrumb-overlay-title'),
      titleIcon: overlay.locator('.breadcrumb-overlay-title > .anticon'),
      arrow: variant.kind === 'text' ? overlay
        : overlay.locator(variant.kind === 'default' ? '.breadcrumb-arrow' : '> [data-arrow-reference]')
    };
    for (const name of ['overlay', 'text', 'titleIcon', 'arrow'] as const) {
      await expect.poll(() => targets[name].evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(variant[name]))).toEqual(variant[name]);
    }
    expect(await overlay.evaluate(element => {
      const range = document.createRange();
      range.selectNodeContents(element.querySelector('[data-menu-label]')!);
      return range.getBoundingClientRect().top - element.getBoundingClientRect().top;
    })).toBeCloseTo(variant.labelTop, 5);
  });
}

test('theme updates retain native links, focus, navigation and callbacks', async ({ page }) => {
  const link = page.locator('.breadcrumb-token-main').getByRole('link', { name: 'Home', exact: true });
  await link.focus();
  const original = await link.elementHandle();

  await page.getByLabel('Breadcrumb link color', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(link).toHaveCSS('color', 'rgb(18, 52, 86)');
  expect(await link.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(link).toBeFocused();
  await expect(page.getByLabel('Breadcrumb theme events', { exact: true })).toHaveText('[]');
  await link.press('Enter');

  await expect(page).toHaveURL(/#breadcrumb-theme-home$/);
  await expect(page.getByLabel('Breadcrumb theme events', { exact: true })).toHaveText('["home"]');
});

test('component algorithms retain popup nodes, focus and keyboard link activation', async ({ page }) => {
  const root = page.locator('.breadcrumb-token-main');
  const menu = root.getByRole('menu', { name: 'Themed Breadcrumb sections', exact: true });
  const link = menu.getByRole('menuitem', { name: 'Menu One', exact: true });
  await link.focus();
  const original = await link.elementHandle();
  const position = await root.locator('.ant-dropdown')
    .evaluate(element => [element.style.left, element.style.top]);

  await page.getByLabel('Breadcrumb token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'own-algorithm';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(root).toHaveCSS('font-size', '18px');
  await expect(link).toHaveCSS('font-size', '14px');
  await expect(link).toBeFocused();
  expect(await link.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(position.every(Boolean)).toBe(true);
  expect(await root.locator('.ant-dropdown').evaluate(element => element.style.left)).not.toBe('');
  await expect(page.getByLabel('Breadcrumb theme events', { exact: true })).toHaveText('[]');
  await link.press('Enter');

  await expect(page).toHaveURL(/#breadcrumb-theme-section\/one$/);
  await expect(menu).toBeHidden();
  await expect(page.getByLabel('Breadcrumb theme events', { exact: true }))
    .toHaveText('["menu:one"]');
});

test('semantic and plain spacing keep priority during source updates', async ({ page }) => {
  await page.getByLabel('Breadcrumb token preset', { exact: true }).selectOption('own-tokens');
  await page.getByLabel('Override Breadcrumb token styles', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const root = page.locator('.breadcrumb-token-main');
  const separator = root.locator('.ant-breadcrumb-separator').first();
  const arrow = root.locator('.breadcrumb-arrow');
  await expect(separator).toHaveCSS('margin-inline-start', '27px');
  await expect(arrow).toHaveCSS('color', 'rgb(0, 170, 17)');

  await page.getByLabel('Breadcrumb link color', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#332211';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(separator).toHaveCSS('margin-inline-start', '27px');
  await expect(arrow).toHaveCSS('color', 'rgb(0, 170, 17)');
});

test('native compact returns without replacing the focused menu trigger', async ({ page }) => {
  await page.getByLabel('Breadcrumb token preset', { exact: true }).selectOption('own-aliases');
  await page.getByLabel('Native compact Breadcrumb', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const trigger = page.locator('.breadcrumb-token-main').getByRole('link', {
    name: 'Section', exact: true
  });
  await trigger.focus();
  const original = await trigger.elementHandle();

  await page.getByLabel('Apply source Breadcrumb tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(trigger).toHaveCSS('font-size', '12px');
  await expect(trigger).toBeFocused();
  expect(await trigger.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(page.locator('.breadcrumb-token-main')).not.toHaveClass(/ant-breadcrumb-source-theme/);
  await expect(page.locator('head style[data-ant-svelte-theme="breadcrumb-source-scope"]'))
    .toHaveCount(0);
  await expect(page.getByLabel('Breadcrumb theme events', { exact: true })).toHaveText('[]');
});

test('provider scope resets aliases inherited from surrounding content', async ({ page }) => {
  await page.getByLabel('Parent Breadcrumb aliases', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const root = page.locator('.breadcrumb-token-main');

  await expect(root).toHaveCSS('font-size', '14px');
  await expect(root.getByRole('link', { name: 'Home', exact: true }))
    .toHaveCSS('color', 'rgba(0, 0, 0, 0.45)');
  await expect(root.getByRole('menuitem', { name: 'Menu One', exact: true }))
    .toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
});

test('custom prefix and narrow RTL keep wrapping, keyboard return and scope cleanup', async ({ page }) => {
  await page.getByLabel('Breadcrumb token preset', { exact: true }).selectOption('custom-prefix');
  for (const name of ['RTL themed Breadcrumb', 'Narrow themed Breadcrumb']) {
    await page.getByLabel(name, { exact: true }).evaluate(element => {
      const input = element as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  await page.getByLabel('Hash themed Breadcrumb', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.setViewportSize({ width: 320, height: 1100 });
  const root = page.locator('.breadcrumb-token-main');
  await root.scrollIntoViewIfNeeded();
  const trigger = root.getByRole('link', { name: 'Section', exact: true });
  await trigger.focus();
  await trigger.press('ArrowDown');
  const menu = root.getByRole('menu', { name: 'Themed Breadcrumb sections', exact: true });

  await expect(menu.getByRole('menuitem', { name: 'Menu One', exact: true })).toBeFocused();
  expect(await root.locator('> ol > .ant-breadcrumb-item').evaluateAll(items =>
    new Set(items.map(item => item.getBoundingClientRect().top)).size)).toBeGreaterThan(1);
  await expect(root).toHaveCSS('--brc-2-breadcrumb-separator-margin', '13px');
  expect(await root.evaluate(element =>
    [...element.classList].some(name => name.startsWith('css-')))).toBe(false);
  const bounds = (await root.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  await page.keyboard.press('Escape');

  await expect(trigger).toBeFocused();
  await expect(menu).toBeHidden();
  await page.getByLabel('Mount themed Breadcrumb', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="breadcrumb-source-scope"]'))
    .toHaveCount(0);
});
