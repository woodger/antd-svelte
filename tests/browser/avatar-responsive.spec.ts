import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-avatar-responsive-reference.json' with { type: 'json' };

const avatars = (page: Page) => page.locator('#avatar-responsive-surface .ant-avatar');
const owner = (page: Page) => page.getByRole('button', { name: 'Responsive avatar owner', exact: true });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=avatar-responsive'); });
async function frames(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let n = 0; n < 5; n++) await new Promise(requestAnimationFrame);
  });
}
async function metrics(page: Page) {
  return avatars(page).evaluateAll(nodes => nodes.map(element => {
    const node = element as HTMLElement;
    const style = getComputedStyle(node);
    return {
      width: parseFloat(style.width), height: parseFloat(style.height), font: parseFloat(style.fontSize),
      inline: { width: node.style.width, height: node.style.height, font: node.style.fontSize }
    };
  }));
}
async function check(page: Page, name: string, checked: boolean) {
  await page.getByLabel(name, { exact: true }).evaluate((node, checked) => {
    const input = node as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

for (const sample of reference.cases) {
  test(`Avatar responsive sizes match the official source for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Avatar size reference', { exact: true }).selectOption(sample.name);
    const roots = await avatars(page).elementHandles();
    if (!sample.group) await owner(page).focus();

    for (const expected of sample.values) {
      await page.setViewportSize({ width: expected.width, height: 1000 });
      await frames(page);

      await expect.poll(() => metrics(page)).toEqual(expected.metrics);
      expect(await avatars(page).evaluateAll((nodes, old) => nodes.every((node, i) => node === old[i]), roots))
        .toBe(true);
      if (!sample.group) await expect(owner(page)).toBeFocused();
    }
  });
}

test('Avatar keeps source breakpoint subscriptions until responsive mode changes', async ({ page }) => {
  await page.setViewportSize({ width: 620, height: 1000 });
  await page.getByLabel('Avatar size reference', { exact: true }).selectOption('lifecycle');
  const roots = await avatars(page).elementHandles();

  for (const expected of reference.lifecycle.states) {
    if (expected.name === 'shift') await check(page, 'Shift avatar breakpoint', true);
    if (expected.name === 'numeric' || expected.name === 'responsive') {
      await page.getByLabel('Avatar responsive mode', { exact: true })
        .selectOption(expected.name === 'numeric' ? 'numeric' : 'case');
    }
    await page.setViewportSize({ width: expected.width, height: 1000 });
    await frames(page);

    await expect.poll(() => metrics(page)).toEqual(expected.metrics);
    expect(await avatars(page).evaluateAll((nodes, old) => nodes.every((node, i) => node === old[i]), roots))
      .toBe(true);
  }
});

test('responsive Avatar mode and text updates retain owner focus and root identity', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.getByLabel('Avatar size reference', { exact: true }).selectOption('full-text');
  const root = await avatars(page).elementHandle();
  await owner(page).focus();

  for (const [mode, width, font] of [
    ['numeric', '48px', '18px'], ['empty', '32px', '14px'],
    ['new-map', '55px', '27.5px'], ['case', '40px', '20px']
  ]) {
    await page.getByLabel('Avatar responsive mode', { exact: true }).evaluate((node, value) => {
      (node as HTMLSelectElement).value = value;
      node.dispatchEvent(new Event('change', { bubbles: true }));
    }, mode);

    await expect(avatars(page)).toHaveCSS('width', width);
    await expect(avatars(page)).toHaveCSS('font-size', font);
    await expect(owner(page)).toBeFocused();
    expect(await avatars(page).evaluate((node, old) => node === old, root)).toBe(true);
  }
  await page.getByLabel('Responsive avatar text', { exact: true }).evaluate(node => {
    (node as HTMLInputElement).value = 'A';
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await check(page, 'Dark responsive avatar', true);

  await expect(avatars(page).locator('.ant-avatar-string')).toHaveText('A');
  await expect(owner(page)).toBeFocused();
  expect(await avatars(page).evaluate((node, old) => node === old, root)).toBe(true);
});

test('responsive Avatar fits text again at every viewport size', async ({ page }) => {
  await page.getByLabel('Avatar size reference', { exact: true }).selectOption('fractional');

  for (const width of [375, 1200, 575, 1920]) {
    await page.setViewportSize({ width, height: 1000 });

    await expect.poll(() => avatars(page).evaluate(node => {
      const text = node.querySelector('.ant-avatar-string')!;
      return text.getBoundingClientRect().width - node.getBoundingClientRect().width + 8;
    })).toBeLessThanOrEqual(1);
    await expect(avatars(page)).toHaveAccessibleName('Responsive avatar');
  }
});

test('responsive Avatar preserves an image failure through viewport and theme changes', async ({ page }) => {
  await page.getByLabel('Avatar size reference', { exact: true }).selectOption('full-image');
  const image = avatars(page).locator('img');
  await expect.poll(() => image.evaluate(node =>
    (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
  const root = await avatars(page).elementHandle();

  await image.evaluate(node => node.dispatchEvent(new Event('error')));

  await expect(image).toHaveCount(0);
  await expect(page.getByLabel('Responsive avatar errors', { exact: true })).toHaveText('1');
  for (const width of [375, 992, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await frames(page);

    await expect(image).toHaveCount(0);
    expect(await avatars(page).evaluate((node, old) => node === old, root)).toBe(true);
  }
  await check(page, 'Dark responsive avatar', true);

  await expect(image).toHaveCount(0);
  await expect(page.getByLabel('Responsive avatar errors', { exact: true })).toHaveText('1');
});

test('responsive AvatarGroup keeps visible and overflow avatars during RTL and resizing', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1000 });
  await page.getByLabel('Avatar size reference', { exact: true }).selectOption('group');
  await page.locator('.ant-avatar-group-more').click();
  const hidden = page.locator('.ant-avatar-group-list .ant-avatar');
  await expect(hidden).toHaveCount(2);
  const roots = await hidden.elementHandles();

  await page.getByLabel('Right to left', { exact: true }).evaluate(node => {
    (node as HTMLInputElement).checked = true;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  for (const width of [375, 1600, 575]) {
    await page.setViewportSize({ width, height: 1000 });
    await frames(page);

    await expect(page.locator('.ant-avatar-group')).toHaveClass(/ant-avatar-group-rtl/);
    await expect(hidden.nth(0)).toHaveCSS('width', '24px');
    await expect(hidden.nth(1)).toHaveCSS('width', '32px');
    expect(await hidden.evaluateAll((nodes, old) => nodes.every((node, i) => node === old[i]), roots))
      .toBe(true);
    await expect(page.getByRole('dialog')).toBeFocused();
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('.ant-avatar-group-more')).toBeFocused();
});

test('responsive Avatar releases media listeners after remounts and unmount', async ({ page }) => {
  await page.addInitScript(() => {
    let active = 0;
    const publish = () => {
      if (document.documentElement) document.documentElement.dataset.avatarWidthListeners = String(active);
    };
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const media = original(query);
      if (!query.includes('width')) return media;
      // Proxy сохраняет receiver нативного EventTarget.
      media.addEventListener = new Proxy(media.addEventListener, {
        apply(target, receiver, args) {
          if (args[0] === 'change') active++;
          publish();
          return Reflect.apply(target, receiver, args);
        }
      });
      media.removeEventListener = new Proxy(media.removeEventListener, {
        apply(target, receiver, args) {
          if (args[0] === 'change') active--;
          publish();
          return Reflect.apply(target, receiver, args);
        }
      });
      return media;
    };
  });
  await page.goto('/?fixture=avatar-responsive');
  await expect(avatars(page)).toHaveCount(1);
  const read = () => page.evaluate(() => Number(document.documentElement.dataset.avatarWidthListeners));
  const initial = await read();
  expect(initial).toBeGreaterThan(0);

  for (let iteration = 0; iteration < 3; iteration++) {
    await check(page, 'Mount responsive avatar', false);
    await expect.poll(read).toBe(0);
    await check(page, 'Mount responsive avatar', true);
    await expect.poll(read).toBe(initial);
  }
  await check(page, 'Mount responsive avatar', false);
  await page.setViewportSize({ width: 375, height: 1000 });

  await expect.poll(read).toBe(0);
  await expect(avatars(page)).toHaveCount(0);
});
