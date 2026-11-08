import { test, expect } from './test';
import reference from './fixtures/ant-design-select-sort-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Select sorting matches source option order for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=select-sort');
    await page.getByRole('combobox', { name: 'Sort sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('combobox', { name: 'Sorted values', exact: true }).click();

    await expect.poll(() => page.locator('[data-select-sort] [role="option"]').evaluateAll(nodes =>
      nodes.map(node => ({
        label: node.querySelector('.ant-select-item-option-content')!.textContent,
        disabled: node.getAttribute('aria-disabled') === 'true'
      })))).toEqual(entry.options.map(option => ({
      label: option.label, disabled: option.disabled
    })));
    await expect(page.getByRole('status', { name: 'Sort comparator queries', exact: true }))
      .toHaveText(JSON.stringify(entry.callbackSearchValues));
    await expect(page.getByRole('status', { name: 'Sort comparator options owned', exact: true }))
      .toHaveText('true');
    await expect(page.getByRole('status', { name: 'Sort changes', exact: true })).toHaveText('0');
  });
}

test('Select filterSort reacts without replacing input, losing focus or changing selected values',
  async ({ page }) => {
    await page.goto('/?fixture=select-sort');
    await page.getByRole('combobox', { name: 'Sort sample', exact: true })
      .selectOption('multiple-ascending');
    const input = page.getByRole('combobox', { name: 'Sorted values', exact: true });
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(page.getByRole('status', { name: 'Sorted selected values', exact: true }))
      .toHaveText('["a"]');
    await input.fill('unaccepted');
    await expect(input).toHaveValue('');
    const original = await input.elementHandle();
    await input.focus();
    await page.getByRole('combobox', { name: 'Sort strategy', exact: true })
      .evaluate((node: HTMLSelectElement) => {
        node.value = 'desc';
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });

    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(page.locator('[data-select-sort] [role="option"]'))
      .toHaveText(['Zero', 'Locked', 'Gamma', 'Bravo', 'Alpha']);
    const form = page.getByRole('form', { name: 'Sorted native form', exact: true });
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('sorted')))
      .toEqual(['a']);
    await expect(page.getByRole('status', { name: 'Sort comparator queries', exact: true }))
      .toHaveText('[""]');
    await expect(page.getByRole('status', { name: 'Sort changes', exact: true })).toHaveText('1');
    await page.getByRole('combobox', { name: 'Sort strategy', exact: true }).selectOption('none');
    await page.getByRole('checkbox', { name: 'Reverse owner options', exact: true }).check();
    await input.click();
    await expect(page.locator('[data-select-sort] [role="option"]'))
      .toHaveText(['Locked', 'Zero', 'Bravo', 'Alpha', 'Gamma']);
  });

test('Select filterSort uses accepted and uncontrolled queries with sorted keyboard selection',
  async ({ page }) => {
    await page.goto('/?fixture=select-sort');
    await page.getByRole('combobox', { name: 'Sort sample', exact: true })
      .selectOption('query-empty');
    await page.getByRole('checkbox', { name: 'Accept sort query', exact: true }).check();
    const input = page.getByRole('combobox', { name: 'Sorted values', exact: true });
    await input.fill('turn');
    await expect(page.locator('[data-select-sort] [role="option"]'))
      .toHaveText(['Zero', 'turn', 'Locked', 'Gamma', 'Bravo', 'Alpha']);
    await expect(input).toHaveValue('turn');
    await input.press('Enter');
    await expect(page.getByRole('status', { name: 'Sorted selected values', exact: true }))
      .toHaveText('[0]');
    await page.getByRole('checkbox', { name: 'Controlled sort query', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.checked = false;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });
    await input.fill('another');
    await expect(page.locator('[data-select-sort] [role="option"]'))
      .toHaveText(['Alpha', 'another', 'Bravo', 'Gamma', 'Locked', 'Zero']);
    await expect.poll(async () => {
      const content = await page.getByRole('status', {
        name: 'Sort comparator queries', exact: true
      }).textContent();
      return JSON.parse(content ?? '[]').sort();
    }).toEqual(['', 'another', 'turn']);
  });
