import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-input-reference.json' with { type: 'json' };
import type { TreeSelectInputAction } from './fixtures/tree-select-input-cases';
import { treeSelectInputSamples } from './fixtures/tree-select-input-cases';
import { readTreeSelectInput } from './tree-select-input-metrics';
import { nativeTreeSelectInputView } from './tree-select-input-native';

async function act(page: Page, action: TreeSelectInputAction) {
  const field = page.locator('[data-tree-select-input-case] input,[data-tree-select-input-case] textarea');
  if (action.type === 'click') await field.click();
  else if (action.type === 'focus') await field.focus();
  else if (action.type === 'fill') await field.fill(action.text!);
  else if (action.type === 'key') await field.press(action.text!);
  else if (action.type === 'ref-focus') await page.locator('[data-input-ref-focus]').dispatchEvent('click');
  else if (action.type === 'ref-blur') await page.locator('[data-input-ref-blur]').dispatchEvent('click');
  else if (action.type === 'prefix-click') await page.locator('[data-input-prefix]').click();
  else if (action.type === 'outside') await page.getByRole('button', { name: 'Outside input tree', exact: true }).click();
  else if (action.type === 'composition-start') await field.dispatchEvent('compositionstart', { data: '' });
  else if (action.type === 'composition-end') await field.dispatchEvent('compositionend', { data: '' });
  else if (action.type === 'paste') await field.evaluate((node, text) => {
    const data = new DataTransfer();
    data.setData('text', text!);
    node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  }, action.text);
  else if (action.type === 'update') await page.locator('[data-input-update]').evaluate((node, patch) => {
    node.dispatchEvent(new CustomEvent('fixtureupdate', { detail: patch }));
  }, action.update);
}
for (const entry of reference.cases) {
  test(`TreeSelect components.input follows Source for ${entry.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-select-input');
    await page.getByRole('combobox', { name: 'TreeSelect input sample', exact: true }).selectOption(entry.id);
    await expect(page.locator('[data-input-refs]')).toHaveAttribute('data-input-refs', 'true');
    const sample = treeSelectInputSamples.find(sample => sample.id === entry.id)!;
    const read = () => page.evaluate(readTreeSelectInput);
    async function verify(view: ReturnType<typeof readTreeSelectInput>) {
      // Native связывает поле со своим Tree, включая его active descendant.
      // UMD callbacks сравниваются с явной Native границей noncancelable events;
      // own attrs и cancelable события остаются сырыми.
      await expect(async () => {
        const actual = await read();
        const tree = page.locator('[role="tree"]');
        const descendant = await tree.count() ? await tree.getAttribute('aria-activedescendant') : null;
        expect(actual).toEqual(nativeTreeSelectInputView(view, sample, descendant));
      }).toPass({ timeout: 5000 });
    }
    await verify(entry.initial.view);
    if (entry.id === 'empty-label' || entry.id === 'blank-label') {
      expect(entry.initial.view.selected).toBe('a');
      expect(entry.initial.view.hasValue).toBe(false);
      await expect(page.locator('[data-tree-select-input-case] .ant-select-content'))
        .not.toHaveClass(/\bant-select-content-has-value\b/);
    }
    await expect(page.locator('[data-input-bound-refs]')).toHaveText(JSON.stringify({ nativeTag: entry.initial.refs.nativeTag,
      nativeIsEditor: entry.initial.refs.nativeIsEditor, nativeContainsEditor: entry.initial.refs.nativeContainsEditor }));
    const field = page.locator('[data-tree-select-input-case] input,[data-tree-select-input-case] textarea');
    const original = await field.elementHandle();
    for (const step of entry.steps) {
      await act(page, step.action as TreeSelectInputAction);
      await verify(step.view);
      expect(await field.evaluate((node, old) => node === old, original)).toBe(step.sameInput);
    }
  });
}

for (const id of ['multiple-input', 'multiple-textarea']) {
  test(`TreeSelect measures custom ${id} search width without responsive tags`, async ({ page }) => {
    const source = reference.cases.find(entry => entry.id === id)!;
    const filled = source.steps.find(step => step.action.type === 'fill' && Reflect.get(step.action, 'text') === 'Beta')!;
    const initialWidth = Reflect.get(source.initial.props!.style, '--select-input-width');
    const filledWidth = Reflect.get(filled.props!.style, '--select-input-width');
    if (typeof initialWidth !== 'number' || typeof filledWidth !== 'number')
      throw new TypeError(`Source width metadata must be numeric for ${id}`);
    expect(initialWidth).toBeGreaterThanOrEqual(4);
    expect(filledWidth).toBeGreaterThan(initialWidth);
    await page.goto('/?fixture=tree-select-input');
    await page.getByRole('combobox', { name: 'TreeSelect input sample', exact: true }).selectOption(id);
    const field = page.locator('[data-tree-select-input-case] input,[data-tree-select-input-case] textarea');
    const read = () => field.evaluate(node => ({ variable: node.style.getPropertyValue('--select-input-width'),
      width: getComputedStyle(node).width, inlineWidth: node.style.width }));
    const expected = (width: number) => ({ variable: String(width), width: `${width}px`, inlineWidth: '' });
    await expect.poll(read).toEqual(expected(initialWidth));
    await field.fill('Beta');
    await expect.poll(read).toEqual(expected(filledWidth));
    await field.fill('');
    await expect.poll(read).toEqual(expected(initialWidth));
  });
}

async function lifecycle(page: Page) {
  await page.goto('/?fixture=tree-select-input');
  await page.getByRole('combobox', { name: 'TreeSelect input sample', exact: true }).selectOption('native-lifecycle');
  await expect(page.locator('[data-input-lifecycle]')).toHaveAttribute('data-input-lifecycle-refs', 'true');
}
test('TreeSelect retains the current input registration after a replaced editor releases its stale ref', async ({ page }) => {
  await lifecycle(page);
  const field = page.getByRole('combobox', { name: 'Input lifecycle', exact: true });
  const previous = await field.elementHandle();
  await page.locator('[data-input-replace]').click();
  await expect(field).toHaveAttribute('id', 'input-lifecycle-1');
  await expect(page.locator('[data-input-lifecycle-deferred]')).toHaveText('true');
  expect(await field.evaluate((node, old) => node === old, previous)).toBe(false);
  await page.locator('[data-input-cleanup]').click();
  await expect(page.locator('[data-input-lifecycle-editor]')).toHaveText('input-lifecycle-1');
  await page.locator('[data-input-focus]').dispatchEvent('click');
  await expect(field).toBeFocused();
  await field.fill('Beta');
  await expect(field).toHaveValue('Beta');
  await expect(page.locator('[data-input-lifecycle-root]')).toHaveText('DIV');
});
test('TreeSelect rebinds the fallback editor and resets a custom editor with its Form item', async ({ page }) => {
  await lifecycle(page);
  const field = page.getByRole('combobox', { name: 'Input lifecycle', exact: true });
  const original = await field.elementHandle();
  await page.locator('[data-input-set]').click();
  await expect(page.locator('[data-input-lifecycle-model]')).toHaveText('"b"');
  await page.locator('[data-input-reset]').click();
  await expect(page.locator('[data-input-lifecycle]')).toHaveAttribute('data-input-lifecycle-refs', 'true');
  await expect(page.locator('[data-input-lifecycle-model]')).toHaveText('"a"');
  expect(await field.evaluate((node, old) => node === old, original)).toBe(false);
  const custom = await field.elementHandle();
  await page.locator('[data-input-remove]').click();
  await expect(field).toHaveValue('Alpha');
  expect(await field.evaluate((node, old) => node === old, custom)).toBe(false);
  await page.locator('[data-input-cleanup]').click();
  await page.locator('[data-input-focus]').dispatchEvent('click');
  await expect(field).toBeFocused();
  await expect(page.locator('[data-input-lifecycle]')).toHaveAttribute('data-input-lifecycle-refs', 'true');
});
test('TreeSelect unmount releases custom refs and cancels an input blur close already waiting to run', async ({ page }) => {
  await lifecycle(page);
  const field = page.getByRole('combobox', { name: 'Input lifecycle', exact: true });
  await field.click();
  await field.evaluate(node => {
    (node as HTMLInputElement).blur();
    document.querySelector<HTMLButtonElement>('[data-input-unmount]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(field).toHaveCount(0);
  await expect(page.locator('[data-input-lifecycle]')).toHaveAttribute('data-input-lifecycle-refs', 'false');
  await expect(page.locator('[data-input-lifecycle-editor]')).toHaveText('');
  await expect(page.locator('[data-input-lifecycle-root]')).toHaveText('');
  await expect(page.locator('[popover]')).toHaveCount(0);
  await expect(page.locator('[data-input-lifecycle-events]')).toHaveText('[["open",true]]');
});
