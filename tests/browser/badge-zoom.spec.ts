import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-badge-zoom-reference.json' with { type: 'json' };

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
  await page.goto('/?fixture=badge-zoom');
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
    const node = surface.querySelector('sup, .ant-scroll-number-custom-component, .ant-badge-status-dot');
    if (node && !ids.has(node)) ids.set(node, ++tracked.zoomSerial!);

    return {
      kind: node ? node.tagName === 'SUP' ? 'number'
        : node.classList.contains('ant-scroll-number-custom-component') ? 'custom' : 'status' : null,
      id: node ? ids.get(node) : null,
      text: node?.textContent ?? null,
      title: node?.getAttribute('title') ?? null,
      show: node?.getAttribute('data-show') ?? null,
      dot: node?.classList.contains('ant-badge-dot') ?? false,
      multiple: node?.classList.contains('ant-badge-multiple-words') ?? false,
      motion: node ? [...node.classList].filter(name => name.startsWith('ant-badge-zoom')).sort() : [],
      animation: node ? getComputedStyle(node).animationName : null,
      focused: document.activeElement === surface.querySelector('[aria-label="Zoom owner"]')
    };
  });
}

for (const sample of reference.cases) {
  test(`Badge zoom/cache frames match upstream for ${sample.name}`, async ({ page }) => {
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

test('Badge removes hidden descriptions immediately while retaining the outgoing visual value', async ({ page }) => {
  await select(page, 'leave-cache');
  const owner = page.getByRole('button', { name: 'Zoom owner', exact: true });
  await expect(owner).toHaveAccessibleDescription('Количество: 5');

  await next(page);

  await expect(owner).not.toHaveAttribute('aria-describedby');
  await expect(page.locator('sup')).toHaveText('5');
  await expect(page.locator('sup')).toHaveAttribute('data-show', 'false');
  await expect(owner).toBeFocused();
});

test('Badge retains custom controls until the source deadline and then removes them', async ({ page }) => {
  await page.getByLabel('Interactive zoom count', { exact: true }).check();
  await select(page, 'custom-deadline');
  const input = page.getByRole('textbox', { name: 'Zoom custom draft', exact: true });
  await input.fill('Owned draft');
  const previous = await input.elementHandle();

  await next(page);
  await next(page);
  await page.clock.runFor(32);
  await next(page);

  await expect(input).toHaveValue('Owned draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, old) => node === old, previous)).toBe(true);

  await next(page);
  await page.clock.runFor(1100);

  await expect(input).toHaveCount(0);
});

test('Badge zoom ends from a real own animationend', async ({ page }) => {
  await page.getByLabel('Short zoom duration', { exact: true }).check();
  await select(page, 'leave-cache');
  await page.clock.resume();

  await next(page);

  await expect(page.locator('sup')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zoom owner', exact: true })).toBeFocused();
  expect((await resources(page)).timers).toBe(1);
});

test('Badge cancels scheduled frames when removed before activation', async ({ page }) => {
  await select(page, 'unmount');
  await page.clock.runFor(1100);
  await next(page);

  expect(await resources(page)).toEqual({ timers: 0, frames: 1 });

  await next(page);
  await next(page);

  expect(await resources(page)).toEqual({ timers: 0, frames: 0 });
  await expect(page.locator('sup')).toHaveCount(0);
});

test('Badge releases its active deadline on removal', async ({ page }) => {
  await select(page, 'unmount');
  await page.clock.runFor(1100);
  await next(page);
  await next(page);
  await page.clock.runFor(64);

  expect(await resources(page)).toEqual({ timers: 1, frames: 0 });

  await next(page);

  expect(await resources(page)).toEqual({ timers: 0, frames: 0 });
  await page.clock.runFor(1100);
  await expect(page.locator('sup')).toHaveCount(0);
});

test('Badge removes its outgoing counter immediately under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await select(page, 'leave-cache');
  await next(page);

  await expect(page.locator('sup')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zoom owner', exact: true })).toBeFocused();
  expect(await resources(page)).toEqual({ timers: 0, frames: 0 });
});

test('Badge settles an active exit when reduced motion is enabled', async ({ page }) => {
  await select(page, 'leave-cache');
  await next(page);
  await next(page);
  await page.clock.runFor(64);

  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(page.locator('sup')).toHaveCount(0);
  await page.clock.runFor(1100);
  expect(await resources(page)).toEqual({ timers: 0, frames: 0 });
});
