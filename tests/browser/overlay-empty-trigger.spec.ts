import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-empty-trigger-reference.json' with { type: 'json' };
import { snapshotOverlayLifecycle } from './overlay-lifecycle-metrics';

test.use({ viewport: reference.viewport });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=overlay-lifecycle');
  await page.getByRole('combobox', { name: 'Lifecycle reference', exact: true }).selectOption(name);
  await expect(page.locator('[data-lifecycle-anchor]')).toBeVisible();
  await page.clock.install();
  await page.locator('[data-lifecycle-anchor]').hover();
  await page.clock.runFor(1000);
}

for (const sample of reference.cases) {
  test(`Empty local trigger preserves the source event behavior for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    const anchor = page.locator('[data-lifecycle-anchor]');
    const input = page.getByLabel('Lifecycle draft', { exact: true });

    for (const step of sample.steps) {
      if (step.action === 'unmount') {
        await page.getByRole('button', { name: 'Toggle lifecycle component', exact: true })
          .dispatchEvent('click');
      } else if (step.action === 'leave') await page.mouse.move(0, 0);
      else if (step.action === 'focus') await anchor.focus();
      else if (step.action === 'blur') await anchor.evaluate(node => node.blur());
      else if (step.action === 'popupHover') await input.hover();
      else if (step.action === 'popupFocus') await input.focus();
      else if (step.action === 'popupBlur') await input.evaluate(node => node.blur());
      else if (step.action === 'click') await anchor.dispatchEvent('click');
      else if (step.action === 'contextMenu') {
        const canceled = await anchor.evaluate(node => !node.dispatchEvent(new MouseEvent('contextmenu', {
          bubbles: true, cancelable: true
        })));

        expect(canceled).toBe(step.canceled);
      } else if (step.action === 'popupClick') {
        await page.getByRole('button', { name: 'Lifecycle count', exact: true }).dispatchEvent('click');
      }
      await page.clock.runFor(1000);

      await expect.poll(() => page.evaluate(snapshotOverlayLifecycle)).toEqual(step.snapshot);
      await expect(page.getByLabel('Lifecycle events', { exact: true }))
        .toHaveText(JSON.stringify(step.changes));
    }
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm', 'typography', 'avatar-group']) {
  for (const action of ['escape', 'outside']) {
    test(`Empty ${component} trigger retains native ${action} dismissal`, async ({ page }) => {
      await select(page, `empty-${component}-controlled`);
      const input = page.getByLabel('Lifecycle draft', { exact: true });
      await input.focus();
      await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[]');

      if (action === 'escape') await page.keyboard.press('Escape');
      else await page.getByRole('button', { name: 'After lifecycle popup', exact: true }).click();
      await page.clock.runFor(1000);

      await expect.poll(async () => (await page.evaluate(snapshotOverlayLifecycle)).visible).toBe(0);
      await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[false]');
      if (action === 'outside') {
        await expect(page.getByRole('button', { name: 'After lifecycle popup', exact: true }))
          .toBeFocused();
      } else if (['popover', 'popconfirm', 'avatar-group'].includes(component)) {
        await expect(page.locator('[data-lifecycle-anchor]')).toBeFocused();
      }
    });
  }
}
