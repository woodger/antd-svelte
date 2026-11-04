import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-prefix-reference.json' with { type: 'json' };
import { snapshotOverlayPrefix, snapshotOverlayPrefixTriggers } from './overlay-prefix-metrics';
import type { OverlayConfigCase, OverlayConfigValues } from './fixtures/overlay-config-presets';

test.use({ viewport: reference.viewport });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=overlay-prefix');
  await page.getByRole('combobox', { name: 'Prefix reference', exact: true }).selectOption(name);
  if (name.startsWith('typography-')) {
    await expect(page.locator('[data-config-anchor]')).toBeVisible();
    await page.locator('[data-config-anchor]').hover();
  } else await expect(page.locator('#config-case')).toBeVisible();
}

const next = (page: Page) => page.getByRole('button', { name: 'Next prefix frame', exact: true })
  .dispatchEvent('click');

function values(sample: OverlayConfigCase, step: number) {
  const value: OverlayConfigValues = Object.assign({}, sample, ...(sample.frames?.slice(0, step) ?? []));
  return { component: sample.component, prefixCls: value.local?.prefixCls };
}

for (const sample of reference.cases as OverlayConfigCase[]) {
  test(`Overlay prefix matches source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    for (const [step, expected] of sample.snapshots.entries()) {
      if (step) await next(page);

      await expect.poll(() => page.evaluate(snapshotOverlayPrefix, values(sample, step)))
        .toEqual(expected);
      const source = reference.cases.find(value => value.name === sample.name)!;
      await expect.poll(() => page.evaluate(snapshotOverlayPrefixTriggers, sample.component))
        .toEqual(source.triggerSnapshots[step]);
    }
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm', 'avatar-group', 'typography']) {
  test(`Overlay prefix updates retain the open ${component}, draft, selection and focus`, async ({ page }) => {
    const sample = reference.cases.find(sample => sample.name === `${component}-reactive`)!;
    await select(page, sample.name);
    const input = page.getByRole('textbox', { name: 'Config draft', exact: true });
    await input.fill('Prefix draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 6));
    const original = await input.elementHandle();
    const popup = await page.locator('[popover]:popover-open').elementHandle();

    for (let step = 1; step < sample.snapshots.length; step++) {
      await next(page);

      await expect.poll(() => page.evaluate(snapshotOverlayPrefix, values(sample as OverlayConfigCase, step)))
        .toEqual(sample.snapshots[step]);
      await expect(input).toHaveValue('Prefix draft');
      await expect(input).toBeFocused();
      expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
        .toEqual([1, 6]);
      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      expect(await page.locator('[popover]:popover-open')
        .evaluate((node, old) => node === old, popup)).toBe(true);
    }

    await page.getByRole('button', { name: 'Toggle prefix component', exact: true })
      .dispatchEvent('click');

    await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
    await expect(page.locator('style[data-ant-svelte-theme*="-prefix:"]')).toHaveCount(0);
  });
}

for (const name of ['slider-reactive', 'slider-range-reactive']) {
  test(`Slider prefixes reach active handles and retain focus for ${name}`, async ({ page }) => {
    const sample = reference.cases.find(sample => sample.name === name)!;
    await select(page, name);
    await page.getByLabel('Active prefix slider', { exact: true }).dispatchEvent('click');
    const handles = page.locator('#config-case').getByRole('slider');

    await handles.first().focus();

    for (const [step, expected] of sample.snapshots.entries()) {
      if (step) await next(page);

      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await expect.poll(() => page.evaluate(snapshotOverlayPrefix, values(sample as OverlayConfigCase, step)))
        .toEqual([expected![0]]);
      await expect(handles.first()).toBeFocused();
    }

    if (name === 'slider-range-reactive') {
      await handles.last().focus();

      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await expect.poll(() => page.evaluate(snapshotOverlayPrefix, values(sample as OverlayConfigCase,
        sample.snapshots.length - 1))).toEqual([sample.snapshots.at(-1)![0]]);
    }
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm']) {
  for (const theme of ['dark', 'compact']) {
    test(`Overlay prefixes preserve native ${theme} paints for ${component}`, async ({ page }) => {
      await select(page, `${component}-native-${theme}`);
      await page.getByLabel('Native prefix theme', { exact: true }).dispatchEvent('click');
      const prefix = component === 'tooltip' ? 'ant-tooltip' : 'ant-popover';
      const popup = page.locator('[popover]:popover-open');
      const paint = () => popup.locator('[data-ant-tooltip-container],[data-ant-popover-container]')
        .evaluate(node => {
          const style = getComputedStyle(node);
          return { color: style.color, background: style.backgroundColor,
            fontSize: style.fontSize, lineHeight: style.lineHeight, padding: style.padding };
        });
      await expect(popup).toHaveClass(new RegExp(`(?:^|\\s)${prefix}(?:\\s|$)`));
      const before = await paint();

      await next(page);

      await expect(popup).toHaveClass(new RegExp(`tenant-native-${component}`));
      await expect.poll(paint).toEqual(before);
    });
  }
}

test('Popover prefixes preserve native title bounds on a narrow viewport', async ({ page }) => {
  await select(page, 'popover-native-constraints');
  await page.getByLabel('Natural prefix layout', { exact: true }).dispatchEvent('click');
  await page.getByLabel('Native prefix theme', { exact: true }).dispatchEvent('click');
  await page.setViewportSize({ width: 300, height: 400 });
  const title = page.locator('[data-ant-popover-title]');
  await expect(title).toHaveCSS('min-width', '252px');

  await next(page);

  await expect(title).toHaveCSS('min-width', '252px');
  const bounds = await title.boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(252);
});

for (const name of ['avatar-group-custom', 'avatar-group-portal']) {
  test(`AvatarGroup custom popup prefixes restore a neighbor after unmount for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.getByRole('textbox', { name: 'Config draft', exact: true }).focus();

    await page.getByRole('button', { name: 'Toggle prefix component', exact: true })
      .dispatchEvent('click');

    await expect(page.getByRole('button', { name: 'After prefix component', exact: true }))
      .toBeFocused();
  });
}

for (const sample of reference.cases.filter(sample => sample.name.endsWith('-portal'))) {
  test(`Overlay custom prefix retains its theme in body portal for ${sample.component}`, async ({ page }) => {
    await select(page, sample.name);
    const popup = page.locator('[popover]:popover-open');

    expect(await popup.evaluate(node => node.parentElement === document.body)).toBe(true);
    await expect.poll(() => page.evaluate(snapshotOverlayPrefix, values(sample as OverlayConfigCase, 0)))
      .toEqual(sample.snapshots[0]);
  });
}

test('Typography Tooltip semantic callbacks receive its native defaults and incoming open', async ({ page }) => {
  await select(page, 'typography-custom');
  const sample = reference.cases.find(sample => sample.name === 'typography-custom')!;

  await expect.poll(() => page.getByRole('tooltip').evaluate(node => [...node.classList]
    .filter(name => name.startsWith('cb-')).sort())).toEqual(sample.callbackClasses);
});
