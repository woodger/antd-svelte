import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('.range-root');
const handles = (page: Page) => root(page).locator('input[type=range]');
const output = (page: Page, name: string) => page.getByLabel(`Range ${name}`, { exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
async function clear(page: Page) {
  await button(page, 'Clear range events').click();
}
async function point(page: Page, fraction: number) {
  const box = (await root(page).boundingBox())!;
  const vertical = await root(page)
    .evaluate(node => node.classList.contains('ant-slider-vertical'));
  return { x: box.x + box.width * (vertical ? .5 : fraction),
    y: box.y + box.height * (vertical ? fraction : .5) };
}
async function drag(page: Page, index: number, fraction: number, remove = 0) {
  const box = (await root(page).locator('.ant-slider-handle').nth(index).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const next = await point(page, fraction);
  await page.mouse.move(next.x, next.y + remove, { steps: 5 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=slider-range');
  await expect(handles(page)).toHaveCount(2);
  await expect(handles(page).first()).toHaveValue('20');
});

test('Slider range renders native controls, config and one successful field per handle', async ({ page }) => {
  await expect(root(page)).toHaveClass(/configured-range/);
  await expect(root(page).locator('.ant-slider-rail')).toHaveClass(/configured-range-rail/);
  await expect(handles(page).first()).toHaveAccessibleName('Range start');
  await expect(handles(page).nth(1)).toHaveAccessibleName('Range middle');
  await button(page, 'Read range form').click();

  await expect(output(page, 'data')).toHaveText('20,80');
  await expect(output(page, 'submissions')).toHaveText('0');
});

test('Slider range retains source callback order even for a boundary keyup', async ({ page }) => {
  await handles(page).first().focus();
  await handles(page).first().press('ArrowRight');

  await expect(output(page, 'value')).toHaveText('[25,80]');
  await expect(output(page, 'events'))
    .toHaveText('change:25,80|complete:25,80');
  await handles(page).first().press('Home');
  await clear(page);
  await handles(page).first().press('ArrowLeft');

  await expect(output(page, 'events')).toHaveText('complete:0,80');
});

test('Slider range updates a rail selection and completes only on release', async ({ page }) => {
  const next = await point(page, .5);
  await page.mouse.move(next.x, next.y);
  await page.mouse.down();

  await expect(output(page, 'value')).toHaveText('[20,50]');
  await expect(output(page, 'events')).toHaveText('change:20,50');
  await page.mouse.up();

  await expect(output(page, 'events'))
    .toHaveText('change:20,50|complete:20,50');
});

test('Slider range crosses while retaining drag identity and focuses the new sorted index', async ({ page }) => {
  await drag(page, 0, .9);

  await expect(output(page, 'value')).toHaveText('[80,90]');
  await expect(handles(page).first()).toHaveValue('90');
  await page.mouse.up();

  await expect(handles(page).nth(1)).toBeFocused();
  await expect(handles(page).first()).toHaveValue('80');
});

test('Slider range prevents crossing and pushes neighbors with a configured gap', async ({ page }) => {
  await page.getByLabel('Allow range cross', { exact: true }).uncheck();
  await drag(page, 0, .95);
  await page.mouse.up();

  await expect(output(page, 'value')).toHaveText('[80,80]');
  await button(page, 'Reset range owner').click();
  await page.getByLabel('Allow range cross', { exact: true }).check();
  await page.getByRole('spinbutton', { name: 'Range push gap', exact: true }).fill('10');
  await drag(page, 0, .9);
  await page.mouse.up();

  await expect(output(page, 'value')).toHaveText('[90,100]');
});

test('Slider range keeps disabled anchors fixed and excludes their native form values', async ({ page }) => {
  await button(page, 'Use three range points').click();
  await page.getByLabel('Disable range middle', { exact: true }).check();
  await page.getByRole('spinbutton', { name: 'Range push gap', exact: true }).fill('10');
  await drag(page, 0, .9);
  await page.mouse.up();

  await expect(output(page, 'value')).toHaveText('[40,50,80]');
  await expect(handles(page).nth(1)).toBeDisabled();
  await button(page, 'Read range form').click();
  await expect(output(page, 'data')).toHaveText('40,80');
});

test('Slider range drags the whole track without changing distances and clamps at the endpoint', async ({ page }) => {
  await page.getByLabel('Draggable range track', { exact: true }).check();
  const track = root(page).locator('.ant-slider-track');
  await track.hover();
  await page.mouse.down();
  const end = await point(page, 1);
  await page.mouse.move(end.x, end.y, { steps: 5 });
  await page.mouse.up();

  await expect(output(page, 'value')).toHaveText('[40,100]');
});

test('Slider range adds editable points and applies source deletion without an extra completion', async ({ page }) => {
  await page.getByLabel('Editable range', { exact: true }).check();
  const middle = await point(page, .5);
  await page.mouse.click(middle.x, middle.y);
  await expect(output(page, 'value')).toHaveText('[20,50,80]');
  await clear(page);
  await handles(page).nth(1).press('Delete');

  await expect(output(page, 'value')).toHaveText('[20,80]');
  await expect(output(page, 'events')).toHaveText('change:20,80');
  await handles(page).first().press('Delete');
  await expect(handles(page)).toHaveCount(2);
});

test('Slider range removes a dragged point after 130 pixels and restores its native focus', async ({ page }) => {
  await button(page, 'Use three range points').click();
  await page.getByLabel('Editable range', { exact: true }).check();
  await drag(page, 1, .5, 140);
  await expect(output(page, 'value')).toHaveText('[20,80]');
  await expect(root(page).locator('.ant-slider-handle-dragging-delete')).toHaveCount(1);
  await page.mouse.up();

  await expect(handles(page)).toHaveCount(2);
  await expect(root(page).locator('.ant-slider-handle-dragging-delete')).toHaveCount(0);
});

test('Slider range marks stay native buttons and complete without submitting their form', async ({ page }) => {
  await page.getByLabel('Range marks', { exact: true }).check();
  await page.getByLabel('Mark-only range', { exact: true }).check();
  await button(page, 'Warm').click();

  await expect(output(page, 'value')).toHaveText('[25,100]');
  await expect(output(page, 'events')).toContainText('complete:25,100');
  await expect(output(page, 'submissions')).toHaveText('0');
  await handles(page).first().press('ArrowRight');
  await expect(output(page, 'value')).toHaveText('[100,100]');
});

test('Slider range restores empty collections through the source two-handle rail action', async ({ page }) => {
  await button(page, 'Clear range points').click();
  const middle = await point(page, .5);
  await page.mouse.click(middle.x, middle.y);

  await expect(output(page, 'value')).toHaveText('[50,50]');
  await expect(handles(page)).toHaveCount(2);
});

test('Slider range keeps vertical and RTL keyboard directions and native refs', async ({ page }) => {
  await page.getByLabel('Right to left', { exact: true }).check();
  await handles(page).first().press('ArrowLeft');
  await expect(output(page, 'value')).toHaveText('[25,80]');
  await page.getByLabel('Vertical range', { exact: true }).check();
  await handles(page).first().press('ArrowUp');
  await expect(output(page, 'value')).toHaveText('[30,80]');
  await expect(handles(page).first()).toHaveAttribute('aria-orientation', 'vertical');
  await button(page, 'Focus range ref').click();
  await expect(handles(page).first()).toBeFocused();
  await button(page, 'Blur range ref').click();
  await expect(handles(page).first()).not.toBeFocused();
});

test('Slider range resets native defaults without change callbacks and releases an active gesture', async ({ page }) => {
  await handles(page).first().press('ArrowRight');
  await clear(page);
  await button(page, 'Reset range form').click();

  await expect(output(page, 'value')).toHaveText('[0,0]');
  await expect(output(page, 'events')).toHaveText('');
  await drag(page, 0, .4);
  await page.getByLabel('Mount range', { exact: true })
    .evaluate((input: HTMLInputElement) => input.click());
  await clear(page);
  await page.mouse.up();
  await expect(output(page, 'events')).toHaveText('');
});

test('Slider range shows pinned per-handle formatted tooltips and releases them on unmount', async ({ page }) => {
  await page.getByLabel('Range tooltips', { exact: true }).check();

  await expect(page.getByRole('tooltip')).toHaveCount(2);
  await expect(page.getByRole('tooltip')).toHaveText(['20%', '80%']);
  await page.getByLabel('Mount range', { exact: true }).uncheck();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('Slider range disables native keyboard changes and preserves source keyup completion', async ({ page }) => {
  await page.getByLabel('Range keyboard', { exact: true }).uncheck();
  await handles(page).first().press('ArrowRight');

  await expect(output(page, 'value')).toHaveText('[20,80]');
  await expect(output(page, 'events')).toHaveText('complete:20,80');
});

test('Slider range lets native handlers cancel a key or pointer start', async ({ page }) => {
  await page.getByLabel('Cancel range keys', { exact: true }).check();
  await handles(page).first().press('ArrowRight');
  await expect(output(page, 'value')).toHaveText('[20,80]');
  await clear(page);
  await page.getByLabel('Cancel range pointer', { exact: true }).check();
  await drag(page, 0, .5);
  await page.mouse.up();

  await expect(output(page, 'value')).toHaveText('[20,80]');
  await expect(output(page, 'events')).toHaveText('');
});

test('Slider range disables all controls through ConfigProvider and resumes independently', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(handles(page).first()).toBeDisabled();
  const middle = await point(page, .5);
  await page.mouse.click(middle.x, middle.y);
  await expect(output(page, 'events')).toHaveText('');
  await page.getByLabel('Disable all components', { exact: true }).uncheck();
  await handles(page).first().press('ArrowRight');

  await expect(output(page, 'value')).toHaveText('[25,80]');
});

test('Slider range stops adding at maxCount and disables editing around any fixed anchor', async ({ page }) => {
  await page.getByLabel('Editable range', { exact: true }).check();
  for (const fraction of [.35, .5, .65, .9]) {
    const next = await point(page, fraction);
    await page.mouse.click(next.x, next.y);
  }
  await expect(handles(page)).toHaveCount(5);
  await page.getByLabel('Disable range middle', { exact: true }).check();
  const next = await point(page, .95);
  await page.mouse.click(next.x, next.y);

  await expect(handles(page)).toHaveCount(5);
  await handles(page).first().press('Delete');
  await expect(handles(page)).toHaveCount(5);
});

test('Slider range moves focus with keyboard crossing and keeps all segment widths source aligned', async ({ page }) => {
  await button(page, 'Use three range points').click();
  await handles(page).first().press('End');

  await expect(output(page, 'value')).toHaveText('[50,80,100]');
  await expect(handles(page).nth(2)).toBeFocused();
  const widths = await root(page).locator('.ant-slider-track')
    .evaluateAll(nodes => nodes.map(node => (node as HTMLElement).style.width));
  expect(widths).toEqual(['30%', '20%']);
});

test('Slider range applies source compact geometry and dark tokens for all supported primaries', async ({ page }) => {
  await page.getByLabel('Compact range', { exact: true }).check();
  await expect(root(page).locator('.ant-slider-handle').first()).toHaveCSS('width', '8.75px');
  await page.getByLabel('Dark range', { exact: true }).check();
  for (const [primary, color] of [['blue', 'rgb(21, 50, 91)'],
    ['green', 'rgb(39, 73, 22)'], ['purple', 'rgb(48, 28, 77)']]) {
    await page.getByRole('combobox', { name: 'Range primary', exact: true }).selectOption(primary);
    await expect(root(page).locator('.ant-slider-track')).toHaveCSS('background-color', color);
  }
});

test.describe('mobile Slider range', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('uses real touch movement and releases capture after cancellation', async ({ page }) => {
    await handles(page).first().scrollIntoViewIfNeeded();
    const start = await point(page, .2);
    const end = await point(page, .6);
    const cdp = await page.context().newCDPSession(page);
    try {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [end] });
      await expect(output(page, 'value')).toHaveText('[60,80]');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
      await expect(output(page, 'events')).not.toContainText('complete:');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
    } finally {
      await cdp.detach();
    }
  });
});

test('Slider range accepts native assistive input/change without a gesture', async ({ page }) => {
  await handles(page).first().evaluate((input: HTMLInputElement) => {
    input.value = '35';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(output(page, 'value')).toHaveText('[35,80]');
  await expect(output(page, 'events'))
    .toHaveText('change:35,80|complete:35,80');
});

test('Slider range respects cancellation of native form reset', async ({ page }) => {
  await handles(page).first().press('ArrowRight');
  await page.locator('#range-form').evaluate(form => {
    form.addEventListener('reset', event => event.preventDefault(), { once: true });
  });
  await clear(page);
  await button(page, 'Reset range form').click();

  await expect(output(page, 'value')).toHaveText('[25,80]');
  await expect(output(page, 'events')).toHaveText('');
});

test('Slider range removes a focused control without reading its destroyed state', async ({ page }) => {
  await handles(page).first().press('ArrowRight');
  await page.getByLabel('Range marks', { exact: true }).evaluate((input: HTMLInputElement) => {
    input.click();
    const label = [...document.querySelectorAll('label')]
      .find(node => node.textContent?.trim() === 'Mount range')!;
    label.querySelector('input')!.click();
  });

  await expect(handles(page)).toHaveCount(0);
  await page.getByLabel('Mount range', { exact: true }).check();
  await expect(handles(page).first()).toHaveValue('25');
});

test('Slider range restores native defaults even when its current collection has no inputs', async ({ page }) => {
  await button(page, 'Clear range points').click();
  await expect(handles(page)).toHaveCount(0);
  await clear(page);
  await button(page, 'Reset range form').click();

  await expect(output(page, 'value')).toHaveText('[0,0]');
  await expect(handles(page)).toHaveCount(2);
  await expect(output(page, 'events')).toHaveText('');
});
