import { test, expect } from './test';
import reference from './fixtures/ant-design-select-option-render-reference.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=select-option-render');
});

for (const entry of reference.cases) {
  test(`Select optionRender metadata and content match source for ${entry.sample.id}`,
    async ({ page }) => {
      await page.getByRole('combobox', { name: 'Option renderer sample', exact: true })
        .selectOption(entry.sample.id);
      const input = page.getByRole('combobox', { name: 'Rendered choice', exact: true });
      await input.click();
      const metadata = () => page.locator('[data-option-metadata]').evaluateAll(nodes =>
        nodes.map(node => JSON.parse(node.getAttribute('data-option-metadata')!)));
      const rendered = () => page.getByRole('listbox').getByRole('option')
        .evaluateAll(nodes => nodes.map(node => ({
        content: node.querySelector('.ant-select-item-option-content')!.textContent,
        disabled: node.getAttribute('aria-disabled') === 'true',
        selected: node.getAttribute('aria-selected') === 'true'
      })));

      await expect.poll(metadata).toEqual(entry.metadata);
      await expect.poll(rendered).toEqual(entry.rendered);
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute('aria-expanded', 'true');
      await input.press('Escape');
      if (entry.sample.mode !== 'single') {
        await expect(page.locator('.ant-select-selection-item-content'))
          .toHaveText(entry.selectedLabels);
      } else if (entry.selectedLabels.length) {
        await expect(input).toHaveValue(entry.selectedLabels[0]);
      }
    });
}

test('Select optionRender keeps selected labels, native FormData, keyboard and reset behavior',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Option renderer sample', exact: true })
      .selectOption('multiple');
    const input = page.getByRole('combobox', { name: 'Rendered choice', exact: true });
    await input.click();
    await page.getByRole('option', { name: 'Alpha / first', exact: true }).click();
    await expect(page.locator('.ant-select-selection-item-content')).toHaveText(['Alpha']);
    await expect(input).toBeFocused();
    await input.press('Home');
    await input.press('Enter');
    await expect(page.locator('.ant-select-selection-item-content')).toHaveText(['Alpha', 'Zero']);
    const values = () => page.locator('form').evaluate((node: HTMLFormElement) =>
      new FormData(node).getAll('choice'));
    await expect.poll(values).toEqual(['a', '0']);
    await expect(page.locator('#option-render-events')).toHaveText('["a"]|["a",0]');
    await input.press('Escape');
    await page.getByRole('button', { name: 'Reset rendered choice', exact: true }).click();
    await expect.poll(values).toEqual([]);
    await expect(page.locator('.ant-select-selection-item-content')).toHaveCount(0);
  });

test('Select replaces optionRender without resetting popup input focus or selection', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Rendered choice', exact: true });
  await input.click();
  await input.fill('Al');
  const original = await input.elementHandle();
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(0, 1); });
  for (const key of ['r', 'd', 'd']) {
    await page.keyboard.press(`Control+Alt+${key}`);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toHaveValue('Al');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual([0, 1]);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  }
  await input.press('Enter');
  await expect(input).toHaveValue('Alpha');
  await expect(page.locator('#option-render-events')).toHaveText('"a"');
});

test('Select optionRender keeps raw disabled metadata separate from maxCount and cleans up on unmount',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Option renderer sample', exact: true })
      .selectOption('multiple-cap');
    const input = page.getByRole('combobox', { name: 'Rendered choice', exact: true });
    await input.click();
    await expect(page.getByRole('option', { name: 'Gamma / last', exact: true })).toBeDisabled();
    await page.getByRole('option', { name: 'Alpha / first', exact: true }).click();
    await expect(page.getByRole('option', { name: 'Gamma / last', exact: true })).toBeEnabled();
    await page.keyboard.press('Control+Alt+h');

    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(page.locator('[data-option-metadata]')).toHaveCount(0);
  });
