import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-input-responsive-reference.json' with { type: 'json' };
import type { TreeSelectInputResponsiveAction } from './fixtures/tree-select-input-responsive-cases';
import { readTreeSelectInputResponsive } from './tree-select-input-responsive-metrics';

async function act(page: Page, action: TreeSelectInputResponsiveAction) {
  if (action.type === 'resize' || action.type === 'prefix-resize') {
    await page.locator('[data-input-responsive-update]').evaluate((node, detail) => {
      node.dispatchEvent(new CustomEvent('fixtureupdate', { detail }));
    }, action);
  } else await page.locator('[data-input-responsive-editor]').fill(action.type === 'clear' ? '' : action.text!);
}
for (const entry of reference.cases) {
  // Source absolute suffix может shrink-to-fit до136px у fragment; Native
  // сохраняет normal flow173px. Проверяем responsive selection, не pixel parity.
  test(`TreeSelect reserves the entire responsive custom input suffix for ${entry.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-select-input-responsive');
    await page.getByRole('combobox', { name: 'Responsive custom input sample', exact: true }).selectOption(entry.id);
    await expect(page.locator('[data-input-responsive-case]')).toHaveAttribute('data-input-responsive-bound', 'true');
    const field = page.locator('[data-input-responsive-editor]');
    const original = await field.elementHandle();
    for (const step of entry.steps) {
      await act(page, step.action as TreeSelectInputResponsiveAction);
      await expect.poll(() => page.evaluate(readTreeSelectInputResponsive), { message: JSON.stringify(step.action) }).toEqual(step.view);
      expect(await field.evaluate((node, previous) => node === previous, original)).toBe(step.sameEditor);
    }
  });
}
