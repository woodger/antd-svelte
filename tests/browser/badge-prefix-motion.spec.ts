import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-badge-prefix-motion-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-03T00:01:00Z'));
  await page.addInitScript(() => {
    const tracked = window as typeof window & {
      zoomTimers: Set<number>;
      zoomFrames: Set<number>;
    };
    const timers = tracked.zoomTimers = new Set<number>();
    const frames = tracked.zoomFrames = new Set<number>();
    const set = window.setTimeout.bind(window);
    const clear = window.clearTimeout.bind(window);
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    window.setTimeout = ((callback: TimerHandler, delay?: number, ...args: unknown[]) => {
      if (typeof callback !== 'function') return set(callback, delay, ...args);

      const timer = set(() => {
        timers.delete(timer);
        Reflect.apply(callback, window, args);
      }, delay);
      if (delay === 1000) timers.add(timer);
      return timer;
    }) as typeof window.setTimeout;
    window.clearTimeout = timer => {
      if (typeof timer === 'number') timers.delete(timer);
      clear(timer);
    };
    window.requestAnimationFrame = callback => {
      const frame = request(time => {
        frames.delete(frame);
        callback(time);
      });
      frames.add(frame);
      return frame;
    };
    window.cancelAnimationFrame = frame => {
      frames.delete(frame);
      cancel(frame);
    };
  });
  await page.goto('/?fixture=badge-prefix-motion');
});

async function resources(page: Page) {
  return page.evaluate(() => {
    const tracked = window as typeof window & {
      zoomTimers: Set<number>;
      zoomFrames: Set<number>;
    };

    return { timers: tracked.zoomTimers.size, frames: tracked.zoomFrames.size };
  });
}

async function select(page: Page, name: string) {
  await page.getByLabel('Badge zoom reference', { exact: true }).selectOption(name);
  const owner = page.getByRole('button', { name: 'Zoom owner', exact: true });
  if (await owner.count()) await owner.focus();
  await page.clock.runFor(64);
}

async function next(page: Page) {
  await page.getByRole('button', { name: 'Next zoom step', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());
}

async function snapshot(page: Page) {
  return page.locator('#badge-zoom-surface').evaluate(surface => {
    const tracked = window as typeof window & {
      zoomIds?: WeakMap<Element, number>;
      zoomSerial?: number;
    };
    const ids = tracked.zoomIds ??= new WeakMap<Element, number>();
    tracked.zoomSerial ??= 0;
    const node = surface.querySelector('sup, [data-custom-zoom], [data-ant-badge-visual]');
    const prefix = surface.getAttribute('data-badge-zoom-prefix') || 'ant-badge';
    if (node && !ids.has(node)) ids.set(node, ++tracked.zoomSerial!);

    return {
      kind: node ? node.tagName === 'SUP' ? 'number'
        : node.hasAttribute('data-custom-zoom') ? 'custom' : 'status' : null,
      id: node ? ids.get(node) : null,
      text: node?.textContent ?? null,
      title: node?.getAttribute('title') ?? null,
      show: node?.getAttribute('data-show') ?? null,
      dot: node?.classList.contains('ant-badge-dot') ?? false,
      multiple: node?.classList.contains('ant-badge-multiple-words') ?? false,
      motion: node ? [...node.classList].filter(name => name.startsWith(`${prefix}-zoom`)).sort() : [],
      animation: node ? getComputedStyle(node).animationName : null,
      focused: document.activeElement === surface.querySelector('[aria-label="Zoom owner"]')
    };
  });
}

for (const sample of reference.cases) {
  test(`Badge prefix zoom frames match upstream for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    expect(await snapshot(page)).toEqual(sample.frames[0].snapshot);

    for (const frame of sample.frames.slice(1)) {
      await next(page);
      if (frame.step.kind === 'wait') {
        const delay = 'ms' in frame.step ? frame.step.ms : undefined;
        if (typeof delay !== 'number') throw new Error('Missing source RAF/deadline delay');
        await page.clock.runFor(delay);
      }

      expect(await snapshot(page)).toEqual(frame.snapshot);
    }
  });
}

test('Badge releases its prefix stylesheet and active motion resources on removal', async ({ page }) => {
  await select(page, 'prefix-leave');
  await page.clock.runFor(1100);
  await next(page);
  await next(page);
  await page.clock.runFor(64);

  expect(await resources(page)).toEqual({ timers: 1, frames: 0 });
  await expect(page.locator('head [data-ant-svelte-theme^="badge-prefix:"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Remove prefix motion badge', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  expect(await resources(page)).toEqual({ timers: 0, frames: 0 });
  await expect(page.locator('head [data-ant-svelte-theme^="badge-prefix:"]')).toHaveCount(0);
  await page.clock.runFor(1100);
  await expect(page.locator('sup')).toHaveCount(0);
});
