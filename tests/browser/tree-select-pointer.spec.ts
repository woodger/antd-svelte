import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-pointer-reference.json' with { type: 'json' };
import { treeSelectPointerSamples, type TreeSelectPointerAction, type TreeSelectPointerSample } from './fixtures/tree-select-pointer-cases';
import { readTreeSelectPointer } from './tree-select-pointer-metrics';

test.use({ viewport: reference.reference.viewport, hasTouch: true });
async function apply(page: Page, sample: TreeSelectPointerSample, action: TreeSelectPointerAction) {
  const root = page.locator('[data-pointer-control] .ant-select').first();
  const input = page.getByRole('combobox', { name: 'Pointer selection', exact: true });
  if (action === 'focus') await input.focus();
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside pointer', exact: true }).click();
  else if (action === 'query') await input.fill('Al');
  else if (action === 'caret') await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 1));
  else if (action === 'clear-click') await root.locator('.ant-select-clear').dispatchEvent('click');
  else if (action === 'node-mousedown') await root.locator('.ant-select-dropdown [class*="-node-content-wrapper"]').filter({ hasText: 'Alpha' }).first().dispatchEvent('mousedown');
  else if (action === 'draft') await page.getByRole('textbox', { name: 'Pointer draft', exact: true }).click();
  else if (action === 'touch-cancel' || action === 'touch-scroll') {
    const box = (await root.boundingBox())!;
    const point = { x: box.x + 1, y: box.y + box.height / 2, id: 1 };
    const cdp = await page.context().newCDPSession(page);
    try {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
      if (action === 'touch-scroll') {
        for (const delta of [20, 40, 80]) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, y: point.y + delta }] });
        }
      }
      await cdp.send('Input.dispatchTouchEvent', { type: action === 'touch-cancel' ? 'touchCancel' : 'touchEnd', touchPoints: [] });
    } finally { await cdp.detach(); }
  } else {
    const target = action === 'root' ? root : action === 'content' ? root.locator('.ant-select-content')
      : action === 'prefix' ? root.locator('[data-pointer-prefix]')
        : action === 'suffix' ? root.locator('.ant-select-suffix')
          : action === 'clear-pointer' ? root.locator('.ant-select-clear')
            : action === 'label' && await root.locator('[data-pointer-label]').count()
              ? root.locator('[data-pointer-label]').first() : input;
    const box = (await target.boundingBox())!;
    const point = action === 'root' ? { x: box.x + 1, y: box.y + box.height / 2 }
      : action === 'content' || action === 'input' ? { x: box.x + 1, y: box.y + 1 }
        : { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    if (sample.touch) await page.touchscreen.tap(point.x, point.y);
    else await page.mouse.click(point.x, point.y);
  }
}
for (const entry of reference.cases) {
  test(`TreeSelect pointer follows Source for ${entry.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-select-pointer');
    await page.getByRole('combobox', { name: 'TreeSelect pointer sample', exact: true }).selectOption(entry.id);
    await expect(page.locator('[data-pointer-refs]')).toHaveAttribute('data-pointer-refs', 'true');
    await page.mouse.move(0, 0);
    const sample = treeSelectPointerSamples.find(sample => sample.id === entry.id)!;
    const read = () => page.evaluate(readTreeSelectPointer);
    await expect.poll(read).toEqual(entry.initial);
    const input = page.getByRole('combobox', { name: 'Pointer selection', exact: true });
    const root = page.locator('[data-pointer-control] .ant-select').first();
    let previous = await input.elementHandle();
    const originalRoot = await root.elementHandle();
    for (const step of entry.steps) {
      await apply(page, sample, step.action as TreeSelectPointerAction);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
      expect(await input.evaluate((node, old) => node === old, previous)).toBe(step.sameInput);
      expect(await root.evaluate((node, old) => node === old, originalRoot)).toBe(true);
      previous = await input.elementHandle();
    }
  });
}
