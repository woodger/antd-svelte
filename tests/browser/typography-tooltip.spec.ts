import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-typography-tooltip-reference.json' with { type: 'json' };
import { snapshotTypographyTooltip } from './typography-tooltip-metrics';
import type { OverlayConfigInteraction } from './fixtures/overlay-config-presets';

test.use({ viewport: reference.viewport });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=typography-tooltip');
  await page.getByRole('combobox', { name: 'Typography tooltip reference', exact: true })
    .selectOption(name);
  await expect(page.locator('[data-config-anchor]')).toBeVisible();
}

const next = (page: Page) => page.getByRole('button', {
  name: 'Next Typography tooltip frame', exact: true
}).dispatchEvent('click');

async function prepare(page: Page, name: string) {
  await select(page, name);
  await page.getByLabel('Prepare Typography measurement', { exact: true }).dispatchEvent('click');
  if (!name.startsWith('controlled-')) {
    await page.getByLabel('Interactive Typography tooltip', { exact: true }).dispatchEvent('click');
  }
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.clock.runFor(100);

  // Native CSS ellipsis измеряется при mouseenter, отдельно от Tooltip trigger.
  await page.locator('[data-config-anchor]').hover();
  await page.clock.runFor(300);
  await page.mouse.move(0, 0);
  await page.clock.runFor(300);
  await page.getByLabel('Prepare Typography measurement', { exact: true }).dispatchEvent('click');
  await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[]');
}

for (const sample of reference.cases) {
  test(`Typography Tooltip matches source defaults and semantics for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    await page.locator('[data-config-anchor]').hover();

    for (const [step, expected] of sample.snapshots.entries()) {
      if (step) await next(page);

      await expect.poll(() => page.evaluate(snapshotTypographyTooltip, 'ant-tooltip')).toEqual(expected);
    }
  });
}

for (const sample of reference.interactions as OverlayConfigInteraction[]) {
  test(`Typography Tooltip preserves source event timing for ${sample.name}`, async ({ page }) => {
    await prepare(page, sample.name);
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

for (const name of ['provider-click', 'provider-contextMenu', 'body-click']) {
  test(`Typography Tooltip opens the measured text and preserves popup input for ${name}`, async ({ page }) => {
    await prepare(page, name);
    const anchor = page.locator('[data-config-anchor]');
    await anchor.dispatchEvent(name === 'provider-contextMenu' ? 'contextmenu' : 'click');
    await page.clock.runFor(100);
    const popup = page.getByRole('tooltip');
    const input = page.getByRole('textbox', { name: 'Config draft', exact: true });

    await expect(popup).toBeVisible();
    await expect(popup).toHaveClass(/(?:^|\s)cb-open-undefined(?:\s|$)/);
    await input.fill('Typography draft');
    await input.dispatchEvent('click');
    await input.dispatchEvent('contextmenu', { bubbles: true, cancelable: true });

    await expect(popup).toBeVisible();
    await expect(input).toHaveValue('Typography draft');
    await expect(input).toBeFocused();
    await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[true]');
    expect(await popup.evaluate(node => node.parentElement === document.body))
      .toBe(name === 'body-click');

    await anchor.dispatchEvent('click');
    await expect(popup).toBeHidden();
    await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[true,false]');
  });
}

for (const name of ['reactive-provider', 'reactive-local']) {
  test(`Typography Tooltip updates retain popup, draft, selection and focus for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.locator('[data-config-anchor]').hover();
    const input = page.getByRole('textbox', { name: 'Config draft', exact: true });
    await input.fill('Typography draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));
    const original = await input.elementHandle();
    const popup = await page.getByRole('tooltip').elementHandle();
    const sample = reference.cases.find(sample => sample.name === name)!;

    for (const expected of sample.snapshots.slice(1)) {
      await next(page);

      await expect.poll(async () => {
        const snapshot = await page.evaluate(snapshotTypographyTooltip, 'ant-tooltip');
        return snapshot && { ...snapshot, input: 'Draft' };
      }).toEqual(expected);
      await expect(input).toHaveValue('Typography draft');
      await expect(input).toBeFocused();
      expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
        .toEqual([2, 7]);
      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      expect(await page.getByRole('tooltip').evaluate((node, old) => node === old, popup)).toBe(true);
    }

    await page.getByRole('button', { name: 'Toggle Typography tooltip', exact: true })
      .dispatchEvent('click');

    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });
}

test('Typography Tooltip keeps the popup hidden for text that fits despite raw open callbacks', async ({ page }) => {
  await prepare(page, 'short');

  await page.locator('[data-config-anchor]').dispatchEvent('click');
  await page.clock.runFor(1000);

  await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[true]');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('Typography Tooltip closes on blur even when the focused popup remains inside the text DOM', async ({ page }) => {
  await prepare(page, 'provider-focus');
  await page.locator('[data-config-anchor]').focus();
  await page.clock.runFor(100);
  await expect(page.getByRole('tooltip')).toBeVisible();

  await page.getByRole('textbox', { name: 'Config draft', exact: true }).focus();

  await expect(page.getByRole('tooltip')).toBeHidden();
  await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[true,false]');
});

test('Typography Tooltip cancels a pending hover opening when its target is removed', async ({ page }) => {
  await prepare(page, 'provider-hover');
  await page.locator('[data-config-anchor]').hover();
  await page.clock.runFor(199);
  await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[]');

  await page.getByRole('button', { name: 'Toggle Typography tooltip', exact: true })
    .dispatchEvent('click');
  await page.clock.runFor(1000);

  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

for (const name of ['provider-focus', 'js-focus']) {
  test(`Typography Tooltip preserves the initial ellipsis measurement boundary for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.getByLabel('Interactive Typography tooltip', { exact: true }).dispatchEvent('click');

    await page.locator('[data-config-anchor]').focus();

    await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[true]');
    if (name === 'js-focus') await expect(page.getByRole('tooltip')).toBeVisible();
    else {
      await expect(page.getByRole('tooltip')).toHaveCount(0);

      await page.locator('[data-config-anchor]').hover();

      await expect(page.getByRole('tooltip')).toBeVisible();
      await expect(page.getByLabel('Config changes', { exact: true })).toHaveText('[true]');
    }
  });
}

test('Typography Tooltip removes a focused target without reopening after deferred blur', async ({ page }) => {
  await prepare(page, 'provider-focus');
  await page.locator('[data-config-anchor]').focus();
  await page.clock.runFor(100);
  await expect(page.getByRole('tooltip')).toBeVisible();

  await page.getByRole('button', { name: 'Toggle Typography tooltip', exact: true })
    .dispatchEvent('click');
  await page.clock.runFor(1000);

  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await expect(page.locator('[data-config-anchor]')).toHaveCount(0);
});

for (const action of ['Copy text', 'Edit text']) {
  for (const trigger of ['hover', 'focus', 'contextMenu']) {
    test(`Typography ${action} Tooltip inherits the ${trigger} trigger and delays`, async ({ page }) => {
      await select(page, `provider-${trigger}`);
      await page.getByLabel('Typography action tooltips', { exact: true }).dispatchEvent('click');
      await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
      await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
      const button = page.getByRole('button', { name: action, exact: true });
      const popup = page.getByRole('tooltip');

      if (trigger === 'hover') {
        await button.hover();
        await page.clock.runFor(199);
        await expect(popup).toHaveCount(0);

        await page.clock.runFor(21);
      } else if (trigger === 'focus') {
        await button.focus();
        await page.clock.runFor(20);
      } else {
        const canceled = await button.evaluate(node => !node.dispatchEvent(new MouseEvent('contextmenu', {
          bubbles: true, cancelable: true
        })));
        expect(canceled).toBe(true);
        await page.clock.runFor(20);
      }

      await expect(popup).toBeVisible();
      await expect(popup).toHaveText(action);
      await expect(popup).toHaveClass(new RegExp(`(?:^|\\s)cb-trigger-${trigger}(?:\\s|$)`));
      await expect(popup).toHaveClass(/(?:^|\s)cb-enter-0.2(?:\s|$)/);
      await expect(popup).toHaveClass(/(?:^|\s)cb-leave-0.3(?:\s|$)/);
      await expect(page.getByLabel('Typography action events', { exact: true })).toBeEmpty();

      if (trigger === 'hover') {
        await page.mouse.move(0, 0);
        await page.clock.runFor(299);
        await expect(popup).toBeVisible();
        await page.clock.runFor(1);
      } else if (trigger === 'focus') {
        await page.getByRole('button', { name: 'After Typography tooltip', exact: true }).focus();
      } else await button.dispatchEvent('contextmenu', { bubbles: true, cancelable: true });

      await expect(popup).toBeHidden();
      await expect(page.getByLabel('Typography action events', { exact: true })).toBeEmpty();
    });
  }
}

test('Typography inherited click Tooltip preserves copy and updates the success title', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await select(page, 'provider-click');
  await page.getByLabel('Typography action tooltips', { exact: true }).dispatchEvent('click');

  await page.getByRole('button', { name: 'Copy text', exact: true }).click();

  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(page.getByRole('tooltip')).toHaveText('Copied text');
  await expect(page.getByLabel('Typography action events', { exact: true })).toHaveText('copy');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Action text');

  await page.getByRole('button', { name: 'Copied text', exact: true }).click();

  await expect(page.getByRole('tooltip')).toBeHidden();
  await expect(page.getByLabel('Typography action events', { exact: true })).toHaveText('copy|copy');
});

test('Typography inherited click Tooltip preserves editing and releases its removed target', async ({ page }) => {
  await select(page, 'provider-click');
  await page.getByLabel('Typography action tooltips', { exact: true }).dispatchEvent('click');

  await page.getByRole('button', { name: 'Edit text', exact: true }).click();

  await expect(page.locator('.ant-typography-edit-content textarea')).toBeFocused();
  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveValue('Action text');
  await expect(page.getByLabel('Typography action events', { exact: true })).toHaveText('edit');
  await expect(page.getByRole('tooltip')).toHaveCount(0);

  await page.locator('.ant-typography-edit-content textarea').press('Escape');

  await expect(page.getByRole('button', { name: 'Edit text', exact: true })).toBeFocused();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});
