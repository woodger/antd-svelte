import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-more-runtime-reference.json' with { type: 'json' };
import type { TabsMoreRuntimeCase } from './fixtures/tabs-more-runtime-presets';

interface MotionFrame {
  classes: string[];
  duration: string;
  name: string;
}
interface RuntimeCapture {
  frames: MotionFrame[];
  observer: MutationObserver;
}

test.use({ hasTouch: true, viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tabs-more-runtime');
});

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const button = document.querySelector('.ant-tabs-nav-more')!;
    const popup = document.querySelector<HTMLElement>('.ant-tabs-dropdown');
    const content = popup?.querySelector('.runtime-overlay');
    const mounted = Boolean(popup?.children.length);
    const output = (name: string) => JSON.parse(
      document.querySelector(`[aria-label="Runtime More ${name}"]`)!.textContent!
    ) as string[];

    return {
      expanded: button.getAttribute('aria-expanded') === 'true',
      openClasses: Array.from(button.classList)
        .filter(name => name === 'ant-tabs-dropdown-open' || name === 'runtime-open'),
      mounted,
      visible: Boolean(popup?.getClientRects().length)
        && getComputedStyle(popup!).display !== 'none',
      options: Array.from(popup?.querySelectorAll('.ant-tabs-dropdown-menu-item') ?? [], node => ({
        label: node.textContent!.trim(),
        disabled: node.classList.contains('ant-tabs-dropdown-menu-item-disabled')
      })),
      raw: content ? {
        draft: content.querySelector('input')!.value,
        count: Number(content.querySelector('output')!.textContent)
      } : null,
      lifecycle: output('lifecycle'),
      events: output('events'),
      changes: output('changes')
    };
  });
}

async function stable(page: Page) {
  await page.evaluate(async () => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await expect.poll(() => page.locator('.ant-tabs-dropdown').evaluateAll(nodes =>
    nodes.every(node => !/-(?:appear|enter|leave)(?:-(?:prepare|start|active))?(?:\s|$)/
      .test(node.className)))).toBe(true);
}

async function observeMotion(page: Page) {
  await page.evaluate(() => {
    const state = Reflect.get(window, 'moreRuntimeCapture') as RuntimeCapture | undefined;
    state?.observer.disconnect();
    const capture: RuntimeCapture = {
      frames: [],
      observer: new MutationObserver(() => {
        const popup = document.querySelector('.ant-tabs-dropdown');
        if (!popup) return;
        const classes = Array.from(popup.classList)
          .filter(name => /-(?:appear|enter|leave)(?:-(?:prepare|start|active))?$/.test(name));
        if (!classes.length) return;
        const css = getComputedStyle(popup);
        const frame = { classes, duration: css.animationDuration, name: css.animationName };
        if (JSON.stringify(frame) !== JSON.stringify(capture.frames.at(-1)))
          capture.frames.push(frame);
      })
    };
    capture.observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    Reflect.set(window, 'moreRuntimeCapture', capture);
  });
}

async function frames(page: Page) {
  return page.evaluate(() => (Reflect.get(window, 'moreRuntimeCapture') as RuntimeCapture).frames);
}

async function open(page: Page, sample: TabsMoreRuntimeCase) {
  const button = page.locator('.ant-tabs-nav-more');
  switch (sample.scenario) {
    case 'focus-click':
      await page.getByLabel('Runtime More outside', { exact: true }).focus();
      await button.focus();
      break;
    case 'hover-click':
      await page.mouse.move(1100, 900);
      await button.hover();
      break;
    case 'keyboard':
    case 'undefined-keyboard':
    case 'raw-keyboard':
      await button.press('ArrowDown');
      break;
    case 'context':
    case 'context-toggle':
      await button.click({ button: 'right' });
      break;
    case 'touch':
      await button.tap();
      break;
    default:
      await button.click();
  }
}

async function close(page: Page, sample: TabsMoreRuntimeCase) {
  const button = page.locator('.ant-tabs-nav-more');
  switch (sample.scenario) {
    case 'focus-blur':
      await page.getByLabel('Raw More draft', { exact: true }).focus();
      break;
    case 'raw-keyboard':
      await button.press('ArrowDown');
      await button.press('Enter');
      break;
    case 'click-hover':
      await page.mouse.move(1100, 900);
      break;
    case 'keyboard':
    case 'undefined-keyboard':
      await button.press('Escape');
      break;
    case 'context-toggle':
      await button.click({ button: 'right' });
      break;
    case 'touch':
      await button.tap();
      break;
    case 'selection':
      await page.locator('.ant-tabs-dropdown-menu-option:not(:disabled)').last().click();
      break;
    default:
      await button.click();
  }
}

for (const sample of reference.cases) {
  test(`More lifecycle and actions match the official source for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('More runtime reference', { exact: true }).selectOption(sample.name);
    await page.mouse.move(1100, 900);
    await expect.poll(() => snapshot(page)).toEqual(sample.initial);
    await observeMotion(page);

    await open(page, sample as TabsMoreRuntimeCase);
    await stable(page);

    await expect.poll(() => snapshot(page)).toEqual(sample.opened);
    expect(await frames(page)).toEqual(sample.motion.appear);
    if ((sample.raw || sample.wrap) && sample.scenario !== 'focus-blur') {
      await page.getByLabel('Raw More draft', { exact: true }).fill('Retained draft');
      await page.getByRole('button', { name: 'Increment raw More', exact: true }).click();
    }
    await observeMotion(page);

    await close(page, sample as TabsMoreRuntimeCase);
    await stable(page);

    await expect.poll(() => snapshot(page)).toEqual(sample.closed);
    expect(await frames(page)).toEqual(sample.motion.leave);
    await observeMotion(page);

    await open(page, sample as TabsMoreRuntimeCase);
    await stable(page);

    await expect.poll(() => snapshot(page)).toEqual(sample.reopened);
    expect(await frames(page)).toEqual(sample.motion.enter);
  });
}

async function check(page: Page, label: string, checked: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((element, value) => {
    const input = element as HTMLInputElement;
    input.checked = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

async function choose(page: Page, name: string) {
  await page.getByLabel('More runtime reference', { exact: true }).selectOption(name);
  await page.mouse.move(1100, 900);
  await page.locator('.ant-tabs-nav-more').click();
  await stable(page);
}

test('autoDestroy keeps an inert popup until leave ends and recreates its content and current styles',
  async ({ page }) => {
    await choose(page, 'raw-destroyed');
    const popup = page.locator('.ant-tabs-dropdown');
    const draft = page.getByLabel('Raw More draft', { exact: true });
    const original = await draft.elementHandle();
    await draft.fill('Discarded draft');
    await page.getByRole('button', { name: 'Increment raw More', exact: true }).click();

    await page.locator('.ant-tabs-nav-more').click();
    await expect(popup).toHaveClass(/ant-slide-up-leave-active/);

    await expect(popup).toHaveAttribute('inert', '');
    await expect(popup).toHaveAttribute('aria-hidden', 'true');
    expect(await original!.evaluate(element => element.isConnected)).toBe(true);
    await expect(popup).toHaveCount(0);
    await expect(page.getByLabel('Runtime More lifecycle', { exact: true }))
      .toHaveText('["mount","destroy"]');
    await check(page, 'Style runtime popup', true);

    await page.locator('.ant-tabs-nav-more').click();
    await stable(page);

    await expect(draft).toHaveValue('Initial draft');
    await expect(popup.locator('[data-runtime-count]')).toHaveText('0');
    await expect(popup).toHaveCSS('padding-top', '13px');
    await expect(popup).toHaveCSS('color', 'rgb(70, 80, 90)');
    expect(await original!.evaluate(element => element.isConnected)).toBe(false);
  });

test('reversing leave preserves the same popup, draft, selection and local state', async ({ page }) => {
  await choose(page, 'raw-destroyed');
  const popup = page.locator('.ant-tabs-dropdown');
  const draft = page.getByLabel('Raw More draft', { exact: true });
  const original = await draft.elementHandle();
  await draft.fill('Retained during reversal');
  await draft.evaluate(input => (input as HTMLInputElement).setSelectionRange(2, 8));
  await page.getByRole('button', { name: 'Increment raw More', exact: true }).click();

  await page.locator('.ant-tabs-nav-more').click();
  await expect(popup).toHaveClass(/ant-slide-up-leave-active/);
  await popup.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));
  await page.locator('.ant-tabs-nav-more').click();
  await stable(page);

  expect(await draft.evaluate((node, previous) => node === previous, original)).toBe(true);
  await expect(draft).toHaveValue('Retained during reversal');
  expect(await draft.evaluate(input => [
    (input as HTMLInputElement).selectionStart,
    (input as HTMLInputElement).selectionEnd
  ])).toEqual([2, 8]);
  await expect(popup.locator('[data-runtime-count]')).toHaveText('1');
  await expect(page.getByLabel('Runtime More lifecycle', { exact: true })).toHaveText('["mount"]');
  await expect(popup).not.toHaveAttribute('inert');
});

for (const mode of ['reduced motion', 'theme motion'] as const) {
  test(`${mode} finishes an active leave and destroys its content`, async ({ page }) => {
    await choose(page, 'raw-destroyed');
    await page.locator('.ant-tabs-nav-more').click();
    const popup = page.locator('.ant-tabs-dropdown');
    await expect(popup).toHaveClass(/ant-slide-up-leave-active/);
    await popup.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));

    if (mode === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await check(page, 'Runtime motion', false);

    await expect(popup).toHaveCount(0);
    await expect(page.getByLabel('Runtime More lifecycle', { exact: true }))
      .toHaveText('["mount","destroy"]');
  });
}

test('enabling autoDestroy on an already closed popup removes retained content', async ({ page }) => {
  await choose(page, 'raw-retained');
  const draft = page.getByLabel('Raw More draft', { exact: true });
  await draft.fill('Retained until policy changes');
  await page.locator('.ant-tabs-nav-more').click();
  await stable(page);
  await expect(draft).toHaveCount(1);

  await check(page, 'Destroy runtime popup', true);

  await expect(draft).toHaveCount(0);
  await expect(page.locator('.ant-tabs-dropdown')).toHaveCount(0);
  await expect(page.getByLabel('Runtime More lifecycle', { exact: true }))
    .toHaveText('["mount","destroy"]');
});

test('closing a raw overlay hides a nested Select and leaves Escape available during leave',
  async ({ page }) => {
    await check(page, 'Nested runtime Select', true);
    await choose(page, 'raw-destroyed');
    const select = page.getByRole('combobox', { name: 'Nested raw More select', exact: true });
    await select.click();
    await expect(page.getByRole('option', { name: 'Alpha', exact: true })).toBeVisible();

    await page.locator('.ant-tabs-nav-more').evaluate(button => (button as HTMLButtonElement).click());
    const popup = page.locator('.ant-tabs-dropdown');
    await expect(popup).toHaveClass(/ant-slide-up-leave-active/);
    await popup.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));

    await expect(page.getByRole('option', { name: 'Alpha', exact: true })).toBeHidden();
    const consumed = await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      document.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(consumed).toBe(false);
    await check(page, 'Mount runtime Tabs', false);
    await expect(page.locator('.ant-tabs-dropdown')).toHaveCount(0);
    await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0);
  });

test('unmount during leave removes portal DOM and cancels delayed lifecycle work', async ({ page }) => {
  await choose(page, 'raw-destroyed');
  await page.locator('.ant-tabs-nav-more').click();
  const popup = page.locator('.ant-tabs-dropdown');
  await expect(popup).toHaveClass(/ant-slide-up-leave-active/);
  await popup.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));
  await page.clock.install();

  await check(page, 'Mount runtime Tabs', false);
  await page.clock.runFor(1000);

  await expect(popup).toHaveCount(0);
  await expect(page.getByLabel('Runtime More lifecycle', { exact: true }))
    .toHaveText('["mount","destroy"]');
  await expect(page.getByLabel('Runtime More events', { exact: true })).toHaveText('[]');
});

for (const sizing of ['border-box', 'content-box']) {
  test(`slide alignment stays stable near the viewport edge with ${sizing}`, async ({ page }) => {
    await choose(page, 'raw-retained');
    const popup = page.locator('.ant-tabs-dropdown');
    const button = page.locator('.ant-tabs-nav-more');
    await popup.evaluate((node, boxSizing) => {
      const style = (node as HTMLElement).style;
      style.boxSizing = boxSizing;
      style.padding = '9px';
      style.border = '3px solid black';
    }, sizing);
    const height = await popup.evaluate(node => node.getBoundingClientRect().height);
    await button.click();
    await stable(page);
    await button.evaluate((node, popupHeight) => {
      const stage = document.querySelector<HTMLElement>('.stage')!;
      const desiredBottom = innerHeight - popupHeight * .9 - 4;
      const offset = desiredBottom - node.getBoundingClientRect().bottom;
      stage.style.marginTop = `${parseFloat(getComputedStyle(stage).marginTop) + offset}px`;
    }, height);

    await button.click();
    await expect(popup).toHaveClass(/ant-slide-up-enter-active/);
    const positions = await popup.evaluate(async node => {
      const animation = node.getAnimations()[0];
      animation.pause();
      const positions = [];
      for (const progress of [0, 80, 160]) {
        animation.currentTime = progress;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        positions.push({
          top: (node as HTMLElement).style.top,
          placement: Array.from(node.classList)
            .find(name => name.startsWith('ant-tabs-dropdown-placement-'))
        });
      }
      animation.play();
      return positions;
    });
    await stable(page);

    expect(positions.every(position => position.top === positions[0].top)).toBe(true);
    expect(positions.map(position => position.placement))
      .toEqual(Array(3).fill('ant-tabs-dropdown-placement-topLeft'));
    const bounds = await popup.boundingBox();
    const anchor = await button.boundingBox();
    expect(Math.abs(bounds!.height - height)).toBeLessThan(1);
    expect(Math.abs(bounds!.y + bounds!.height + 4 - anchor!.y)).toBeLessThan(1);
  });
}

test('focus hide and autoFocus close custom content without reopening from native focus restoration',
  async ({ page }) => {
    await page.getByLabel('More runtime reference', { exact: true }).selectOption('raw-focus-blur');
    await check(page, 'Autofocus runtime popup', true);
    const button = page.locator('.ant-tabs-nav-more');
    await expect(button).toBeVisible();

    await button.focus();
    await expect(page.getByLabel('Runtime More lifecycle', { exact: true })).toHaveText('["mount"]');
    await stable(page);

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByLabel('Raw More draft', { exact: true })).toBeHidden();
    await page.getByLabel('Runtime More outside', { exact: true }).focus();
    await button.focus();
    await stable(page);

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByLabel('Runtime More lifecycle', { exact: true })).toHaveText('["mount"]');
  });
