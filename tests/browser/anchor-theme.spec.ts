import { test, expect } from './test';
import reference from './fixtures/ant-design-anchor-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=anchor-theme');
});

for (const sample of reference.cases) {
  test(`Anchor matches Ant Design source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Anchor token preset', { exact: true }).selectOption(sample.name);
    const selectors: Record<string, string> = {};
    for (const direction of ['vertical', 'horizontal']) {
      const root = `.anchor-token-${direction}`;
      const items = `${root} .ant-anchor > .ant-anchor-link`;
      selectors[direction + 'Root'] = root;
      selectors[direction + 'Content'] = root + ' .ant-anchor';
      selectors[direction + 'First'] = items + ':nth-of-type(1)';
      selectors[direction + 'Second'] = items + ':nth-of-type(2)';
      selectors[direction + 'Title'] = items + ':nth-of-type(2) > .ant-anchor-link-title';
      selectors[direction + 'Hover'] = selectors[direction + 'Title'];
      selectors[direction + 'Focus'] = selectors[direction + 'Title'];
      selectors[direction + 'Indicator'] = root + ' .ant-anchor-ink';
      selectors[direction + 'Border'] = direction === 'horizontal' ? root : root + ' .ant-anchor';
    }
    selectors.nestedItem = '.anchor-token-vertical .ant-anchor-link .ant-anchor-link';
    selectors.nestedTitle = selectors.nestedItem + ' .ant-anchor-link-title';

    for (const [name, expected] of Object.entries(sample.metrics)) {
      const target = page.locator(selectors[name]);
      if (name.endsWith('Hover')) await target.hover();
      if (name.endsWith('Focus')) await target.focus();

      await expect.poll(() => target.evaluate((element, input) => {
        const css = getComputedStyle(element, input.pseudo);
        return Object.fromEntries(input.keys.map(key => [key, css[key as keyof CSSStyleDeclaration]]));
      }, { keys: Object.keys(expected), pseudo: name.endsWith('Border') ? '::before' : null }), {
        message: `${sample.name}/${name}`
      }).toEqual(expected);

      if (name.endsWith('Hover')) await page.mouse.move(1270, 700);
      if (name.endsWith('Focus')) await target.evaluate(element => (element as HTMLElement).blur());
    }
  });
}

test('legacy links retain source nested spacing and the first horizontal exception', async ({ page }) => {
  await page.getByLabel('Anchor token preset', { exact: true }).selectOption('own-tokens');
  await page.getByLabel('Legacy themed Anchor', { exact: true }).check();

  await expect(page.locator('.anchor-token-vertical .ant-anchor > .ant-anchor-link').first())
    .toHaveCSS('padding-block-start', '9px');
  await expect(page.locator('.anchor-token-vertical .ant-anchor-link .ant-anchor-link'))
    .toHaveCSS('padding-block-start', '3px');
  const horizontal = page.locator('.anchor-token-horizontal .ant-anchor > .ant-anchor-link');
  await expect(horizontal.first()).toHaveCSS('padding-inline-start', '0px');
  await expect(horizontal.nth(1)).toHaveCSS('padding-inline-start', '27px');
});

test('theme colors retain links, focus, scroll, history and callback state', async ({ page }) => {
  const root = page.locator('.anchor-token-main');
  const link = root.getByRole('link', { name: 'Delivery', exact: true });
  await link.focus();
  await link.press('Enter');
  await expect.poll(() => page.locator('#anchor-theme-scroll').evaluate(node => node.scrollTop))
    .toBe(200);
  await expect(link).toHaveClass(/-title-active/);
  const original = await link.elementHandle();
  const changes = await page.getByLabel('Anchor theme changes', { exact: true }).textContent();

  await page.getByLabel('Anchor color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(link).toHaveCSS('color', 'rgb(18, 52, 86)');
  await expect(root.locator('.ant-anchor-ink')).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  expect(await link.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(link).toBeFocused();
  await expect(page).toHaveURL(/#theme-delivery$/);
  await expect(page.getByLabel('Anchor theme clicks', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Anchor theme changes', { exact: true })).toHaveText(changes!);
  expect(await page.locator('#anchor-theme-scroll').evaluate(node => node.scrollTop)).toBe(200);
});

test('component algorithms retain native links and do not publish scroll callbacks', async ({ page }) => {
  const link = page.locator('.anchor-token-main').getByRole('link', { name: 'Overview', exact: true });
  await link.focus();
  const original = await link.elementHandle();
  const changes = await page.getByLabel('Anchor theme changes', { exact: true }).textContent();

  await page.getByLabel('Anchor token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'own-algorithm';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(link).toHaveCSS('font-size', '18px');
  expect(await link.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(link).toBeFocused();
  await expect(page.getByLabel('Anchor theme clicks', { exact: true })).toHaveText('0');
  await expect(page.getByLabel('Anchor theme changes', { exact: true })).toHaveText(changes!);
});

test('semantic and plain spacing overrides retain priority during source updates', async ({ page }) => {
  await page.getByLabel('Anchor token preset', { exact: true }).selectOption('own-tokens');
  await page.getByLabel('Override Anchor spacing', { exact: true }).check();
  const item = page.locator('.anchor-token-main .ant-anchor > .ant-anchor-link').first();
  await expect(item).toHaveCSS('padding-inline-start', '37px');

  await page.getByLabel('Anchor color override', { exact: true }).fill('#123456');

  await expect(item).toHaveCSS('padding-inline-start', '37px');
  await page.getByLabel('Override Anchor spacing', { exact: true }).uncheck();

  await expect(item).toHaveCSS('padding-inline-start', '27px');
});

test('native compact styles return on existing focused links after source removal', async ({ page }) => {
  await page.getByLabel('Anchor token preset', { exact: true }).selectOption('own-tokens');
  await page.getByLabel('Native compact Anchor', { exact: true }).check();
  const link = page.locator('.anchor-token-main').getByRole('link', { name: 'Overview', exact: true });
  await link.focus();
  const original = await link.elementHandle();

  await page.getByLabel('Apply source Anchor tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(link).toHaveCSS('font-size', '12px');
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await expect(link.locator('..')).toHaveCSS('padding-inline-start', '16px');
  expect(await link.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(link).toBeFocused();
  await expect(page.locator('head style[data-ant-svelte-theme="anchor-source-scope"]'))
    .toHaveCount(0);
});

test('provider scope resets aliases inherited from surrounding content', async ({ page }) => {
  await page.getByLabel('Parent Anchor aliases', { exact: true }).check();
  const title = page.locator('.anchor-token-main').getByRole('link', {
    name: 'Payment', exact: true
  });

  await expect(title).toHaveCSS('font-size', '14px');
  await expect(title).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
});

test('custom prefix and narrow RTL keep source spacing and clean up scope styles', async ({ page }) => {
  await page.getByLabel('Anchor token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Hash themed Anchor', { exact: true }).uncheck();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.setViewportSize({ width: 320, height: 900 });
  const root = page.locator('.anchor-token-horizontal');
  const links = root.getByRole('link');

  await expect(root).toHaveCSS('--anc-2-anchor-link-padding-inline-start', '19px');
  await expect(links.nth(1).locator('..')).toHaveCSS('padding-inline-start', '19px');
  expect(await root.evaluate(element =>
    [...element.classList].some(name => name.startsWith('css-')))).toBe(false);
  const box = (await root.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  await page.getByLabel('Mount themed Anchor', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="anchor-source-scope"]'))
    .toHaveCount(0);
});
