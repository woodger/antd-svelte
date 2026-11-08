import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-carousel-prefix-reference.json' with { type: 'json' };
import { snapshotCarouselPrefix } from './carousel-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Carousel prefix matches source layout for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=carousel-prefix');
    await page.getByRole('combobox', { name: 'Carousel prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotCarouselPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Carousel prefix value' : 'Live Carousel prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Carousel prefix updates retain the active slide, editor and focus', async ({ page }) => {
  await page.goto('/?fixture=carousel-prefix');
  await page.getByRole('checkbox', { name: 'Live Carousel prefix', exact: true }).check();
  const scope = page.locator('[data-carousel-prefix-scope="normal"]');
  const root = scope.locator(':scope > div');
  await scope.getByRole('button', { name: 'Go to third normal slide', exact: true }).click();
  await expect(scope.getByLabel('normal Carousel prefix current')).toHaveText('2');
  const oldRoot = await root.elementHandle();
  const active = scope.locator('.slick-slide.slick-active');
  const oldSlide = await active.elementHandle();
  const editor = active.locator('input');
  const oldEditor = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });
  const events = await scope.getByLabel('normal Carousel prefix events').textContent();

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotCarouselPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await active.evaluate((node, old) => node === old, oldSlide)).toBe(step.sameSlide);
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    await expect(scope.getByLabel('normal Carousel prefix ref')).toHaveText('mounted');
    await expect(scope.getByLabel('normal Carousel prefix events')).toHaveText(events!);
  }
  await setPrefix(page, 'gallery', true);

  await expect(root).toHaveClass(/gallery/);
  await expect(editor).toBeFocused();
  await scope.locator('.slick-next').click();

  await expect(scope.getByLabel('normal Carousel prefix current')).toHaveText('3');
  await scope.locator('.slick-prev').click();

  await expect(scope.getByLabel('normal Carousel prefix current')).toHaveText('2');
  await expect(scope.locator('.slick-active input')).toHaveValue('kept draft');
});

for (const [sample, name] of [
  ['local', 'gallery-dot-animation'],
  ['start', 'gallery-dot-vertical-animation']
]) {
  test(`Carousel executes local duration keyframes for ${sample}`, async ({ page }) => {
    await page.goto('/?fixture=carousel-prefix');
    await page.getByRole('combobox', { name: 'Carousel prefix sample', exact: true })
      .selectOption(sample);
    const root = page.locator('[data-carousel-prefix-scope="normal"] > div');
    await root.evaluate((node: HTMLElement) => { node.style.setProperty('--dot-duration', '5s'); });
    const dot = root.locator('.slick-dots li.slick-active');

    await expect.poll(() => dot.evaluate(node => getComputedStyle(node, '::after').animationName))
      .toBe(name);
    await expect.poll(() => root.evaluate((node, expected) => node.getAnimations({ subtree: true })
      .some(animation => 'animationName' in animation && animation.animationName === expected
        && animation.effect?.getTiming().duration === 5000 && animation.playState === 'running'), name))
      .toBe(true);
  });
}
