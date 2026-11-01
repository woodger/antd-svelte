import type { Page } from '@playwright/test';
import { test, expect } from './test';

const calendar = (page: Page) => page.locator('.fixture-calendar');
const header = (page: Page) => calendar(page).locator('.ant-picker-calendar-header');

async function expectHeaderToFit(page: Page, mobile: boolean) {
  await header(page).evaluate(async element => {
    await Promise.all(element.getAnimations({ subtree: true }).map(animation =>
      animation.finished.catch(() => {})
    ));
  });

  const layout = await header(page).evaluate(element => {
    const owner = element.closest('.ant-picker-calendar')!.getBoundingClientRect();
    const selectors = {
      year: '.ant-picker-calendar-year-select',
      month: '.ant-picker-calendar-month-select',
      mode: '.ant-picker-calendar-mode-switch'
    };
    const controls = Object.fromEntries(Object.entries(selectors).flatMap(([name, selector]) => {
      const node = element.querySelector(selector);
      if (!node) return [];

      const rect = node.getBoundingClientRect();
      return [[name, { x: rect.x, y: rect.y, width: rect.width, bottom: rect.bottom }]];
    }));
    const rectangles = [...element.querySelectorAll(
      '.ant-picker-calendar-year-select, .ant-picker-calendar-month-select, .ant-select, ' +
      '.ant-picker-calendar-mode-switch, .ant-picker-calendar-mode-switch > label'
    )].map(node => node.getBoundingClientRect());

    return {
      controls,
      overflow: Math.max(...rectangles.map(rect =>
        Math.max(owner.left - rect.left, rect.right - owner.right)
      )),
      buttonRows: [...element.querySelectorAll('.ant-picker-calendar-mode-switch > label')]
        .map(node => node.getBoundingClientRect().y)
    };
  });

  expect(layout.overflow).toBeLessThanOrEqual(.5);
  expect(Math.abs(layout.buttonRows[0] - layout.buttonRows[1])).toBeLessThanOrEqual(.5);
  if (layout.controls.month) {
    expect(Math.abs(layout.controls.year.y - layout.controls.month.y)).toBeLessThanOrEqual(.5);
  }
  if (mobile) {
    expect(layout.controls.mode.y).toBeGreaterThanOrEqual(layout.controls.year.bottom);
  } else {
    expect(Math.abs(layout.controls.mode.y - layout.controls.year.y)).toBeLessThanOrEqual(.5);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=calendar');
  await page.getByLabel('Fullscreen Calendar', { exact: true }).uncheck();
});

for (const width of [300, 360]) {
  for (const viewport of [1280, 390, 320]) {
    for (const compactRTL of [false, true]) {
      test(`Calendar header fits ${width}px at viewport ${viewport}, compact RTL ${compactRTL}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport, height: 900 });
        await calendar(page).locator('..').evaluate((element, width) => {
          (element as HTMLElement).style.width = `${width}px`;
        }, width);
        if (compactRTL) {
          await page.getByLabel('Dark Calendar', { exact: true }).check();
          await page.getByLabel('Compact Calendar', { exact: true }).check();
          await page.getByLabel('Right to left', { exact: true }).check();
        }

        await expectHeaderToFit(page, viewport <= 480);

        if (viewport > 480) {
          await expect(header(page).locator('.ant-picker-calendar-year-select')).toHaveCSS('width', '80px');
          await expect(header(page).locator('.ant-picker-calendar-month-select')).toHaveCSS('width', '70px');
        }
        await header(page).locator('.ant-picker-calendar-mode-switch > label').nth(1).click();

        await expect(calendar(page).locator('.ant-picker-month-panel')).toBeVisible();
        await expect(header(page).locator('.ant-picker-calendar-month-select')).toHaveCount(0);
        await expectHeaderToFit(page, viewport <= 480);

        await header(page).locator('.ant-picker-calendar-mode-switch > label').first().click();

        await expect(calendar(page).locator('.ant-picker-date-panel')).toBeVisible();
        await expectHeaderToFit(page, viewport <= 480);
      });
    }
  }
}

for (const viewport of [1280, 390]) {
  test(`Calendar keeps keyboard selection, dropdowns and English layout at viewport ${viewport}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.getByLabel('English locale', { exact: true }).check();
    const year = header(page).locator('.ant-picker-calendar-year-select').getByRole('combobox');
    const month = header(page).locator('.ant-picker-calendar-month-select').getByRole('combobox');

    await year.focus();
    await page.keyboard.press('ArrowDown');
    await expect(calendar(page).getByRole('listbox')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(year).toHaveValue('2025');
    await expect(year).toBeFocused();
    await expect(calendar(page).getByRole('listbox')).toHaveCount(0);
    await month.click();
    await calendar(page).getByRole('option', { name: 'Oct', exact: true }).click();

    await expect(month).toHaveValue('Oct');
    await expect(calendar(page).getByRole('grid')).toHaveAttribute('aria-label', '2025-10');
    await expectHeaderToFit(page, viewport <= 480);
    await page.getByLabel('Fullscreen Calendar', { exact: true }).check();

    await expect(calendar(page)).toHaveClass(/ant-picker-calendar-full/);
    await expect(calendar(page).getByRole('grid')).toHaveAttribute('aria-label', '2025-10');
    await expectHeaderToFit(page, viewport <= 480);
  });
}
