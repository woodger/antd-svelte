import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-expand-action-reference.json' with { type: 'json' };
import settled from './fixtures/ant-design-tree-expand-action-settled-reference.json' with { type: 'json' };
import { readTreeExpandAction } from './tree-expand-action-metrics';

const cases = [...reference.cases, ...settled.cases];
// Rapid Source double click меняет состояние без второго callback; отдельный Native case ниже.
for (const [index, entry] of cases.entries()) {
  if (entry.sample.id === 'click-double') continue;
  test(`Tree title expansion matches Source for ${entry.sample.id}`, async ({ page }) => {
    const sample = entry.sample;
    if (sample.action === 'settledDoubleClick') {
      await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
      await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
    }
    await page.goto('/?fixture=tree-expand-action');
    await page.getByRole('combobox', { name: 'Tree expansion sample', exact: true })
      .selectOption(String(index));
    const prefix = `${'prefix' in sample && sample.prefix ? sample.prefix : 'ant'}-tree`;
    const target = page.getByText('Root', { exact: true });
    const modifier = 'modifier' in sample ? sample.modifier : undefined;
    const modifiers: ('Control' | 'Meta' | 'Shift')[] =
      modifier === 'Control' || modifier === 'Meta' || modifier === 'Shift' ? [modifier] : [];
    // Native ARIA disabled сохраняется; физический клик, как в Source, всё ещё раскрывает ветку.
    const force = Boolean('disabled' in sample && sample.disabled
      || 'nodeDisabled' in sample && sample.nodeDisabled);
    const options = { modifiers, force };

    await expect.poll(() => page.evaluate(readTreeExpandAction, prefix)).toEqual(entry.initial);

    if (sample.action === 'settledDoubleClick') {
      await target.click(options);
      await page.clock.runFor(100);
      await target.click(options);
      await page.clock.runFor(100);
      await target.dispatchEvent('dblclick', { bubbles: true, detail: 2 });
      await page.clock.runFor(100);
    } else if (sample.action === 'doubleClick') await target.dblclick(options);
    else await target.click(options);

    await expect.poll(() => page.evaluate(readTreeExpandAction, prefix)).toEqual(entry.result);
    if ('repeated' in entry && entry.repeated) {
      await target.click(options);

      await expect.poll(() => page.evaluate(readTreeExpandAction, prefix)).toEqual(entry.repeated);
    }
  });
}

test('Tree rapid title double click reports every state change instead of the Source dropped callback',
  async ({ page }) => {
    await page.goto('/?fixture=tree-expand-action');
    const index = cases.findIndex(entry => entry.sample.id === 'click-double');
    await page.getByRole('combobox', { name: 'Tree expansion sample', exact: true })
      .selectOption(String(index));

    await page.getByText('Root', { exact: true }).dblclick();

    await expect.poll(() => page.evaluate(readTreeExpandAction, 'ant-tree'))
      .toEqual(settled.cases[0].result);
  });

test('Tree title action updates preserve nodes, selection, focus and an outside draft',
  async ({ page }) => {
    await page.goto('/?fixture=tree-expand-action');
    await page.getByRole('combobox', { name: 'Tree expansion sample', exact: true })
      .selectOption(String(cases.findIndex(entry => entry.sample.id === 'click')));
    const title = page.getByText('Root', { exact: true });
    const oldTitle = await title.elementHandle();
    await title.click();
    const editor = page.getByRole('textbox', { name: 'Tree title editor', exact: true });
    await editor.fill('Retained draft');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));

    await page.getByRole('button', { name: 'Toggle Tree title action', exact: true })
      .evaluate((node: HTMLButtonElement) => node.click());

    expect(await title.evaluate((node, old) => node === old, oldTitle)).toBe(true);
    await expect(page.locator('.ant-tree-node-selected')).toHaveText('Root');
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue('Retained draft');
    expect(await editor.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
    await expect(page.getByRole('combobox', { name: 'Tree title action', exact: true }))
      .toHaveValue('doubleClick');
  });
