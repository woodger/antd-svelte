import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-data-model-reference.json' with { type: 'json' };

function pathKeys(path: { key: { type: string; value: string | null; }; pos: string; level: number; }[]) {
  return path.map(entity => ({ key: entity.key, pos: entity.pos, level: entity.level }));
}

for (const [index, entry] of reference.cases.entries()) {
  test(`Tree data model public export matches Source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-data-model');
    await page.getByRole('combobox', { name: 'Tree model sample', exact: true })
      .selectOption(String(index));
    const expected = entry.result.paths.at(-2)!;

    await expect(page.locator('[data-model-path]')).toHaveText(JSON.stringify(pathKeys(expected.path)));
    await expect(page.locator('[data-model-stable]')).toHaveText('true');
  });
}

test('Tree data model saved getPath tracks replaced data through Svelte derived state',
  async ({ page }) => {
    await page.goto('/?fixture=tree-data-model');

    await page.getByRole('button', { name: 'Replace model data', exact: true }).click();

    const expected = reference.updates.data.paths.find(entry => entry.query.value === 'leaf')!;
    await expect(page.locator('[data-model-path]')).toHaveText(JSON.stringify(pathKeys(expected.path)));
    await expect(page.locator('[data-model-stable]')).toHaveText('true');
  });

test('Tree data model observes field getter changes without replacing the data array',
  async ({ page }) => {
    await page.goto('/?fixture=tree-data-model');
    await page.getByRole('button', { name: 'Use dual schema', exact: true }).click();
    const before = reference.updates.fieldsOnlyInitial.paths
      .find(entry => entry.query.value === 'oldLeaf')!;
    await expect(page.locator('[data-model-path]')).toHaveText(JSON.stringify(pathKeys(before.path)));

    await page.getByRole('button', { name: 'Use id keys', exact: true }).click();

    const after = reference.updates.fieldsOnly.paths.find(entry => entry.query.value === 'leaf')!;
    await expect(page.locator('[data-model-path]')).toHaveText(JSON.stringify(pathKeys(after.path)));
    await expect(page.locator('[data-model-dual-data]')).toHaveText('true');
    await expect(page.locator('[data-model-stable]')).toHaveText('true');
  });

test('Tree data model excludes missing inherited keys while retaining the lookup input',
  async ({ page }) => {
    await page.goto('/?fixture=tree-data-model');
    const lookup = page.getByRole('textbox', { name: 'Tree model key', exact: true });
    const element = await lookup.elementHandle();

    for (const value of ['constructor', '__proto__', 'toString']) {
      await lookup.fill(value);

      await expect(page.locator('[data-model-path]')).toHaveText('[]');
      await expect(lookup).toBeFocused();
      expect(await element!.evaluate(node => node === document.querySelector('[data-model-key]')))
        .toBe(true);
      await expect(lookup).toHaveValue(value);
    }
  });
