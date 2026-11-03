import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('dialog.ant-svelte-dialog,dialog.ant-svelte-drawer');
const panel = (page: Page) => page.getByRole('dialog', { name: 'Container panel', exact: true });
const draft = (page: Page) => page.getByRole('textbox', { name: 'Panel draft', exact: true });
const opener = (page: Page) => page.getByRole('button', { name: 'Open container panel', exact: true });
test.use({ viewport: { width: 1300, height: 1000 } });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=dialog-container'); });

async function check(page: Page, label: string, checked: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, checked) => {
    const input = node as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}
async function choose(page: Page, name: string) {
  await page.getByLabel('Dialog reference', { exact: true }).selectOption(name);
}
async function open(page: Page, name: string) {
  await choose(page, name);
  await opener(page).click();
  await expect(panel(page)).toBeVisible();
}
async function frames(page: Page) {
  await page.evaluate(async () => {
    for (let n = 0; n < 10; n++) await new Promise(requestAnimationFrame);
  });
}

for (const name of ['modal-local', 'modal-local-shadow', 'drawer-local', 'drawer-local-shadow']) {
  test(`dialog containers retain native modality and opener focus for ${name}`, async ({ page }) => {
    await open(page, name);
    const close = panel(page).getByRole('button', { name: 'Закрыть', exact: true });
    await close.focus();

    await page.getByLabel('Panel outside', { exact: true })
      .evaluate(node => (node as HTMLInputElement).focus());

    await expect(close).toBeFocused();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    for (const key of ['Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      expect(await root(page).evaluate(node => !node.ownerDocument.hasFocus()
        || node.contains((node.getRootNode() as Document | ShadowRoot).activeElement))).toBe(true);
    }
    await close.focus();
    await page.keyboard.press('Escape');

    await expect(panel(page)).toHaveCount(0);
    await expect(opener(page)).toBeFocused();
    await expect(page.getByLabel('Panel container closes', { exact: true })).toHaveText('1');
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  });

  test(`dialog containers preserve drafts and focus through theme updates for ${name}`, async ({ page }) => {
    await open(page, name);
    await draft(page).fill('Themed draft');
    await draft(page).evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5));
    const previousInput = await draft(page).elementHandle();
    const previousRoot = await root(page).elementHandle();

    await check(page, 'Dark container panel', true);

    await expect.poll(() => draft(page).evaluate(node => getComputedStyle(node)
      .getPropertyValue('--panel-origin').trim())).toBe('dark');
    await expect(draft(page)).toHaveValue('Themed draft');
    await expect(draft(page)).toBeFocused();
    expect(await draft(page).evaluate((node, old) => ({
      same: node === old,
      selection: [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd]
    }), previousInput)).toEqual({ same: true, selection: [1, 5] });
    expect(await root(page).evaluate((node, old) => node === old, previousRoot)).toBe(true);
  });

  test(`dialog containers dismiss a complete backdrop click for ${name}`, async ({ page }) => {
    await open(page, name);

    await page.mouse.click(5, 5);

    await expect(panel(page)).toHaveCount(0);
    await expect(page.getByLabel('Panel container closes', { exact: true })).toHaveText('1');
    await expect(opener(page)).toBeFocused();
  });

  test(`dialog containers keep nested popup Escape in order for ${name}`, async ({ page }) => {
    await choose(page, name);
    await check(page, 'Nested panel controls', true);
    await opener(page).click();
    const select = panel(page).getByRole('combobox', { name: 'Nested panel choice', exact: true });

    await select.click();
    await expect(panel(page).getByRole('option', { name: 'Beta', exact: true })).toBeVisible();
    await select.press('Escape');

    await expect(select).toHaveAttribute('aria-expanded', 'false');
    await expect(panel(page)).toBeVisible();
    const hint = panel(page).getByRole('button', { name: 'Panel hint', exact: true });
    await hint.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await hint.press('Escape');

    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await expect(panel(page)).toBeVisible();
    await hint.press('Escape');

    await expect(panel(page)).toHaveCount(0);
    await expect(page.getByLabel('Panel container closes', { exact: true })).toHaveText('1');
  });

  for (const label of ['Mount container panel', 'Mount panel tree']) {
    test(`dialog containers clean up after ${label} for ${name}`, async ({ page }) => {
      await open(page, name);
      await draft(page).fill('Removed draft');

      await check(page, label, false);
      await expect(root(page)).toHaveCount(0);
      const calls = await page.getByLabel('Panel owner calls', { exact: true }).innerText();
      await page.getByRole('button', { name: 'Refresh panel function', exact: true }).click();
      await check(page, 'Dark container panel', true);
      await frames(page);

      await expect(page.getByLabel('Panel owner calls', { exact: true })).toHaveText(calls);
      await expect(page.locator('style[data-ant-dialog-lock]')).toHaveCount(0);
      await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    });
  }
}

for (const component of ['modal', 'drawer']) {
  for (const staging of ['element', 'fragment']) {
    test(`dialog waits for a connected ${staging} for ${component}`, async ({ page }) => {
      await choose(page, `${component}-local`);
      await page.getByLabel('Panel staging', { exact: true }).selectOption(staging);

      await opener(page).click();

      await expect(page.getByLabel('Panel container open', { exact: true })).toHaveText('true');
      await expect(root(page)).toHaveCount(0);
      await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
      await page.getByRole('button', { name: 'Connect staged panel', exact: true }).click();

      await expect(panel(page)).toBeVisible();
      await draft(page).fill('Staged draft');
      const originalInput = await draft(page).elementHandle();
      if (staging === 'element') {
        await page.getByRole('button', { name: 'Disconnect staged panel', exact: true })
          .evaluate(node => (node as HTMLElement).click());
        await expect(root(page)).toHaveCount(0);
        await page.getByRole('button', { name: 'Connect staged panel', exact: true }).click();

        await expect(panel(page)).toBeVisible();
        await expect(draft(page)).toHaveValue('Staged draft');
        expect(await draft(page).evaluate((node, old) => node === old, originalInput)).toBe(true);
      }
      await check(page, 'Mount container panel', false);

      await expect(root(page)).toHaveCount(0);
      await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
      await expect(page.getByLabel('Panel container closes', { exact: true })).toHaveText('0');
    });
  }
}

test('changing a Drawer container during leave cancels the old motion and destruction state', async ({ page }) => {
  await open(page, 'drawer-destroy');
  await check(page, 'Animate container panel', true);
  await frames(page);
  await draft(page).fill('Leaving draft');
  const previousRoot = await root(page).elementHandle();

  await page.getByRole('button', { name: 'Close container panel', exact: true })
    .evaluate(node => (node as HTMLElement).click());
  await expect(root(page)).toHaveJSProperty('open', true);
  await check(page, 'Alternate panel container', true);

  await expect(root(page)).toHaveJSProperty('open', false);
  await expect(page.locator('[aria-label="Panel draft"]')).toHaveCount(0);
  expect(await root(page).evaluate((node, old) => node === old, previousRoot)).toBe(false);
  await opener(page).click();
  await expect(draft(page)).toHaveValue('Seed');
  await frames(page);

  await expect(panel(page)).toBeVisible();
  await expect(root(page)).toHaveCount(1);
  await expect(page.getByLabel('Panel container closes', { exact: true })).toHaveText('0');
});
