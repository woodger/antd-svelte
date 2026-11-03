import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-badge-ribbon-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=badge-ribbon'); });

async function frames(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let index = 0; index < 5; index++) await new Promise(requestAnimationFrame);
  });
}

async function select(page: Page, name: string) {
  await page.getByLabel('Ribbon reference', { exact: true }).selectOption(name);
  await expect(page.getByLabel('Ribbon native ref', { exact: true })).toHaveText('mounted');
  await frames(page);
}

async function check(page: Page, name: string, checked: boolean) {
  await page.getByLabel(name, { exact: true }).evaluate((node, checked) => {
    (node as HTMLInputElement).checked = checked;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

async function snapshot(page: Page, prefix = 'ant-ribbon') {
  const surface = page.locator('#ribbon-reference-surface');
  return surface.locator(`.${prefix}-wrapper`).evaluate((wrapper, prefix) => {
    const indicator = wrapper.querySelector<HTMLElement>(`.${prefix}`)!;
    const content = indicator.querySelector<HTMLElement>(`.${prefix}-content`)!;
    const corner = indicator.querySelector<HTMLElement>(`.${prefix}-corner`)!;
    const base = wrapper.getBoundingClientRect();
    const metric = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const round = (value: number) => Math.round(value * 1000) / 1000;

      return {
        x: round(rect.x - base.x),
        y: round(rect.y - base.y),
        width: round(rect.width),
        height: round(rect.height),
        position: style.position,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        boxSizing: style.boxSizing,
        lineHeight: style.lineHeight,
        color: style.color,
        background: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        paddingInline: style.paddingInline,
        radius: [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius
        ],
        opacity: style.opacity,
        direction: style.direction,
        borderColor: [
          style.borderTopColor,
          style.borderRightColor,
          style.borderBottomColor,
          style.borderLeftColor
        ],
        borderWidth: style.borderTopWidth,
        transform: style.transform,
        filter: style.filter,
        outline: style.outlineColor,
        weight: style.fontWeight
      };
    };
    const classes = (element: Element) => [...element.classList]
      .filter(name => name.startsWith('case-')).sort();

    return {
      wrapper: metric(wrapper),
      indicator: metric(indicator),
      content: metric(content),
      corner: metric(corner),
      classes: { root: classes(wrapper), indicator: classes(indicator), content: classes(content) },
      placement: indicator.classList.contains(`${prefix}-placement-start`) ? 'start' : 'end',
      rtl: indicator.classList.contains(`${prefix}-rtl`),
      preset: [...indicator.classList].find(name => name.startsWith(`${prefix}-color-`))
        ?.slice(`${prefix}-color-`.length) ?? null,
      text: content.textContent,
      ref: document.querySelector('[aria-label="Ribbon native ref"]')?.textContent === 'mounted'
    };
  }, prefix);
}

for (const sample of reference.cases) {
  test(`BadgeRibbon matches source layout and semantics for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    await expect.poll(() => snapshot(page, 'prefixCls' in sample && sample.prefixCls
      ? sample.prefixCls : 'ant-ribbon')).toEqual(sample.snapshot);
  });

  if ('refresh' in sample) {
    test(`BadgeRibbon retains caller state across source updates for ${sample.name}`, async ({ page }) => {
      await select(page, sample.name);
      const label = 'textMode' in sample ? 'Ribbon text' : 'Ribbon body';
      const input = page.getByRole('textbox', { name: `${label} draft`, exact: true });
      const previous = await input.elementHandle();
      const wrapper = await page.locator('.ant-ribbon-wrapper').elementHandle();
      await input.fill('Owned draft');
      await input.evaluate(node => {
        (node as HTMLInputElement).setSelectionRange(1, 5);
        node.parentElement!.querySelector<HTMLButtonElement>('button')!.click();
      });

      await check(page, 'Change Ribbon props', true);
      await frames(page);

      expect(await input.evaluate((node, previous) => ({
        sameInput: node === previous.input,
        sameWrapper: node.closest('.ant-ribbon-wrapper') === previous.wrapper,
        value: (node as HTMLInputElement).value,
        selection: [
          (node as HTMLInputElement).selectionStart,
          (node as HTMLInputElement).selectionEnd
        ],
        focused: node === document.activeElement,
        count: node.parentElement!.querySelector('button')!.textContent
      }), { input: previous, wrapper })).toEqual(sample.refresh);
      await expect.poll(() => snapshot(page)).toEqual(sample.changed);

      await check(page, 'Change Ribbon props', false);
      await frames(page);

      await expect.poll(() => snapshot(page)).toEqual(sample.restored);
      await expect(input).toHaveValue('Owned draft');
      await expect(input).toBeFocused();
    });
  }
}

test('BadgeRibbon keeps text and body controls accessible through theme changes', async ({ page }) => {
  await select(page, 'rich-text');
  const body = page.getByRole('textbox', { name: 'Ribbon body draft', exact: true });
  const text = page.getByRole('textbox', { name: 'Ribbon text draft', exact: true });
  await body.fill('Body draft');
  await text.fill('Text draft');
  await text.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 4));
  const root = await page.locator('.ant-ribbon-wrapper').elementHandle();

  await check(page, 'Dark Ribbon theme', true);
  await frames(page);

  await expect(body).toHaveValue('Body draft');
  await expect(text).toHaveValue('Text draft');
  await expect(text).toBeFocused();
  expect(await text.evaluate(node => [
    (node as HTMLInputElement).selectionStart,
    (node as HTMLInputElement).selectionEnd
  ])).toEqual([1, 4]);
  expect(await page.locator('.ant-ribbon-wrapper').evaluate((node, previous) => node === previous,
    root)).toBe(true);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Ribbon text counter', exact: true })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Ribbon text counter', exact: true })).toHaveText('1');
});

test('BadgeRibbon releases its native ref and recreates caller state after unmount', async ({ page }) => {
  await select(page, 'rich-text');
  await page.getByRole('textbox', { name: 'Ribbon body draft', exact: true }).fill('Edited draft');
  await page.getByRole('button', { name: 'Ribbon text counter', exact: true }).click();

  await check(page, 'Mount Ribbon', false);

  await expect(page.locator('.ant-ribbon-wrapper')).toHaveCount(0);
  await expect(page.getByLabel('Ribbon owner ref', { exact: true })).toHaveText('empty');

  await check(page, 'Mount Ribbon', true);

  await expect(page.getByLabel('Ribbon owner ref', { exact: true })).toHaveText('mounted');
  await expect(page.getByRole('textbox', { name: 'Ribbon body draft', exact: true }))
    .toHaveValue('Seed');
  await expect(page.getByRole('button', { name: 'Ribbon text counter', exact: true })).toHaveText('0');
});
