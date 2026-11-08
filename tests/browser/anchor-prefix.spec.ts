import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-anchor-prefix-reference.json' with { type: 'json' };
import { snapshotAnchorPrefix } from './anchor-prefix-metrics';

for (const entry of reference.cases) {
  test(`Anchor prefix matches source spacing and ink for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=anchor-prefix');
    await page.getByRole('combobox', { name: 'Anchor prefix sample', exact: true })
      .selectOption(entry.sample.id);
    // Source не передаёт local prefix в items; explicit item prefix даёт полную раскладку.
    const expected = 'matchedItems' in entry ? entry.matchedItems : entry.result;

    await expect.poll(() => page.evaluate(snapshotAnchorPrefix)).toEqual(expected);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Anchor prefix value' : 'Live Anchor prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Anchor shared prefix updates preserve links, ink, focus and history callbacks', async ({ page }) => {
  await page.goto('/?fixture=anchor-prefix');
  await page.getByRole('checkbox', { name: 'Live Anchor prefix', exact: true }).check();
  const scope = page.locator('[data-anchor-prefix-scope="normal"]');
  const root = scope.locator('.fixture-anchor-prefix-root');
  const ink = root.locator(':scope > div > span');
  const link = scope.getByRole('link', { name: 'Second', exact: true });
  await link.focus();
  const oldRoot = await root.elementHandle();
  const oldLink = await link.elementHandle();
  const oldInk = await ink.elementHandle();
  const changes = await scope.getByLabel('normal prefix changes', { exact: true }).textContent();

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotAnchorPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await link.evaluate((node, old) => node === old, oldLink)).toBe(step.sameLink);
    expect(await ink.evaluate((node, old) => node === old, oldInk)).toBe(step.sameInk);
    expect(await link.evaluate(node => node === document.activeElement)).toBe(step.focused);
    await expect(scope.getByLabel('normal prefix changes', { exact: true })).toHaveText(changes!);
  }
  await link.press('Enter');

  await expect(page).toHaveURL(/#prefix-two$/);
  await expect(scope.getByLabel('normal prefix clicks', { exact: true })).toHaveText('1');
  await expect(link).toBeFocused();
});

test('Anchor local prefix retains native focus and measures ink after direction changes', async ({ page }) => {
  await page.goto('/?fixture=anchor-prefix');
  await page.getByRole('checkbox', { name: 'Live Anchor prefix', exact: true }).check();
  const scope = page.locator('[data-anchor-prefix-scope="normal"]');
  const link = scope.getByRole('link', { name: 'Second', exact: true });
  await link.focus();
  const previous = await link.elementHandle();
  await setPrefix(page, 'nav', true);

  await expect(link).toHaveClass(/nav-link-title-active/);
  await expect(link.locator('..')).toHaveCSS('padding-inline-start', '16px');
  await expect(scope.locator('.nav-ink')).toHaveCSS('top', '45px');
  await page.getByRole('checkbox', { name: 'Horizontal prefixed Anchor', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.checked = true;
      node.dispatchEvent(new Event('change', { bubbles: true }));
    });

  await expect(scope.locator('.nav-wrapper-horizontal')).toBeVisible();
  await expect(scope.getByRole('link', { name: 'Detail', exact: true })).toHaveCount(0);
  await expect.poll(() => scope.locator('.nav-ink').evaluate(node => {
    const active = node.parentElement!.querySelector<HTMLElement>('[data-ant-anchor-title-active]')!;
    const ink = node as HTMLElement;
    return [ink.style.left === `${active.offsetLeft}px`, ink.style.width === `${active.clientWidth}px`];
  })).toEqual([true, true]);
  const sourceInk = reference.cases.find(entry => entry.sample.id === 'horizontal')!
    .result.normal.ink;
  await expect(scope.locator('.nav-ink')).toHaveCSS('left', sourceInk.left);
  await expect(scope.locator('.nav-ink')).toHaveCSS('width', sourceInk.width);
  expect(await link.evaluate((node, old) => node === old, previous)).toBe(true);
  await expect(link).toBeFocused();
});

test('Anchor prefixed links keep theme decoration states and sibling isolation', async ({ page }) => {
  await page.goto('/?fixture=anchor-prefix');
  await page.getByRole('combobox', { name: 'Anchor prefix sample', exact: true }).selectOption('local');
  await page.getByRole('checkbox', { name: 'Decorated prefix links', exact: true }).check();
  const link = page.locator('[data-anchor-prefix-scope="normal"]')
    .getByRole('link', { name: 'Second', exact: true });

  await expect(link).toHaveCSS('text-decoration-line', 'underline');
  await link.hover();
  await expect(link).toHaveCSS('text-decoration-line', 'overline');
  await link.focus();
  await expect(link).toHaveCSS('text-decoration-line', 'line-through');
  await expect(page.locator('[data-anchor-prefix-scope="sibling"]')
    .getByRole('link', { name: 'Second', exact: true })).toHaveCSS('text-decoration-line', 'none');
});
