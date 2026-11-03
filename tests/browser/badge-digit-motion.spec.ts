import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-badge-digit-motion-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-03T00:01:00Z'));
  await page.addInitScript(() => {
    const tracked = window as typeof window & { digitTimers: Set<number>; };
    const active = tracked.digitTimers = new Set<number>();
    const originalSet = window.setTimeout.bind(window);
    const originalClear = window.clearTimeout.bind(window);
    window.setTimeout = ((callback: TimerHandler, delay?: number, ...args: unknown[]) => {
      if (typeof callback !== 'function') return originalSet(callback, delay, ...args);

      const timer = originalSet(() => {
        active.delete(timer);
        Reflect.apply(callback, window, args);
      }, delay);
      if (delay === 1000) active.add(timer);
      return timer;
    }) as typeof window.setTimeout;
    window.clearTimeout = timer => {
      if (typeof timer === 'number') active.delete(timer);
      originalClear(timer);
    };
  });
  await page.goto('/?fixture=badge-digit-motion');
});

async function select(page: Page, name: string) {
  await page.getByLabel('Digit motion reference', { exact: true }).selectOption(name);
  await page.getByRole('button', { name: 'Digit owner', exact: true }).focus();
  await page.clock.runFor(32);
}

async function timers(page: Page) {
  return page.evaluate(() => (window as typeof window & { digitTimers: Set<number>; })
    .digitTimers.size);
}

async function snapshot(page: Page) {
  return page.locator('#digit-motion-surface').evaluate(surface => {
    const tracked = window as typeof window & {
      digitIds?: WeakMap<Element, number>;
      digitSerial?: number;
    };
    const ids = tracked.digitIds ??= new WeakMap<Element, number>();
    tracked.digitSerial ??= 0;
    const sup = surface.querySelector('sup');

    return {
      sup: Boolean(sup),
      text: sup?.textContent ?? null,
      title: sup?.getAttribute('title') ?? null,
      focused: document.activeElement === surface.querySelector('[aria-label="Digit owner"]'),
      digits: [...surface.querySelectorAll<HTMLElement>('.ant-scroll-number-only')].map(node => {
        if (!ids.has(node)) ids.set(node, ++tracked.digitSerial!);

        return {
          id: ids.get(node),
          transform: node.style.transform,
          transition: node.style.transition,
          height: getComputedStyle(node).height,
          units: [...node.children].map(unit => ({
            value: unit.textContent,
            top: (unit as HTMLElement).style.top,
            left: (unit as HTMLElement).style.left,
            position: (unit as HTMLElement).style.position,
            current: unit.classList.contains('current')
          }))
        };
      })
    };
  });
}

for (const sample of reference.cases) {
  test(`Badge digit frames match upstream for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    expect(await snapshot(page)).toEqual(sample.frames[0].snapshot);

    for (const frame of sample.frames.slice(1)) {
      await page.getByRole('button', { name: 'Next digit step', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());
      if (frame.step.kind === 'timer') {
        const delay = 'ms' in frame.step ? frame.step.ms : undefined;
        if (typeof delay !== 'number') throw new Error('Missing source timer delay');
        await page.clock.runFor(delay);
      }
      await page.clock.runFor(32);

      expect(await snapshot(page)).toEqual(frame.snapshot);
    }
    if (sample.name === 'unmount') expect(await timers(page)).toBe(0);
  });
}

test('Badge digit motion settles from a real transitionend before the fallback', async ({ page }) => {
  await select(page, 'up');
  await page.getByLabel('Enable digit motion', { exact: true }).evaluate(node => {
    (node as HTMLInputElement).checked = true;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.clock.resume();

  await page.getByRole('button', { name: 'Next digit step', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(page.getByLabel('Digit transition events', { exact: true })).toHaveText('1');
  await expect(page.locator('.ant-scroll-number-only-unit')).toHaveCount(1);
  await expect(page.locator('.ant-scroll-number-only')).toHaveCSS('transition', 'none');
  expect(await timers(page)).toBe(1);

  await page.getByRole('button', { name: 'Unmount digit badge', exact: true }).click();

  expect(await timers(page)).toBe(0);
});

test('Badge suppresses reduced motion and releases fallback timers on removal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await select(page, 'up');
  await page.getByLabel('Enable digit motion', { exact: true }).evaluate(node => {
    (node as HTMLInputElement).checked = true;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await page.getByRole('button', { name: 'Next digit step', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());
  await page.clock.runFor(32);

  await expect(page.locator('.ant-scroll-number-only')).toHaveCSS('transition-duration', '0s');
  expect(await timers(page)).toBe(1);

  await page.getByRole('button', { name: 'Unmount digit badge', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(page.locator('.ant-scroll-number-only')).toHaveCount(0);
  expect(await timers(page)).toBe(0);
});
