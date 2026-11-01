import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-metrics.json' with { type: 'json' };

async function openSamples(page: Page) {
  await page.locator('#overlay-theme-samples').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Open themed overlays', exact: true }).click();
  await expect(page.locator('.themed-popover')).toBeVisible();
  await expect(page.locator('.ant-popconfirm')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=overlay-theme');
  await expect(page.getByRole('heading', { name: 'Source overlay tokens', exact: true })).toBeVisible();
});

for (const sample of reference.cases) {
  test(`overlay styles match official UMD for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Overlay token preset', { exact: true }).selectOption(sample.name);
    await openSamples(page);
    const selectors = {
      tooltip: '.ant-tooltip', tooltipPanel: '.ant-tooltip-container', tooltipArrow: '.ant-tooltip-arrow',
      popover: '.themed-popover', popoverPanel: '.themed-popover .ant-popover-container',
      popoverTitle: '.themed-popover .ant-popover-title', popoverContent: '.themed-popover .ant-popover-content',
      popoverArrow: '.themed-popover .ant-popover-arrow',
      confirm: '.ant-popconfirm', confirmPanel: '.ant-popconfirm > .ant-popover-container',
      confirmTitle: '.ant-popconfirm-title', confirmDescription: '.ant-popconfirm-description',
      confirmIcon: '.ant-popconfirm-message-icon'
    };
    for (const name of Object.keys(selectors) as (keyof typeof selectors)[]) {
      const expected = sample.metrics[name];
      await expect.poll(() => page.locator(selectors[name]).evaluate((element, keys) => {
        const css = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, key === 'beforeClipPath'
          ? getComputedStyle(element, '::before').clipPath : css[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: name }).toEqual(expected);
    }
    for (const name of ['tooltip', 'popover', 'confirm'] as const) {
      await expect.poll(() => page.locator(selectors[name]).evaluate((element, id) => {
        const anchor = document.getElementById(`themed-${id}-anchor`)!;
        return element.getBoundingClientRect().top - anchor.getBoundingClientRect().bottom;
      }, name)).toBeCloseTo(sample.metrics.gaps[name], 1);
    }
  });
}

test('color updates preserve popup position, native editor identity, value and focus', async ({ page }) => {
  await page.getByLabel('Overlay token preset', { exact: true }).selectOption('own-popover');
  await openSamples(page);
  const editor = page.getByLabel('Popup editor', { exact: true });
  await editor.fill('Edited popup draft');
  const original = await editor.elementHandle();
  const position = await page.locator('.themed-popover').evaluate(element => ({
    left: (element as HTMLElement).style.left, top: (element as HTMLElement).style.top
  }));
  const changes = await page.getByLabel('Overlay open changes', { exact: true }).textContent();

  await page.getByLabel('Overlay color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(page.locator('.themed-popover .ant-popover-container'))
    .toHaveCSS('background-color', 'rgb(18, 52, 86)');
  expect(await page.locator('.themed-popover').evaluate(element => ({
    left: (element as HTMLElement).style.left, top: (element as HTMLElement).style.top
  }))).toEqual(position);
  expect(position.left).not.toBe('');
  expect(await editor.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(editor).toHaveValue('Edited popup draft');
  await expect(editor).toBeFocused();
  await expect(page.getByLabel('Overlay open changes', { exact: true })).toHaveText(changes!);
});

test('nested Popover consumes its own aliases without inheriting the Popconfirm owner', async ({ page }) => {
  await page.getByLabel('Overlay token preset', { exact: true }).selectOption('composed-aliases');
  await openSamples(page);
  await page.getByRole('button', { name: 'Nested themed panel', exact: true }).click();

  await expect(page.locator('.themed-nested-popover')).toBeVisible();
  await expect(page.locator('.themed-nested-popover')).toHaveCSS('font-size', '22px');
  await expect(page.locator('.themed-nested-popover')).toHaveCSS('color', 'rgb(0, 34, 0)');
});

test('arrow geometry follows global source tokens and toggles without closing the surface', async ({ page }) => {
  await openSamples(page);
  const popup = page.locator('.themed-popover');
  const gap = () => popup.evaluate(element => element.getBoundingClientRect().top
    - document.getElementById('themed-popover-anchor')!.getBoundingClientRect().bottom);
  await expect.poll(gap).toBeCloseTo(12, 1);

  await page.getByLabel('Global arrow width', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '32';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(popup.locator('.ant-popover-arrow')).toHaveCSS('width', '32px');
  await expect.poll(gap).toBeCloseTo(20, 1);
  await page.getByLabel('Show themed arrows', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(popup.locator('.ant-popover-arrow')).toHaveCount(0);
  await expect.poll(gap).toBeCloseTo(4, 1);
  await expect(page.getByLabel('Overlay open changes', { exact: true })).toHaveText('0');
});

test('pending confirmations survive token updates and close only after their Promise resolves', async ({ page }) => {
  await openSamples(page);
  const popup = page.locator('.ant-popconfirm');
  await popup.getByRole('button', { name: 'Confirm', exact: true }).click();

  await expect(popup).toHaveAttribute('aria-busy', 'true');
  await page.getByLabel('Overlay color override', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '#abcdef';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(popup).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Confirm', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Themed confirmations', { exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'Resolve themed confirmation', exact: true }).click();

  await expect(popup).not.toBeVisible();
});

test('custom prefixes work without hashes and unmount removes the provider scope', async ({ page }) => {
  await page.getByLabel('Overlay token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Hash themed overlays', { exact: true }).uncheck();
  await openSamples(page);

  await expect(page.locator('.themed-popover')).toHaveClass(/overlay-source-scope/);
  await expect(page.locator('.themed-popover')).not.toHaveClass(/css-dev-only/);
  await expect(page.locator('.themed-popover')).toHaveCSS('--overlay-2-popover-title-min-width', '230px');
  await page.getByLabel('Mount themed overlays', { exact: true }).uncheck();

  await expect(page.locator('.ant-tooltip,.themed-popover,.ant-popconfirm')).toHaveCount(0);
  await expect(page.locator('head style[data-ant-svelte-theme="overlay-source-scope"]')).toHaveCount(0);
});

test('removing source settings restores native panel styles and the original gap while open', async ({ page }) => {
  await page.getByLabel('Overlay token preset', { exact: true }).selectOption('own-popover');
  await openSamples(page);
  const popup = page.locator('.themed-popover');
  const original = await popup.elementHandle();

  await page.getByLabel('Apply source overlay tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(popup).toBeVisible();
  await expect(popup).toHaveCSS('font-size', '14px');
  await expect(popup.locator('.ant-popover-container')).toHaveCSS('padding', '12px');
  expect(await popup.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect.poll(() => popup.evaluate(element => element.getBoundingClientRect().top
    - document.getElementById('themed-popover-anchor')!.getBoundingClientRect().bottom))
    .toBeCloseTo(8, 1);
  await expect(page.locator('head style[data-ant-svelte-theme="overlay-source-scope"]')).toHaveCount(0);
  expect(await popup.evaluate(element =>
    (element as HTMLElement).style.getPropertyValue('--ant-popover-title-min-width')
  )).toBe('');
});
