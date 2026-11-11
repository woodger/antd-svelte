import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-components-form-reference.json' with { type: 'json' };
import type { TreeSelectComponentsFormAction } from './fixtures/tree-select-components-form-cases';
import { readTreeSelectComponentsForm } from './tree-select-components-form-metrics';

function nativeCompositeView(view: ReturnType<typeof readTreeSelectComponentsForm>) {
  // Native Input отражает унаследованный error status через aria-invalid.
  // UMD Form без ошибок валидации оставляет null; raw наблюдение сохранено.
  // Сохраняем существующий Native id help и проверяем реальный узел подсказки.
  return { ...view, aria: { ...view.aria, invalid: view.mounted ? 'true' : null,
    describedBy: view.mounted ? 'choice-help' : null },
    help: view.help.map(node => ({ ...node, id: node.id === 'choice_help' ? 'choice-help' : node.id })) };
}

async function apply(page: Page, action: TreeSelectComponentsFormAction) {
  const editor = page.getByLabel('Form component editor', { exact: true });
  if (action === 'field-focus') await page.locator('[data-form-components-focus]').dispatchEvent('click');
  else if (action === 'type-query') await editor.fill('Draft query');
  else if (action === 'open') await editor.click();
  else if (action === 'select-beta') await page.locator('[popover]:popover-open .ant-tree-title')
    .filter({ hasText: /^Beta$/ }).click();
  else await page.locator('[data-form-components-unmount]').dispatchEvent('click');
}

for (const entry of reference.cases) {
  test(`TreeSelect custom ${entry.id} preserves Form selection, association and inherited feedback`, async ({ page }) => {
    await page.goto('/?fixture=tree-select-components-form');
    await page.getByRole('combobox', { name: 'TreeSelect components Form sample', exact: true }).selectOption(entry.id);
    await expect(page.locator('[data-form-components-case]')).toHaveAttribute('data-form-components-ready', 'true');
    const read = () => page.evaluate(readTreeSelectComponentsForm);
    const values = () => page.locator('[data-form-components-native]').evaluate(form => {
      if (!(form instanceof HTMLFormElement)) throw Error('Expected native Form wrapper');
      return new FormData(form).getAll('choice');
    });
    const editor = page.getByLabel('Form component editor', { exact: true });
    const original = await editor.elementHandle();
    await expect.poll(read).toEqual(nativeCompositeView(entry.initial.view));
    expect(entry.initial.view.aria).toEqual({ required: 'true', describedBy: 'choice_help', invalid: null });
    expect(entry.initial.observed).toMatchObject({ nativeFormData: [], strictSourceRefIdentity: true, fieldErrors: [] });
    expect(await values()).toEqual(['a']);
    await expect(page.locator('[data-form-components-native] [name="choice"]')).toHaveCount(1);
    await expect(editor).not.toHaveAttribute('name');
    for (const step of entry.steps) {
      await apply(page, step.action as TreeSelectComponentsFormAction);
      await expect.poll(read, { message: step.action }).toEqual(nativeCompositeView(step.view));
      // Native successful fields хранят raw выбор; у Source нет hidden values.
      expect(step.observed.nativeFormData).toEqual([]);
      expect(step.observed.fieldErrors).toEqual([]);
      expect(await values()).toEqual(step.view.mounted ? [step.view.model] : []);
      if (step.sameEditor) expect(await editor.evaluate((node, previous) => node === previous, original)).toBe(true);
      if (step.action === 'type-query') {
        expect(step.view.model).toBe('a');
        expect(await values()).toEqual(['a']);
        await expect(page.locator('[data-form-components-native] [name="choice"]')).toHaveCount(1);
      }
      if (step.action === 'select-beta') expect(step.view.model).toBe('b');
    }
    await expect(page.locator('[data-form-components-native-refs]')).toHaveText('{"root":null,"input":null}');
    await expect(page.locator('[popover]')).toHaveCount(0);
  });
}
