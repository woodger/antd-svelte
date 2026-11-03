import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-badge-count-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=badge-count'); });

async function frames(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let index = 0; index < 5; index++) await new Promise(requestAnimationFrame);
  });
}

async function check(page: Page, name: string, checked: boolean) {
  await page.getByLabel(name, { exact: true }).evaluate((node, checked) => {
    (node as HTMLInputElement).checked = checked;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

async function select(page: Page, name: string) {
  await page.getByLabel('Badge count reference', { exact: true }).selectOption(name);
  await expect(page.locator('#badge-count-surface .ant-badge')).toBeAttached();
  await frames(page);
}

async function snapshot(page: Page) {
  return page.locator('#badge-count-surface .ant-badge').evaluate(root => {
    const custom = root.querySelector('.ant-scroll-number-custom-component');
    const indicator = custom ?? root.querySelector('sup, .ant-badge-status-dot');
    const status = root.querySelector('.ant-badge-status-text');
    const base = root.getBoundingClientRect();
    const rect = indicator?.getBoundingClientRect();
    const style = indicator ? getComputedStyle(indicator) : null;
    const round = (value: number) => Math.round(value * 1000) / 1000;

    return {
      wrapped: !root.classList.contains('ant-badge-not-a-wrapper'),
      hasStatus: root.classList.contains('ant-badge-status'),
      root: { width: round(base.width), height: round(base.height) },
      indicator: indicator && rect && style ? {
        custom: Boolean(custom),
        text: indicator.textContent,
        title: indicator.getAttribute('title'),
        dot: indicator.classList.contains('ant-badge-dot'),
        multiple: indicator.classList.contains('ant-badge-multiple-words'),
        x: round(rect.x - base.x),
        y: round(rect.y - base.y),
        width: round(rect.width),
        height: round(rect.height),
        font: style.fontSize,
        color: style.color,
        background: style.backgroundColor,
        position: style.position,
        display: style.display,
        transform: style.transform
      } : null,
      statusText: status?.textContent ?? null
    };
  });
}

for (const sample of reference.cases) {
  test(`Badge count matches source rendering for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
  });

  if ('refresh' in sample) {
    test('Badge retains the custom count root and its owner state', async ({ page }) => {
      await select(page, sample.name);
      const input = page.getByRole('textbox', { name: 'Custom count draft', exact: true });
      await input.fill('Owned draft');
      await input.evaluate(node => {
        (node as HTMLInputElement).setSelectionRange(1, 5);
        node.parentElement!.querySelector<HTMLButtonElement>('button')!.click();
      });
      const previous = await input.elementHandle();

      await check(page, 'Change Badge count props', true);
      await frames(page);

      expect(await input.evaluate((node, previous) => ({
        sameInput: node === previous,
        value: (node as HTMLInputElement).value,
        focused: node === document.activeElement,
        selection: [
          (node as HTMLInputElement).selectionStart,
          (node as HTMLInputElement).selectionEnd
        ],
        count: node.parentElement!.querySelector('button')!.textContent
      }), previous)).toEqual(sample.refresh);
      await expect.poll(() => snapshot(page)).toEqual(sample.changed);
    });
  }
}

test('Badge preserves its numeric child context and describes the full string value', async ({ page }) => {
  await select(page, 'string-2');
  const target = page.getByRole('button', { name: 'Badge count target', exact: true });
  const previous = await target.elementHandle();

  await expect(target).toHaveAttribute('data-count', 'undefined');
  await expect(target).toHaveAccessibleDescription('Количество: 100');
  await expect(page.locator('.ant-badge-indicator')).toHaveText('99+');
  await target.focus();

  await check(page, 'Change Badge count props', true);

  await expect(target).toBeFocused();
  expect(await target.evaluate((node, previous) => node === previous, previous)).toBe(true);
  await expect(target).toHaveAccessibleDescription('Количество: fresh');
});

test('Badge leaves custom controls accessible and removes stale descriptions across modes', async ({ page }) => {
  await select(page, 'custom-state');
  const input = page.getByRole('textbox', { name: 'Custom count draft', exact: true });
  const target = page.getByRole('button', { name: 'Badge count target', exact: true });
  await input.fill('Owned count');
  await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 4));

  await check(page, 'Dark Badge count theme', true);

  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Owned count');
  await expect(target).not.toHaveAttribute('aria-describedby');
  await expect(page.locator('[data-count-root]')).not.toHaveAttribute('aria-hidden', 'true');

  await page.getByLabel('Badge count mode', { exact: true }).selectOption('string');

  await expect(input).toHaveCount(0);
  await expect(target).toHaveAccessibleDescription('Количество: new');

  await page.getByLabel('Badge count mode', { exact: true }).selectOption('none');

  await expect(target).not.toHaveAttribute('aria-describedby');
  await expect(page.locator('.ant-badge-description')).toHaveCount(0);

  await page.getByLabel('Badge count mode', { exact: true }).selectOption('case');

  await expect(input).toHaveValue('Seed');
  await expect(target).not.toHaveAttribute('aria-describedby');
});
