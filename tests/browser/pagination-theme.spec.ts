import { test, expect } from './test';
import reference from './fixtures/ant-design-pagination-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1400 });
  await page.goto('/?fixture=pagination-theme');
});

for (const sample of reference.cases) {
  for (const direction of ['ltr', 'rtl']) {
    test(`Pagination matches Ant Design source metrics for ${sample.name}/${direction}`,
      async ({ page }) => {
        await page.getByLabel('Pagination token preset', { exact: true }).selectOption(sample.name);
        if (direction === 'rtl') {
          await page.getByLabel('RTL themed Pagination', { exact: true }).check();
        }

        for (const [name, expected] of Object.entries(sample.metrics)) {
          if (!name.startsWith(direction + '/')) continue;
          const variant = name.slice(direction.length + 1);
          const root = page.locator(`.pagination-token-${variant}`);

          await expect.poll(() => root.evaluate((element, metrics: Record<
            string, Record<string, string>
          >) => {
            const selectors: Record<string, string> = {
              item: '.ant-pagination-item-1',
              page: '.ant-pagination-item-1 > .page-button',
              active: '.ant-pagination-item-active',
              activePage: '.ant-pagination-item-active > .page-button',
              simpleInput: '.ant-pagination-simple-pager input',
              prev: '.ant-pagination-prev .ant-pagination-item-link',
              select: '.ant-select',
              quick: '.ant-pagination-options-quick-jumper',
              quickInput: '.ant-pagination-options-quick-jumper input'
            };
            return Object.fromEntries(Object.entries(metrics).map(([name, fields]) => {
              const target = name === 'root' ? element : element.querySelector(selectors[name]);
              if (!target) throw new Error(`Missing Pagination metric ${name}`);
              const css = getComputedStyle(target);
              return [name, Object.fromEntries(Object.keys(fields).map(key => [key,
                css[key as keyof CSSStyleDeclaration]
              ]))];
            }));
          }, expected), { message: `${sample.name}/${name}` }).toEqual(expected);
        }
      });
  }
}

test('token updates preserve page buttons, focus, binding and callbacks', async ({ page }) => {
  const root = page.getByRole('navigation', { name: 'Interactive themed Pagination', exact: true });
  const button = root.locator('.ant-pagination-item-7 > button');
  await button.focus();
  const original = await button.elementHandle();

  await page.getByLabel('Pagination item size', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '44';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(root.locator('.ant-pagination-item-7')).toHaveCSS('height', '44px');
  await expect(button).toBeFocused();
  expect(await button.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(page.getByLabel('Pagination theme events', { exact: true })).toHaveText('[]');
  await button.press('Enter');

  await expect(button).toHaveAttribute('aria-current', 'page');
  await expect(page.getByLabel('Pagination theme events', { exact: true }))
    .toHaveText('["change:7:10"]');
});

test('component algorithms preserve a simple input draft, selection and focus', async ({ page }) => {
  const input = page.locator('.pagination-token-editable .ant-pagination-simple-pager input');
  await input.fill('9');
  await input.evaluate(element => (element as HTMLInputElement).setSelectionRange(0, 1));
  const original = await input.elementHandle();

  await page.getByLabel('Pagination token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'own-algorithm';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(page.locator('.pagination-token-editable')).toHaveCSS('font-size', '18px');
  await expect(input).toHaveValue('9');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await input.evaluate(element => [
    (element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd
  ])).toEqual([0, 1]);
  await input.press('Enter');

  await expect(page.getByLabel('Pagination theme events', { exact: true }))
    .toHaveText('["simple:9:10"]');
});

test('native root styles keep priority over component defaults and scope resets parent aliases',
  async ({ page }) => {
    await page.getByLabel('Pagination token preset', { exact: true }).selectOption('own-aliases');
    await page.getByLabel('Parent Pagination aliases', { exact: true }).check();
    await page.getByLabel('Override Pagination token styles', { exact: true }).check();
    const root = page.locator('.pagination-token-middle');

    await expect(root).toHaveCSS('font-size', '20px');
    await expect(root.locator('.ant-pagination-item-1')).toHaveCSS('height', '47px');
    await page.getByLabel('Pagination token preset', { exact: true }).selectOption('own-tokens');

    await expect(root.locator('.ant-pagination-item-1')).toHaveCSS('height', '47px');
  });

test('wireframe follows the global token and updates without replacing native controls',
  async ({ page }) => {
    const root = page.locator('.pagination-token-middle');
    const button = root.locator('.ant-pagination-item-7 > button');
    const original = await button.elementHandle();

    await page.getByLabel('Pagination token preset', { exact: true })
      .selectOption('wireframe-own-false');

    await expect(root).toHaveClass(/ant-pagination-bordered/);
    await expect(root.locator('.ant-pagination-item-1'))
      .toHaveCSS('border-top-color', 'rgb(217, 217, 217)');
    await page.getByLabel('Pagination token preset', { exact: true })
      .selectOption('wireframe-own-true');

    await expect(root).not.toHaveClass(/ant-pagination-bordered/);
    expect(await button.evaluate((element, previous) => element === previous, original)).toBe(true);
  });

test('source removal restores native themes and keeps the focused quick-jumper draft',
  async ({ page }) => {
    const root = page.locator('.pagination-token-interactive');
    const input = root.locator('.ant-pagination-options-quick-jumper input');
    await input.fill('8');
    const original = await input.elementHandle();

    await page.getByLabel('Apply source Pagination tokens', { exact: true }).evaluate(element => {
      const input = element as HTMLInputElement;
      input.checked = false;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(root).not.toHaveClass(/ant-pagination-source-theme/);
    await expect(input).toHaveValue('8');
    await expect(input).toBeFocused();
    expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);
    await expect(page.locator('style[data-ant-svelte-theme="pagination-source-scope"]'))
      .toHaveCount(0);
  });

for (const sample of reference.interactions) {
  test(`Pagination matches source hover and input focus for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Pagination token preset', { exact: true }).selectOption(sample.name);
    for (const [name, expected] of Object.entries(sample.states)) {
      if ('item' in expected) {
        const part = name.slice(6);
        const root = page.locator(part === 'disabled'
          ? '.pagination-token-disabled' : '.pagination-token-middle');
        const item = root.locator(part === 'active' ? '.ant-pagination-item-active'
          : part === 'prev' ? '.ant-pagination-prev' : '.ant-pagination-item-1');
        await item.hover();

        await expect.poll(() => item.evaluate((element, metrics: Record<
          string, Record<string, string>
        >) => Object.fromEntries(Object.entries(metrics).map(([name, fields]) => {
          const target = name === 'item' ? element : element.querySelector('button')!;
          const css = getComputedStyle(target);
          return [name, Object.fromEntries(Object.keys(fields).map(key => [key,
            css[key as keyof CSSStyleDeclaration]
          ]))];
        })), expected)).toEqual(expected);
        await page.mouse.move(1590, 1390);
      } else {
        const input = page.locator(`.pagination-token-${name.slice(6)} `
          + '.ant-pagination-options-quick-jumper input');
        await input.focus();

        await expect.poll(() => input.evaluate((element, fields) => {
          const css = getComputedStyle(element);
          return Object.fromEntries(fields.map(key => [key,
            css[key as keyof CSSStyleDeclaration]
          ]));
        }, Object.keys(expected))).toEqual(expected);
        await input.evaluate(element => (element as HTMLInputElement).blur());
      }
    }
  });
}

test('Select tokens stay separate and size changes retain callback order after theme updates',
  async ({ page }) => {
    await page.getByLabel('Pagination token preset', { exact: true }).selectOption('select-aliases');
    const root = page.getByRole('navigation', { name: 'Interactive themed Pagination', exact: true });
    const select = root.getByRole('combobox');
    await select.click();
    const option = root.getByRole('option', { name: /^20 / });
    await expect(option).toBeVisible();
    const original = await option.elementHandle();

    await page.getByLabel('Pagination item size', { exact: true }).evaluate(element => {
      const input = element as HTMLInputElement;
      input.value = '44';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await expect(root.locator('.ant-select')).toHaveCSS('font-size', '18px');
    expect(await option.evaluate((element, previous) => element === previous, original)).toBe(true);
    await option.click();

    await expect(page.getByLabel('Pagination theme events', { exact: true }))
      .toHaveText('["size:6:20","change:6:20"]');
  });

test('custom prefixes and narrow RTL preserve native controls, mobile size changer and cleanup',
  async ({ page }) => {
    await page.getByLabel('Pagination token preset', { exact: true }).selectOption('custom-prefix');
    await page.getByLabel('Hash themed Pagination', { exact: true }).uncheck();
    await page.getByLabel('RTL themed Pagination', { exact: true }).check();
    await page.getByLabel('Narrow themed Pagination', { exact: true }).check();
    await page.setViewportSize({ width: 320, height: 1400 });
    const root = page.getByRole('navigation', { name: 'Interactive themed Pagination', exact: true });

    await expect(root).not.toHaveClass(/(?:^|\s)css-[a-z0-9]+(?:\s|$)/);
    expect((await root.boundingBox())!.width).toBeLessThanOrEqual(200);
    await expect(root.getByRole('combobox')).toBeVisible();
    const pageButton = root.locator('.ant-pagination-item-20 > button');
    await expect(pageButton).toBeVisible();
    await pageButton.focus();
    await pageButton.press('Enter');

    await expect(pageButton).toHaveAttribute('aria-current', 'page');
    await expect(page.getByLabel('Pagination theme events', { exact: true }))
      .toHaveText('["change:20:10"]');
    await page.getByLabel('Mount themed Pagination', { exact: true }).uncheck();

    await expect(root).toHaveCount(0);
    await expect(page.locator('style[data-ant-svelte-theme="pagination-source-scope"]'))
      .toHaveCount(0);
  });
