import { test, expect } from './test';
import type { Page } from '@playwright/test';

const carousel = (page: Page) => page.locator('#carousel-under-test');
const output = (page: Page, label: string) => page.getByLabel(label, { exact: true });
const button = (page: Page, label: string) => page.getByRole('button', { name: label, exact: true });

async function settled(page: Page) {
  await expect(output(page, 'Carousel animating')).toHaveText('false');
  await carousel(page).evaluate(element => Promise.all(
    element.getAnimations({ subtree: true })
      .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map(animation => animation.finished.catch(() => {}))
  ));
}

async function remount(page: Page, configure: () => Promise<void>) {
  await output(page, 'Mount Carousel').uncheck();
  await configure();
  await button(page, 'Clear Carousel events').click();
  await output(page, 'Mount Carousel').check();
  await expect(output(page, 'Carousel events')).toContainText('init');
}

async function pausedFixture(page: Page) {
  const time = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto('/?fixture=carousel');
  await expect(carousel(page)).toBeVisible();
  await page.clock.runFor(500);
  await expect(output(page, 'Carousel current')).toHaveText('0');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=carousel');
  await expect(carousel(page).locator('.slick-slide[data-index="0"] h3')).toHaveText('Slide A');
  await expect(output(page, 'Carousel events')).toContainText('before:0:0');
  await settled(page);
});

test('Carousel exposes its ref and source slide clones with working native fields', async ({ page }) => {
  await expect(output(page, 'Carousel ref')).toHaveText('carousel-under-test');
  await expect(carousel(page).locator('.slick-slide')).toHaveCount(6);
  await expect(carousel(page).locator('.slick-slide.slick-active')).toHaveAttribute('data-index', '0');
  await expect(carousel(page).locator('.slick-dots li.slick-active')).toHaveText('1');
  await carousel(page).locator('.slick-active input').fill('Persistent draft');
  await button(page, 'Следующий слайд').click();
  await expect(output(page, 'Carousel current')).toHaveText('1');
  await settled(page);
  await button(page, 'Предыдущий слайд').click();
  await settled(page);

  await expect(carousel(page).locator('.slick-active input')).toHaveValue('Persistent draft');
  await button(page, 'Action A').click();
  await expect(output(page, 'Carousel clicks')).toHaveText('1');
});

test('Carousel cycles through infinite clones and supports goTo without animation', async ({ page }) => {
  await button(page, 'Carousel previous ref').click();
  await expect(output(page, 'Carousel current')).toHaveText('3');
  await settled(page);
  await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide D');
  await button(page, 'Carousel next ref').click();
  await expect(output(page, 'Carousel current')).toHaveText('0');
  await settled(page);
  await button(page, 'Carousel instant ref').click();

  await expect(output(page, 'Carousel current')).toHaveText('2');
  await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide C');
  await expect(output(page, 'Carousel events')).toContainText('after:2');
});

test('Carousel honors vertical dot placement and localized arrows without RTL mirroring', async ({ page }) => {
  await output(page, 'Right to left').check();
  await page.getByRole('combobox', { name: 'Carousel placement', exact: true }).selectOption('start');
  await settled(page);

  await expect(carousel(page)).toHaveClass(/ant-carousel-vertical/);
  await expect(carousel(page)).not.toHaveClass(/ant-carousel-rtl/);
  await expect(carousel(page).locator('.slick-dots')).toHaveClass(/slick-dots-start/);
  await button(page, 'Следующий слайд').click();
  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel keeps native form actions independent from navigation buttons', async ({ page }) => {
  await carousel(page).locator('.slick-dots button').nth(2).click();
  await expect(output(page, 'Carousel current')).toHaveText('2');
  await settled(page);
  await button(page, 'Следующий слайд').click();
  await settled(page);

  await expect(output(page, 'Carousel submissions')).toHaveText('0');
});

test('Carousel keeps current input state when children are added and clamps a removed page', async ({ page }) => {
  await button(page, 'Carousel go ref').click();
  await settled(page);
  await carousel(page).locator('.slick-active input').fill('Retained Gamma');
  await output(page, 'Carousel count').fill('5');

  await expect(output(page, 'Carousel current')).toHaveText('2');
  await expect(carousel(page).locator('.slick-active input')).toHaveValue('Retained Gamma');
  await output(page, 'Carousel count').fill('2');

  await expect(output(page, 'Carousel current')).toHaveText('1');
  await settled(page);
  await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide B');
  await expect(carousel(page).locator('.slick-slide')).toHaveCount(4);
});

test('Carousel keeps empty and one-slide collections unslick without extra controls or clones', async ({ page }) => {
  await remount(page, async () => { await output(page, 'Carousel count').fill('0'); });

  await expect(carousel(page).locator('.slick-slide')).toHaveCount(0);
  await expect(carousel(page).locator('.slick-arrow, .slick-dots')).toHaveCount(0);
  await expect(output(page, 'Carousel events')).not.toContainText('before:');
  await output(page, 'Carousel count').fill('1');

  await expect(carousel(page).locator('.slick-slide')).toHaveCount(1);
  await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide A');
  await expect(carousel(page).locator('.slick-cloned, .slick-arrow, .slick-dots')).toHaveCount(0);
});

test('Carousel keeps initialSlide when empty children are populated', async ({ page }) => {
  await remount(page, async () => {
    await output(page, 'Carousel count').fill('0');
    await output(page, 'Carousel initial').fill('1');
  });
  await output(page, 'Carousel count').fill('3');

  await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide B');
  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel applies later initialSlide changes and preserves native drafts across visits', async ({ page }) => {
  await carousel(page).locator('.slick-active input').fill('Edited Alpha');
  await output(page, 'Carousel initial').fill('2');
  await expect(output(page, 'Carousel current')).toHaveText('2');
  await settled(page);
  await output(page, 'Carousel initial').fill('0');
  await settled(page);

  await expect(carousel(page).locator('.slick-active input')).toHaveValue('Edited Alpha');
});

test('Carousel finite arrows keep the source disabled classes and stop at the last slide', async ({ page }) => {
  await output(page, 'Carousel infinite').uncheck();
  await expect(carousel(page).locator('.slick-prev')).toHaveClass(/slick-disabled/);
  await output(page, 'Carousel destination').fill('3');
  await button(page, 'Carousel go ref').click();
  await expect(output(page, 'Carousel current')).toHaveText('3');
  await settled(page);

  await expect(carousel(page).locator('.slick-next')).toHaveClass(/slick-disabled/);
  await button(page, 'Carousel next ref').click();
  await settled(page);
  await expect(output(page, 'Carousel current')).toHaveText('3');
});

test('Carousel groups uneven finite pages and keeps targetSlide separate from currentSlide', async ({ page }) => {
  await remount(page, async () => {
    await output(page, 'Carousel infinite').uncheck();
    await output(page, 'Carousel count').fill('5');
    await output(page, 'Carousel show').fill('2');
    await output(page, 'Carousel scroll').fill('2');
  });
  await settled(page);
  await button(page, 'Следующий слайд').click();
  await expect(output(page, 'Carousel current')).toHaveText('2');
  await settled(page);
  await button(page, 'Следующий слайд').click();

  await expect(output(page, 'Carousel current')).toHaveText('3');
  await expect(output(page, 'Carousel target')).toHaveText('4');
  await expect(carousel(page).locator('.slick-slide.slick-active h3')).toHaveText(['Slide D', 'Slide A']);
  await expect(carousel(page).locator('.slick-dots li')).toHaveCount(3);
  await expect(carousel(page).locator('.slick-dots li.slick-active')).toHaveText('3');
});

test('Carousel routes keyboard arrows while retaining native input navigation', async ({ page }) => {
  const current = carousel(page).locator('.slick-slide[data-index="0"]');
  await current.focus();
  await page.keyboard.press('ArrowRight');
  await expect(output(page, 'Carousel current')).toHaveText('1');
  await settled(page);
  const input = carousel(page).locator('.slick-active input');
  await input.fill('Native caret');
  await input.press('ArrowLeft');

  await expect(output(page, 'Carousel current')).toHaveText('1');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Native caret');
});

test('Carousel can disable keyboard navigation independently of arrow buttons', async ({ page }) => {
  await output(page, 'Carousel accessibility').uncheck();
  await carousel(page).locator('.slick-slide[data-index="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(output(page, 'Carousel current')).toHaveText('0');
  await button(page, 'Следующий слайд').click();

  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel mirrors the source RTL index and swaps localized physical arrow labels', async ({ page }) => {
  await output(page, 'Right to left').check();
  await expect(output(page, 'Carousel current')).toHaveText('3');
  await settled(page);

  await expect(carousel(page).locator('.slick-prev')).toHaveAttribute('aria-label', 'Следующий слайд');
  await expect(carousel(page).locator('.slick-next')).toHaveAttribute('aria-label', 'Предыдущий слайд');
  await button(page, 'Следующий слайд').click();

  await expect(output(page, 'Carousel current')).toHaveText('2');
  await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide B');
});

test('Carousel retains Slick next direction for an imperative RTL next call', async ({ page }) => {
  await output(page, 'Right to left').check();
  await expect(output(page, 'Carousel current')).toHaveText('3');
  await settled(page);
  await button(page, 'Carousel next ref').click();

  await expect(output(page, 'Carousel current')).toHaveText('0');
  await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide D');
});

test('Carousel applies source config styles to the inner slider and custom render props', async ({ page }) => {
  await output(page, 'Carousel custom').check();
  await output(page, 'Carousel locale alias').check();

  await expect(carousel(page).locator('.slick-slider')).toHaveClass(/local-slider provider-slider/);
  await expect(carousel(page).locator('.slick-slider')).toHaveCSS('color', 'rgb(0, 80, 0)');
  await expect(carousel(page).locator('.slick-dots')).toHaveAttribute('data-append', 'custom');
  await button(page, 'Custom dot 3').click();
  await expect(output(page, 'Carousel current')).toHaveText('2');
  await settled(page);
  await expect(button(page, 'Custom next')).toHaveAttribute('data-current', '2');
  await expect(button(page, 'Custom next')).toHaveAttribute('data-count', '4');
  await button(page, 'Custom previous').click();

  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel honors the source locale alias for default arrows', async ({ page }) => {
  await output(page, 'Carousel locale alias').check();

  await expect(button(page, 'Source previous')).toBeVisible();
  await button(page, 'Source next').click();
  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel waits for an active animation when requested', async ({ page }) => {
  await output(page, 'Carousel wait').check();
  await output(page, 'Carousel speed').fill('1000');
  await settled(page);
  await button(page, 'Clear Carousel events').click();
  await carousel(page).locator('.slick-next').evaluate(element => {
    (element as HTMLButtonElement).click();
    (element as HTMLButtonElement).click();
  });

  await expect(output(page, 'Carousel current')).toHaveText('1');
  await expect(output(page, 'Carousel events')).toHaveText('before:0:1');
  await settled(page);
  await expect(output(page, 'Carousel events')).toHaveText('before:0:1|after:1');
});

test('Carousel publishes interrupted afterChange before accepting a later completion', async ({ page }) => {
  await output(page, 'Carousel speed').fill('1000');
  await settled(page);
  await button(page, 'Clear Carousel events').click();
  await button(page, 'Carousel next ref').click();
  await expect(output(page, 'Carousel current')).toHaveText('1');
  await button(page, 'Carousel next ref').click();

  await expect(output(page, 'Carousel current')).toHaveText('2');
  await expect(output(page, 'Carousel events')).toContainText('before:1:2|after:1');
  await settled(page);
  await expect(output(page, 'Carousel events')).toHaveText('before:0:1|before:1:2|after:1|after:2');
});

test('Carousel renders fade on a single overlaid slide and preserves source styles', async ({ page }) => {
  await output(page, 'Carousel fade').check();
  await output(page, 'Carousel show').fill('3');
  await expect(carousel(page).locator('.slick-slide')).toHaveCount(4);
  await button(page, 'Carousel go ref').click();
  await expect(output(page, 'Carousel current')).toHaveText('2');
  await settled(page);

  await expect(carousel(page).locator('.slick-slide[data-index="2"]')).toHaveCSS('opacity', '1');
  await expect(carousel(page).locator('.slick-slide[data-index="0"]')).toHaveCSS('opacity', '0');
  await expect(carousel(page).locator('.slick-slide[data-index="2"]')).toHaveCSS('width', '600px');
});

test('Carousel can position the track without CSS transforms', async ({ page }) => {
  await output(page, 'Carousel transform').uncheck();
  await button(page, 'Carousel go ref').click();
  await settled(page);

  await expect(carousel(page).locator('.slick-track')).toHaveCSS('left', '-1800px');
  await expect(output(page, 'Carousel current')).toHaveText('2');
});

test('Carousel measures adaptive height for the selected slide', async ({ page }) => {
  await output(page, 'Carousel adaptive').check();
  await expect(carousel(page).locator('.slick-list')).toHaveCSS('height', '160px');
  await button(page, 'Следующий слайд').click();

  await expect(carousel(page).locator('.slick-list')).toHaveCSS('height', '220px');
  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel groups rows and per-row cells and disables unsupported variable widths', async ({ page }) => {
  await remount(page, async () => {
    await output(page, 'Carousel count').fill('7');
    await output(page, 'Carousel rows').fill('2');
    await output(page, 'Carousel per row').fill('2');
    await output(page, 'Carousel variable').check();
  });

  await expect(carousel(page).locator('.slick-slide')).toHaveCount(4);
  await expect(carousel(page).locator('.slick-slide[data-index="0"] > div')).toHaveCount(2);
  await expect(carousel(page).locator('.slick-slide[data-index="0"] .carousel-child')).toHaveCount(4);
  await expect(carousel(page).locator('.slick-slide[data-index="0"] .carousel-child').first())
    .toHaveCSS('width', '300px');
  await button(page, 'Следующий слайд').click();
  await expect(carousel(page).locator('.slick-active .carousel-child')).toHaveCount(3);
});

test('Carousel measures variable-width children and centers the selected slide', async ({ page }) => {
  await output(page, 'Carousel variable').check();
  await output(page, 'Carousel center').check();
  await button(page, 'Carousel go ref').click();
  await expect(output(page, 'Carousel current')).toHaveText('2');
  await settled(page);

  const list = (await carousel(page).locator('.slick-list').boundingBox())!;
  const current = (await carousel(page).locator('.slick-slide[data-index="2"]').boundingBox())!;
  expect(current.width).toBe(180);
  expect(current.x + current.width / 2).toBeCloseTo(list.x + list.width / 2, 0);
});

test('Carousel focuses the previous DOM current slide before a selection commit', async ({ page }) => {
  await output(page, 'Carousel select').check();
  await button(page, 'Следующий слайд').click();
  await settled(page);

  await expect(output(page, 'Carousel current')).toHaveText('1');
  await expect(carousel(page).locator('.slick-slide[data-index="0"]')).toBeFocused();
  expect(await carousel(page).locator('.slick-list').evaluate(element => element.scrollLeft)).toBe(0);
});

test('Carousel links two independent sliders through asNavFor without recursive navigation', async ({ page }) => {
  await output(page, 'Carousel sync').check();
  await expect(page.locator('#carousel-peer .slick-active h3')).toHaveText('Slide A');
  await button(page, 'Carousel go ref').click();

  await expect(output(page, 'Carousel current')).toHaveText('2');
  await expect(output(page, 'Carousel peer current')).toHaveText('2');
  await expect(page.locator('#carousel-peer .slick-active h3')).toHaveText('Slide C');
});

test('Carousel keeps disabled context independent from native navigation arrows', async ({ page }) => {
  await output(page, 'Disable all components').check();
  await button(page, 'Следующий слайд').click();

  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel tracks compact typography and source arrow spacing in live themes', async ({ page }) => {
  await output(page, 'Carousel dark').check();
  await output(page, 'Carousel compact').check();

  await expect(carousel(page)).toHaveCSS('font-size', '12px');
  await expect(carousel(page)).toHaveCSS('line-height', '20px');
  await expect(carousel(page).locator('.slick-prev')).toHaveCSS('left', '4px');
  await expect(carousel(page)).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
});

test('Carousel autoplay preserves the extra fifty millisecond interval', async ({ page }) => {
  await pausedFixture(page);
  await output(page, 'Carousel pause hover').uncheck();
  await output(page, 'Carousel autoplay').check();
  await output(page, 'Carousel duration').check();
  await expect(output(page, 'Carousel playing')).toHaveText('playing');

  await page.clock.runFor(1049);
  await expect(output(page, 'Carousel current')).toHaveText('0');
  await page.clock.runFor(1);

  await expect(output(page, 'Carousel current')).toHaveText('1');
  expect(await carousel(page).evaluate(element => element.style.getPropertyValue('--dot-duration')))
    .toBe('1000ms');
});

test('Carousel imperative play and pause work while the autoplay prop stays false', async ({ page }) => {
  await pausedFixture(page);
  await button(page, 'Carousel play ref').click();
  await page.clock.runFor(1050);
  await expect(output(page, 'Carousel current')).toHaveText('1');
  await button(page, 'Carousel pause ref').click();
  await page.clock.runFor(4000);

  await expect(output(page, 'Carousel current')).toHaveText('1');
  await expect(output(page, 'Carousel playing')).toHaveText('paused');
  await expect(output(page, 'Carousel autoplay')).not.toBeChecked();
});

test('Carousel pauses on track hover and resumes after leaving', async ({ page }) => {
  await pausedFixture(page);
  await output(page, 'Carousel autoplay').check();
  await carousel(page).locator('.slick-active h3').hover();
  await expect(output(page, 'Carousel playing')).toHaveText('hovered');
  await page.clock.runFor(4000);
  await expect(output(page, 'Carousel current')).toHaveText('0');
  await button(page, 'Carousel next ref').hover();
  await expect(output(page, 'Carousel playing')).toHaveText('playing');
  await page.clock.runFor(1050);

  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel pauses on a focused slide and resumes after native blur', async ({ page }) => {
  await pausedFixture(page);
  await output(page, 'Carousel pause hover').uncheck();
  await output(page, 'Carousel pause focus').check();
  await output(page, 'Carousel autoplay').check();
  await carousel(page).locator('.slick-slide[data-index="0"]').focus();
  await expect(output(page, 'Carousel playing')).toHaveText('focused');
  await page.clock.runFor(3000);
  await expect(output(page, 'Carousel current')).toHaveText('0');
  await button(page, 'Carousel next ref').focus();
  await page.clock.runFor(1050);

  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel can pause autoplay on the dot container independently of track hover', async ({ page }) => {
  await pausedFixture(page);
  await output(page, 'Carousel pause hover').uncheck();
  await output(page, 'Carousel pause dots').check();
  await output(page, 'Carousel autoplay').check();
  await carousel(page).locator('.slick-dots').hover();
  await expect(output(page, 'Carousel playing')).toHaveText('hovered');
  await page.clock.runFor(3000);
  await expect(output(page, 'Carousel current')).toHaveText('0');
  await button(page, 'Carousel next ref').hover();
  await page.clock.runFor(1050);

  await expect(output(page, 'Carousel current')).toHaveText('1');
});

for (const mode of ['ondemand', 'anticipated']) {
  test(`Carousel ${mode} loads requested slides and retains earlier native drafts`, async ({ page }) => {
    await remount(page, async () => {
      await page.getByRole('combobox', { name: 'Carousel lazy', exact: true }).selectOption(mode);
    });
    await settled(page);
    await expect(carousel(page).locator('.slick-slide[data-index="2"] h3')).toHaveCount(0);
    await carousel(page).locator('.slick-active input').fill('Lazy draft');
    await button(page, 'Carousel go ref').click();
    await expect(carousel(page).locator('.slick-active h3')).toHaveText('Slide C');
    await expect(output(page, 'Carousel events')).toContainText('lazy:2');
    await settled(page);
    await output(page, 'Carousel destination').fill('0');
    await button(page, 'Carousel go ref').click();
    await settled(page);

    await expect(carousel(page).locator('.slick-active input')).toHaveValue('Lazy draft');
  });
}

test('Carousel progressively loads both sides and stops when its clone window is covered', async ({ page }) => {
  await pausedFixture(page);
  await remount(page, async () => {
    await page.getByRole('combobox', { name: 'Carousel lazy', exact: true }).selectOption('progressive');
  });
  await page.clock.runFor(1000);

  await expect(output(page, 'Carousel events')).toContainText('lazy:1,-1');
  await expect(carousel(page).locator('.slick-slide[data-index="1"] h3')).toHaveText('Slide B');
  await page.clock.runFor(5000);
  const events = await output(page, 'Carousel events').textContent();
  await page.clock.runFor(2000);

  await expect(output(page, 'Carousel events')).toHaveText(events!);
  await expect(carousel(page).locator('.slick-slide h3')).toHaveCount(6);
});

test('Carousel responsive settings activate on media changes and retain source breakpoint ranges', async ({ page }) => {
  await remount(page, async () => { await output(page, 'Carousel responsive').check(); });
  await settled(page);
  await page.setViewportSize({ width: 500, height: 1100 });

  await expect(carousel(page).locator('.slick-slide.slick-active')).toHaveCount(2);
  await expect(carousel(page).locator('.slick-dots li')).toHaveCount(2);
  await page.setViewportSize({ width: 800, height: 1100 });
  await expect(carousel(page).locator('.slick-slide.slick-active')).toHaveCount(3);
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(carousel(page).locator('.slick-slide.slick-active')).toHaveCount(1);
});

test('Carousel responsive unslick restores original children and remounts a working slider', async ({ page }) => {
  await remount(page, async () => {
    await output(page, 'Carousel responsive').check();
    await output(page, 'Carousel regular').check();
  });
  await page.setViewportSize({ width: 500, height: 1100 });

  await expect(carousel(page).locator('.regular.slider > .carousel-child')).toHaveCount(4);
  await expect(carousel(page).locator('.slick-list')).toHaveCount(0);
  await expect(output(page, 'Carousel current')).toHaveText('none');
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(carousel(page).locator('.slick-list')).toBeVisible();
  await button(page, 'Carousel next ref').click();
  await expect(output(page, 'Carousel current')).toHaveText('1');
});

test('Carousel applies responsive listeners from mount rather than registering a late prop', async ({ page }) => {
  await output(page, 'Carousel responsive').check();
  await page.setViewportSize({ width: 500, height: 1100 });

  await expect(carousel(page).locator('.slick-slide.slick-active')).toHaveCount(1);
});

test('Carousel uses the source mouse drag gate and changes slides only after enabling draggable', async ({ page }) => {
  const list = carousel(page).locator('.slick-list');
  await list.scrollIntoViewIfNeeded();
  let bounds = (await list.boundingBox())!;
  await page.mouse.move(bounds.x + 450, bounds.y + 25);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 100, bounds.y + 25, { steps: 5 });
  await page.mouse.up();
  await expect(output(page, 'Carousel current')).toHaveText('0');
  await output(page, 'Carousel draggable').check();
  await page.evaluate(() => window.getSelection()?.removeAllRanges());
  await list.scrollIntoViewIfNeeded();
  bounds = (await list.boundingBox())!;
  await page.mouse.move(bounds.x + 450, bounds.y + 25);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 100, bounds.y + 25, { steps: 5 });
  await page.mouse.up();

  await expect(output(page, 'Carousel current')).toHaveText('1');
  await expect(output(page, 'Carousel events')).toContainText('swipe:left');
});

test('Carousel emits finite edge friction once during a drag and stays at the first slide', async ({ page }) => {
  await output(page, 'Carousel infinite').uncheck();
  await output(page, 'Carousel draggable').check();
  const list = carousel(page).locator('.slick-list');
  await list.scrollIntoViewIfNeeded();
  const box = (await list.boundingBox())!;
  await button(page, 'Clear Carousel events').evaluate((element: HTMLButtonElement) => element.click());
  await page.mouse.move(box.x + 80, box.y + 25);
  await page.mouse.down();
  await page.mouse.move(box.x + 400, box.y + 25, { steps: 6 });
  await page.mouse.up();

  await expect(output(page, 'Carousel current')).toHaveText('0');
  expect((await output(page, 'Carousel events').textContent())!.match(/edge:right/g)).toHaveLength(1);
  await expect(output(page, 'Carousel events')).toContainText('swipe:right');
});

test('Carousel consumes a native vertical touch gesture and cleans its body listener', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Carousel placement', exact: true }).selectOption('start');
  await settled(page);
  const list = carousel(page).locator('.slick-list');
  await list.evaluate(element => {
    function send(type: string, y: number) {
      const touch = new Touch({ identifier: 1, target: element, pageX: 300, pageY: y,
        clientX: 300, clientY: y });
      element.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : [touch], changedTouches: [touch] }));
    }
    send('touchstart', 150);
    send('touchmove', 20);
    send('touchend', 20);
  });

  await expect(output(page, 'Carousel current')).toHaveText('1');
  await expect(output(page, 'Carousel events')).toContainText('swipe:up');
  expect(await page.evaluate(() => {
    const event = new TouchEvent('touchmove', { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  })).toBe(false);
});

test('Carousel swipeToSlide chooses a measured destination across several visible slides', async ({ page }) => {
  await remount(page, async () => {
    await output(page, 'Carousel count').fill('7');
    await output(page, 'Carousel show').fill('3');
    await output(page, 'Carousel draggable').check();
    await output(page, 'Carousel swipe slide').check();
  });
  await settled(page);
  const list = carousel(page).locator('.slick-list');
  await list.scrollIntoViewIfNeeded();
  const box = (await list.boundingBox())!;
  await page.mouse.move(box.x + 500, box.y + 25);
  await page.mouse.down();
  await page.mouse.move(box.x + 40, box.y + 25, { steps: 8 });
  await page.mouse.up();

  await expect(output(page, 'Carousel current')).toHaveText('2');
  await expect(carousel(page).locator('.slick-active h3')).toHaveText(['Slide C', 'Slide D', 'Slide A']);
});

for (const flag of ['Carousel touch', 'Carousel swipe']) {
  test(`Carousel disables gestures through ${flag} without disabling arrow navigation`, async ({ page }) => {
    await output(page, 'Carousel draggable').check();
    await output(page, flag).uncheck();
    const list = carousel(page).locator('.slick-list');
    await list.scrollIntoViewIfNeeded();
    const box = (await list.boundingBox())!;
    await page.mouse.move(box.x + 450, box.y + 25);
    await page.mouse.down();
    await page.mouse.move(box.x + 80, box.y + 25, { steps: 5 });
    await page.mouse.up();

    await expect(output(page, 'Carousel current')).toHaveText('0');
    await button(page, 'Следующий слайд').click();
    await expect(output(page, 'Carousel current')).toHaveText('1');
  });
}

test('Carousel handles image errors without replacing native image handlers', async ({ page }) => {
  await output(page, 'Carousel images').check();
  const image = carousel(page).locator('.slick-slide[data-index="0"] img');
  await expect(image).toBeVisible();
  await image.evaluate(element => element.addEventListener('error', () => {
    element.setAttribute('data-native-error', 'true');
  }, { once: true }));
  await button(page, 'Clear Carousel events').click();
  await image.dispatchEvent('error');

  await expect(output(page, 'Carousel events')).toHaveText('image-error');
  await expect(image).toHaveAttribute('data-native-error', 'true');
});

test('Carousel releases timers, images, resize work and saved imperative methods on unmount', async ({ page }) => {
  await pausedFixture(page);
  await remount(page, async () => {
    await output(page, 'Carousel images').check();
    await output(page, 'Carousel autoplay').check();
    await page.getByRole('combobox', { name: 'Carousel lazy', exact: true }).selectOption('progressive');
  });
  await page.clock.runFor(500);
  await button(page, 'Save Carousel ref').click();
  const image = await carousel(page).locator('.slick-slide[data-index="0"] img').elementHandle();
  await button(page, 'Carousel go ref').click();
  await page.clock.runFor(1);
  await output(page, 'Mount Carousel').uncheck();
  await button(page, 'Clear Carousel events').click();
  const reinits = await output(page, 'Carousel reinits').textContent();
  await button(page, 'Call saved Carousel next').click();
  await image!.evaluate(element => element.dispatchEvent(new Event('error')));
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.clock.runFor(6000);

  await expect(carousel(page)).toHaveCount(0);
  await expect(output(page, 'Carousel events')).toHaveText('');
  await expect(output(page, 'Carousel reinits')).toHaveText(reinits!);
  await expect(output(page, 'Carousel ref')).toHaveText('none');
});
