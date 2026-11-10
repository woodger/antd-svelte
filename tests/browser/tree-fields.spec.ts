import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-fields-reference.json' with { type: 'json' };
import { readTreeFields } from './tree-fields-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Tree fields preserve Source data, state and events for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=tree-fields');
      await page.getByRole('combobox', { name: 'Tree fields sample', exact: true })
        .selectOption(String(index));
      const prefix = `${'prefix' in entry.sample ? entry.sample.prefix : 'ant'}-tree`;

      await expect.poll(() => page.evaluate(readTreeFields, prefix)).toEqual(entry.initial);

      for (const step of entry.steps) {
        const action = step.action;
        if (action.kind === 'schema') {
          await page.getByRole('button', { name: 'Change schema and data', exact: true }).click();
        } else if (action.kind === 'resolve') {
          await page.getByRole('button', { name: 'Resolve field load', exact: true }).click();
        } else if ('title' in action && typeof action.title === 'string') {
          const title = page.getByText(action.title, { exact: true });
          if (action.kind === 'select') {
            await title.click({
              modifiers: 'modifier' in action && action.modifier === 'Shift' ? ['Shift']
                : 'modifier' in action && action.modifier === 'Control' ? ['Control'] : []
            });
          } else {
            await title.locator('..').locator('..')
              .locator(`.${prefix}-${action.kind === 'check' ? 'checkbox' : 'switcher'}`)
              .first().click();
          }
        }

        await expect.poll(() => page.evaluate(readTreeFields, prefix)).toEqual(step.result);
      }
    });
}

test('Tree refreshes aliased labels when only fieldNames changes on the same data', async ({ page }) => {
  const counterpart = reference.cases.find(entry => entry.sample.id === 'schema-clone-counterpart')!;
  await page.goto('/?fixture=tree-fields');
  await page.getByRole('combobox', { name: 'Tree fields sample', exact: true })
    .selectOption(String(reference.cases.indexOf(counterpart)));

  await page.getByRole('button', { name: 'Change schema only', exact: true }).click();

  // Source обновляет cache только вместе с treeData. Проверяем корректный публичный counterpart.
  await expect.poll(() => page.evaluate(readTreeFields, 'ant-tree'))
    .toEqual(counterpart.steps[0].result);
  expect(reference.observations[0].steps[0].result.nodes[0].title).toBe('Root');
});

test('Tree and DirectoryTree infer custom records while preserving raw and event field types',
  async ({ page }) => {
    await page.goto('/?fixture=tree-generic-fields');
    const tree = page.getByRole('region', { name: 'Typed tree', exact: true });
    const directory = page.getByRole('region', { name: 'Typed directory', exact: true });
    await expect(tree.locator('[data-ant-tree-root]')).toHaveClass(/typed-tree-root-3/);
    expect(await tree.locator('[data-ant-tree-root]').evaluate(node =>
      getComputedStyle(node).getPropertyValue('--typed-rank').trim())).toBe('3');
    await tree.getByText('Typed zero', { exact: true }).click();

    await expect(page.locator('[data-typed-tree-result]'))
      .toHaveText('0:false:raw-key:raw-selected:7:true');
    await directory.getByText('Typed zero', { exact: true }).click();

    await expect(page.locator('[data-typed-tree-result]'))
      .toHaveText('0:false:raw-key:raw-selected:7:true');
    await page.getByRole('checkbox', { name: 'Filter typed zero', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Custom typed switcher', exact: true }).check();

    await expect(tree.locator('.filter-node .ant-tree-title')).toHaveText('Typed zero');
    await expect(tree.locator('.filter-node [data-typed-icon]')).toHaveText('7');
    await expect(tree.locator('[data-typed-switcher]')).toHaveText('3:false');
    await expect(page.getByRole('region', { name: 'Helper data', exact: true }))
      .toContainText('Helper zero');
  });

test('Tree rebuilds mapped children and conducts existing checks when only schema changes',
  async ({ page }) => {
    const entry = reference.cases.find(item => item.sample.id === 'schema-children-refresh')!;
    await page.goto('/?fixture=tree-fields');
    await page.getByRole('combobox', { name: 'Tree fields sample', exact: true })
      .selectOption(String(reference.cases.indexOf(entry)));
    await page.getByText('Zero', { exact: true }).click();

    await page.getByRole('button', { name: 'Change schema only', exact: true }).click();

    await expect.poll(() => page.evaluate(readTreeFields, 'ant-tree')).toEqual(entry.steps[1].result);
    await expect(page.getByRole('checkbox', { name: 'Alias replacement', exact: true })).toBeChecked();
    await expect(page.getByText('Zero', { exact: true })).toHaveCount(0);
    await page.getByText('Alias replacement', { exact: true }).click();

    await expect.poll(() => page.evaluate(readTreeFields, 'ant-tree')).toEqual(entry.steps[2].result);
  });

test('Tree preserves discriminated union records in inferred event nodes', async ({ page }) => {
  await page.goto('/?fixture=tree-generic-fields');
  const tree = page.getByRole('region', { name: 'Typed union', exact: true });
  await tree.getByText('Typed task', { exact: true }).click();

  await expect(page.locator('[data-typed-union-result]')).toHaveText('42');
  await tree.getByText('Typed article', { exact: true }).click();

  await expect(page.locator('[data-typed-union-result]')).toHaveText('guide');
});

test('Tree schema refresh preserves DOM, selection, active IDs and native refs', async ({ page }) => {
  const index = reference.cases.findIndex(entry => entry.sample.id === 'schema-data-refresh');
  await page.goto('/?fixture=tree-fields');
  await page.getByRole('combobox', { name: 'Tree fields sample', exact: true })
    .selectOption(String(index));
  await page.getByText('Zero', { exact: true }).click();
  const tree = page.getByRole('tree');
  await tree.press('Home');
  const active = await tree.getAttribute('aria-activedescendant');
  const root = await page.locator('[data-ant-tree-root]').elementHandle();
  const zero = await page.getByRole('treeitem', { name: 'Zero', exact: true }).elementHandle();

  await page.getByRole('button', { name: 'Change schema only', exact: true }).click();
  await page.getByRole('button', { name: 'Focus field tree', exact: true }).click();

  await expect(tree).toBeFocused();
  await expect(tree).toHaveAttribute('aria-activedescendant', active!);
  await expect(page.getByRole('treeitem', { name: 'Alias Zero', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
  expect(await root!.evaluate(node => node === document.querySelector('[data-ant-tree-root]')))
    .toBe(true);
  expect(await zero!.evaluate(node => node === document.querySelector('.ant-tree-treenode-selected')))
    .toBe(true);
  await tree.press('ArrowRight');
  await tree.press('ArrowDown');
  await tree.press(' ');

  await expect(page.getByRole('treeitem', { name: 'Alias Zero', exact: true }))
    .toHaveAttribute('aria-selected', 'false');
  await page.getByRole('button', { name: 'Blur field tree', exact: true }).click();
  await expect(tree).not.toBeFocused();
  await expect(page.locator('[data-tree-fields-ref]')).toHaveText('DIV');
});

test('Tree discards pending aliased load events after unmount and keeps the external draft',
  async ({ page }) => {
    const index = reference.cases.findIndex(entry => entry.sample.id === 'lazy-alias');
    await page.goto('/?fixture=tree-fields');
    await page.getByRole('combobox', { name: 'Tree fields sample', exact: true })
      .selectOption(String(index));
    await page.locator('[data-ant-tree-switcher]').first().click();
    await expect(page.locator('[data-tree-fields-events]')).toContainText('"kind":"load"');
    await page.getByRole('checkbox', { name: 'Mount field tree', exact: true }).uncheck();
    const before = await page.locator('[data-tree-fields-events]').innerText();
    const editor = page.getByRole('textbox', { name: 'Field editor', exact: true });
    await editor.fill('Retained draft');

    await page.getByRole('button', { name: 'Resolve field load', exact: true }).click();
    await editor.focus();

    await expect(page.locator('[data-tree-fields-events]')).toHaveText(before);
    await expect(page.locator('[data-tree-fields-ref]')).toHaveText('none');
    await expect(editor).toHaveValue('Retained draft');
    await expect(editor).toBeFocused();
  });
