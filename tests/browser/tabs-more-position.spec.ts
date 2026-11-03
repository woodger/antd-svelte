import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-more-position-reference.json' with { type: 'json' };
import type { TabsMorePositionCase } from './fixtures/tabs-more-position-presets';

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tabs-more-position');
});

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const anchor = document.querySelector('.ant-tabs-nav-more')!.getBoundingClientRect();
    const popup = document.querySelector<HTMLElement>('.ant-tabs-dropdown')!;
    const rect = popup.getBoundingClientRect();
    const css = getComputedStyle(popup);
    const arrow = popup.querySelector('.ant-tabs-dropdown-arrow');
    const arrowRect = arrow?.getBoundingClientRect();
    const round = (value: number) => Math.round(value * 100) / 100;
    const value = document.querySelector('[aria-label="Position aligned"]')!.textContent!;
    const owner = document.querySelector('[aria-label="Position callback node"]')!.textContent;

    return {
      delta: {
        left: round(rect.left - anchor.left),
        top: round(rect.top - anchor.top),
        width: round(rect.width),
        height: round(rect.height)
      },
      placement: Array.from(popup.classList)
        .find(name => name.startsWith('ant-tabs-dropdown-placement-'))
        ?.replace('ant-tabs-dropdown-placement-', '') ?? null,
      arrow: arrow ? {
        first: popup.firstElementChild === arrow,
        width: round(arrowRect!.width),
        height: round(arrowRect!.height),
        show: popup.classList.contains('ant-tabs-dropdown-show-arrow')
      } : null,
      right: popup.style.left === 'auto' && popup.style.right !== 'auto',
      bottom: popup.style.top === 'auto' && popup.style.bottom !== 'auto',
      matchedWidth: Math.abs(rect.width - anchor.width) < .5,
      arrowX: round(parseFloat(css.getPropertyValue('--arrow-x'))),
      arrowY: round(parseFloat(css.getPropertyValue('--arrow-y'))),
      focus: document.activeElement?.hasAttribute('data-position-content') ?? false,
      callback: value === 'null' ? null : {
        node: owner === popup.dataset.tabsPopupOwner,
        connected: popup.isConnected,
        tag: popup.tagName,
        align: JSON.parse(value)
      }
    };
  });
}

async function open(page: Page, sample: TabsMorePositionCase) {
  await page.locator('.ant-tabs-nav-more').evaluate((element, sample) => {
    const box = element.getBoundingClientRect();
    const options = {
      bubbles: true,
      cancelable: true,
      clientX: box.left + 11,
      clientY: box.top + 7
    };
    if (sample.open === 'keyboard') element.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true
    }));
    else if (sample.open === 'hover') element.dispatchEvent(new PointerEvent('pointerenter', {
      ...options,
      pointerType: 'mouse'
    }));
    else element.dispatchEvent(new MouseEvent(
      sample.open === 'context' ? 'contextmenu' : 'click',
      options
    ));
  }, sample);
}

async function check(page: Page, label: string, checked: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((element, value) => {
    const input = element as HTMLInputElement;
    input.checked = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

for (const sample of reference.cases) {
  test(`More geometry and arrow match the official source for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('More position reference', { exact: true }).selectOption(sample.name);
    await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
    await open(page, sample as TabsMorePositionCase);
    if (sample.snapshot.callback) {
      await expect(page.locator('.ant-tabs-dropdown')).toBeVisible();
      await expect(page.getByLabel('Position aligned', { exact: true })).not.toHaveText('null');
    } else {
      await expect(page.locator('.ant-tabs-dropdown')).toBeHidden();
      await page.evaluate(async () => {
        for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
      });
      await expect(page.getByLabel('Position aligned', { exact: true })).toHaveText('null');
    }

    const { delta: _delta, arrowX: _x, arrowY: _y, ...expected } = sample.snapshot;
    await expect.poll(async () => {
      const { delta: _delta, arrowX: _x, arrowY: _y, ...actual } = await snapshot(page);
      return actual;
    }).toEqual(expected);
    const actual = await snapshot(page);
    for (const key of ['left', 'top', 'width', 'height'] as const)
      expect(Math.abs(actual.delta[key] - sample.snapshot.delta[key]), key).toBeLessThan(1);
    expect(Math.abs(actual.arrowX - sample.snapshot.arrowX), 'arrow-x').toBeLessThan(1);
    expect(Math.abs(actual.arrowY - sample.snapshot.arrowY), 'arrow-y').toBeLessThan(1);
    await expect(page.getByLabel('Position empty callback', { exact: true })).toHaveText('false');
  });
}

for (const name of ['dynamic-right-bottom', 'portal-clipping']) {
  test(`live ${name} alignment preserves content state, focus, draft and selection`,
    async ({ page }) => {
      await page.getByLabel('More position reference', { exact: true }).selectOption(name);
      await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
      await page.getByLabel('More position reference', { exact: true }).focus();
      await open(page, { name });
      const draft = page.getByLabel('Position draft', { exact: true });
      await draft.fill('Retained position draft');
      await page.getByRole('button', { name: 'Count position', exact: true }).click();
      await draft.focus();
      await draft.evaluate(input => (input as HTMLInputElement).setSelectionRange(2, 8));
      const original = await draft.elementHandle();

      await check(page, 'Widen position content', true);
      await check(page, 'Update More alignment', true);

      await expect(page.locator('.ant-tabs-dropdown')).toHaveCSS('width', '220px');
      await expect.poll(async () => JSON.parse(
        await page.getByLabel('Position aligned', { exact: true }).textContent() ?? 'null'
      )).toMatchObject({ offset: [11, 17], dynamicInset: true });
      await expect(draft).toHaveValue('Retained position draft');
      await expect(draft).toBeFocused();
      expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
      expect(await draft.evaluate(input => [
        (input as HTMLInputElement).selectionStart, (input as HTMLInputElement).selectionEnd
      ])).toEqual([2, 8]);
      await expect(page.locator('[data-position-count]')).toHaveText('1');
      await expect(page.getByLabel('Position lifecycle', { exact: true })).toHaveText('["mount"]');
    });
}

for (const event of ['scroll', 'resize']) {
  test(`alignPoint click closes on window ${event}`, async ({ page }) => {
    await page.getByLabel('More position reference', { exact: true }).selectOption('point-click');
    await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
    await open(page, { name: 'point-click' });
    await expect(page.locator('.ant-tabs-dropdown')).toBeVisible();

    await page.evaluate(type => window.dispatchEvent(new Event(type)), event);

    await expect(page.locator('.ant-tabs-dropdown')).toBeHidden();
    await expect(page.locator('.ant-tabs-nav-more')).toHaveAttribute('aria-expanded', 'false');
  });
}

test('alignPoint hover remains open on scrolling and callbacks stop after unmount', async ({ page }) => {
  await page.getByLabel('More position reference', { exact: true }).selectOption('point-hover');
  await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
  await open(page, { name: 'point-hover', open: 'hover' });
  await expect(page.locator('.ant-tabs-dropdown')).toBeVisible();
  const count = Number(await page.getByLabel('Position callback count', { exact: true }).textContent());

  await page.evaluate(() => window.scrollTo(0, 100));

  await expect.poll(async () => Number(
    await page.getByLabel('Position callback count', { exact: true }).textContent()
  )).toBeGreaterThan(count);
  await expect(page.locator('.ant-tabs-dropdown')).toBeVisible();
  await page.clock.install();
  await check(page, 'Mount position Tabs', false);
  const stopped = await page.getByLabel('Position callback count', { exact: true }).textContent();
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.clock.runFor(1000);

  await expect(page.locator('.ant-tabs-dropdown')).toHaveCount(0);
  await expect(page.getByLabel('Position callback count', { exact: true })).toHaveText(stopped!);
  await expect(page.getByLabel('Position lifecycle', { exact: true })).toHaveText('["mount","destroy"]');
});

test('accepts callback alignment as controlled input without a callback loop', async ({ page }) => {
  await check(page, 'Sync More alignment', true);
  await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
  await open(page, { name: 'bottom-left' });
  await expect(page.locator('.ant-tabs-dropdown')).toBeVisible();
  await expect(page.getByLabel('Position aligned', { exact: true })).not.toHaveText('null');
  await page.evaluate(async () => {
    for (let frame = 0; frame < 5; frame++) await new Promise(requestAnimationFrame);
  });
  const count = await page.getByLabel('Position callback count', { exact: true }).textContent();
  await page.evaluate(async () => {
    for (let frame = 0; frame < 5; frame++) await new Promise(requestAnimationFrame);
  });

  await expect(page.getByLabel('Position callback count', { exact: true })).toHaveText(count!);
  await expect(page.getByLabel('Position lifecycle', { exact: true })).toHaveText('["mount"]');
});

test('point hover retains its position after the anchor moves outside the viewport', async ({ page }) => {
  await page.getByLabel('More position reference', { exact: true }).selectOption('point-hover');
  await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
  await open(page, { name: 'point-hover', open: 'hover' });
  const popup = page.locator('.ant-tabs-dropdown');
  await expect(popup).toBeVisible();
  const original = await popup.boundingBox();

  await page.locator('.position-stage').evaluate(async node => {
    (node as HTMLElement).style.top = '-100px';
    for (let frame = 0; frame < 4; frame++) await new Promise(requestAnimationFrame);
  });

  const source = reference.cases.find(sample => sample.name === 'point-hover')!;
  expect(source.offscreenVisible).toBe(true);
  await expect(popup).toBeVisible();
  expect(await popup.boundingBox()).toEqual(original);
});

test('equal-width flip updates CSS insets even when its physical coordinates stay the same',
  async ({ page }) => {
    await page.getByLabel('More position reference', { exact: true })
      .selectOption('equal-width-dynamic-flip');
    await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
    await open(page, { name: 'equal-width-dynamic-flip' });
    await expect(page.locator('.ant-tabs-dropdown')).toBeVisible();
    const original = await page.locator('.ant-tabs-dropdown').boundingBox();

    await page.setViewportSize({ width: 700, height: 1000 });

    const source = reference.cases.find(sample => sample.name === 'equal-width-dynamic-flip')!;
    await expect.poll(async () => {
      const { delta: _delta, arrowX: _x, arrowY: _y, ...actual } = await snapshot(page);
      return actual;
    }).toEqual((({ delta: _d, arrowX: _x, arrowY: _y, ...value }) => value)(source.resized!));
    expect(await page.locator('.ant-tabs-dropdown').boundingBox()).toEqual(original);
  });

test('alignment updates keep input focus after the initial custom-overlay autoFocus',
  async ({ page }) => {
    await page.getByLabel('More position reference', { exact: true }).selectOption('arrow-autofocus');
    await expect(page.locator('.ant-tabs-nav-more')).toBeVisible();
    await page.getByLabel('More position reference', { exact: true }).focus();
    await open(page, { name: 'arrow-autofocus' });
    await expect(page.getByRole('group', { name: 'Position overlay', exact: true })).toBeFocused();
    const draft = page.getByLabel('Position draft', { exact: true });
    await draft.fill('Retained after autoFocus');
    await draft.evaluate(input => (input as HTMLInputElement).setSelectionRange(2, 8));

    await check(page, 'Update More alignment', true);
    await expect.poll(async () => JSON.parse(
      await page.getByLabel('Position aligned', { exact: true }).textContent() ?? 'null'
    )).toMatchObject({ offset: [11, 17] });
    await page.evaluate(async () => {
      for (let frame = 0; frame < 6; frame++) await new Promise(requestAnimationFrame);
    });

    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Retained after autoFocus');
    expect(await draft.evaluate(input => [
      (input as HTMLInputElement).selectionStart, (input as HTMLInputElement).selectionEnd
    ])).toEqual([2, 8]);
  });
