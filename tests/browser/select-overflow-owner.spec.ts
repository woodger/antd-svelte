import { test, expect } from './test';
import reference from './fixtures/ant-design-select-owned-overflow-reference.json'
  with { type: 'json' };

test('Select responsive overflow measures its own input when the summary contains another input',
  async ({ page }) => {
    await page.goto('/?fixture=select-responsive-tags');
    await page.getByRole('combobox', { name: 'Responsive tags sample', exact: true })
      .selectOption('default-400');
    await page.getByRole('checkbox', { name: 'Input inside summary', exact: true }).check();

    await expect(page.locator('[data-tag-count] .ant-select-selection-item:not([inert])'))
      .toHaveText(reference.cases[0].tags.map(tag => tag.text));
    await expect(page.getByRole('combobox', { name: 'Counted values', exact: true }))
      .toHaveValue('');
    await expect(page.getByRole('status', { name: 'Tag count values', exact: true }))
      .toHaveText('["a","locked",0,"z"]');
  });

test('Cascader responsive overflow keeps its own input separate from summary controls',
  async ({ page }) => {
    await page.goto('/?fixture=cascader-overflow-owner');

    await expect(page.locator('[data-cascader-tag]:not([inert])'))
      .toHaveText(['Alpha', 'Locked', 'Zero', 'Zeta']);
    await expect(page.getByRole('combobox', { name: 'Owned Cascader', exact: true }))
      .toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Cascader summary field', exact: true }))
      .toHaveCount(0);
  });
