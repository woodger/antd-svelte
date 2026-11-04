import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-config-reference.json' with { type: 'json' };
import { snapshotOverlayConfig } from './overlay-config-metrics';
import type { OverlayConfigCase, OverlayConfigInteraction } from './fixtures/overlay-config-presets';

test.use({ viewport: reference.viewport });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=overlay-config');
  await page.getByRole('combobox', { name: 'Config reference', exact: true }).selectOption(name);
  await expect(page.locator('#config-case')).toBeVisible();
}

const next = (page: Page) => page.getByRole('button', { name: 'Next config frame', exact: true })
  .dispatchEvent('click');

for (const sample of reference.cases as OverlayConfigCase[]) {
  test(`Overlay component config matches source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    for (const [index, expected] of sample.snapshots.entries()) {
      if (index) await next(page);

      await expect.poll(() => page.evaluate(snapshotOverlayConfig, sample.component)).toEqual(expected);
    }
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm']) {
  test(`Overlay config updates retain the open ${component}, draft, selection and focus`, async ({ page }) => {
    await select(page, `${component}-reactive-provider`);
    const input = page.getByRole('textbox', { name: 'Config draft', exact: true });
    await input.fill('Config draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 6));
    const original = await input.elementHandle();
    const prefix = component === 'tooltip' ? 'ant-tooltip' : 'ant-popover';
    const popup = await page.locator(`.${prefix}:popover-open`).elementHandle();
    const sample = reference.cases.find(sample => sample.name === `${component}-reactive-provider`)!;

    for (const expected of sample.snapshots.slice(1)) {
      await next(page);

      await expect.poll(async () => {
        const snapshot = await page.evaluate(snapshotOverlayConfig, component);
        return snapshot && { ...snapshot, input: 'Draft' };
      }).toEqual(expected);
      await expect(input).toHaveValue('Config draft');
      await expect(input).toBeFocused();
      expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
        .toEqual([2, 6]);
      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      expect(await page.locator(`.${prefix}:popover-open`)
        .evaluate((node, old) => node === old, popup)).toBe(true);
    }
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm']) {
  test(`Overlay empty source trigger keeps a programmatically open ${component} visible`, async ({ page }) => {
    await select(page, `${component}-callback-layers`);
    const anchor = page.locator('[data-config-anchor]');
    const prefix = component === 'tooltip' ? 'ant-tooltip' : 'ant-popover';
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));

    await anchor.hover();
    await page.mouse.move(0, 0);
    await anchor.focus();
    await anchor.evaluate(node => node.blur());
    await anchor.dispatchEvent('click');
    await anchor.dispatchEvent('contextmenu', { bubbles: true, cancelable: true });
    await page.clock.runFor(1000);

    await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[]');
    await expect(page.locator(`.${prefix}:popover-open`)).toBeVisible();
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm']) {
  test(`Overlay semantic callbacks retain the incoming open prop for uncontrolled ${component}`, async ({ page }) => {
    await select(page, `${component}-provider-click`);
    await page.getByLabel('Interactive config', { exact: true }).check();
    const prefix = component === 'tooltip' ? 'ant-tooltip' : 'ant-popover';

    await page.locator('[data-config-anchor]').dispatchEvent('click');

    await expect(page.locator(`.${prefix}:popover-open`)).toBeVisible();
    await expect(page.locator(`.${prefix}:popover-open`))
      .toHaveClass(/(?:^|\s)cb-open-undefined(?:\s|$)/);
    await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[true]');
  });
}

for (const sample of reference.interactions as OverlayConfigInteraction[]) {
  test(`Overlay trigger configuration preserves source event timing for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    await page.getByLabel('Interactive config', { exact: true }).check();
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    const anchor = page.locator('[data-config-anchor]');

    for (const step of sample.steps) {
      if (typeof step.action === 'number') await page.clock.runFor(step.action);
      else if (step.action === 'hover') await anchor.hover();
      else if (step.action === 'leave') await page.mouse.move(0, 0);
      else if (step.action === 'focus') await anchor.focus();
      else if (step.action === 'blur') await anchor.evaluate(node => node.blur());
      else if (step.action === 'click') await anchor.dispatchEvent('click');
      else {
        const canceled = await anchor.evaluate(node => !node.dispatchEvent(new MouseEvent('contextmenu', {
          bubbles: true, cancelable: true, clientX: 220, clientY: 190
        })));

        expect(canceled).toBe(step.canceled);
      }

      await expect(page.getByLabel('Config changes', { exact: true }))
        .toHaveText(JSON.stringify(step.changes));
    }
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm']) {
  test(`Overlay source config retains placement without a source theme for ${component}`, async ({ page }) => {
    await select(page, `${component}-provider-slots`);
    const expected = reference.cases.find(sample => sample.name === `${component}-provider-slots`)!
      .snapshots[0]!;

    await page.getByLabel('Native config theme', { exact: true }).dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotOverlayConfig, component))
      .toMatchObject({ popup: expected.popup, placement: expected.placement });
  });
}
