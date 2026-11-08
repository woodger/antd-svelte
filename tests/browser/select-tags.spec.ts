import { test, expect } from './test';
import interactions from './fixtures/ant-design-select-tags-interaction-reference.json'
  with { type: 'json' };
import optionsReference from './fixtures/ant-design-select-tags-options-reference.json'
  with { type: 'json' };

for (const entry of interactions.cases) {
  test(`Select tags matches source interaction ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=select-tags');
    await page.getByRole('combobox', { name: 'Tags sample', exact: true })
      .selectOption(entry.sample.id);
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    await input.fill(entry.sample.text);
    if ('keys' in entry.sample) {
      for (const key of entry.sample.keys!) await input.press(key);
    }
    if ('clear' in entry.sample && entry.sample.clear) {
      await page.locator('[data-select-tags] .clear').click();
    }
    if ('blur' in entry.sample && entry.sample.blur) await page.locator('#tags-outside').click();
    const expected = structuredClone(entry.result);
    if (entry.sample.id === 'blank-enter') {
      // Source создаёт whitespace-only value через список, хотя submit отвергает пустой ввод.
      expected.values = [];
      expected.labels = [];
      expected.events = expected.events.filter(event => event.type !== 'change');
      expected.query = entry.sample.text;
    }

    await expect.poll(() => page.evaluate(() => ({
      values: JSON.parse(document.querySelector('[aria-label="Tags values"]')!.textContent!),
      events: JSON.parse(document.querySelector('[aria-label="Tags events"]')!.textContent!),
      query: document.querySelector<HTMLInputElement>('[data-select-tags] input[role="combobox"]')!.value,
      labels: [...document.querySelectorAll('[data-select-tags] .ant-select-selection-item-content')]
        .map(node => node.textContent),
      open: document.querySelector('[data-select-tags] .ant-select')!.classList.contains('ant-select-open')
    }))).toEqual(expected);
  });
}

test('Tags participate in native required validation, repeated fields, clear and reset',
  async ({ page }) => {
    await page.goto('/?fixture=select-tags');
    await page.getByRole('checkbox', { name: 'Native tags constraints', exact: true }).check();
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    const form = page.getByRole('form', { name: 'Tags native form', exact: true });
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(false);
    await input.fill('created');
    await input.press('Enter');
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(true);
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tags')))
      .toEqual(['created']);
    await page.locator('[data-select-tags] .clear').click();
    await expect(input).toBeFocused();
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tags')))
      .toEqual([]);
    await input.fill('reset-me');
    await input.press('Enter');
    await page.getByRole('button', { name: 'Reset tags', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Tags values', exact: true })).toHaveText('[]');
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(false);
  });

test('Tags retain selected labels through remote result removal and inherit disabled and RTL',
  async ({ page }) => {
    await page.goto('/?fixture=select-tags');
    await page.getByRole('combobox', { name: 'Tags sample', exact: true })
      .selectOption('duplicate-blur');
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    await page.getByRole('checkbox', { name: 'Missing remote tags options', exact: true }).check();
    await expect(page.locator('[data-select-tags] .ant-select-selection-item-content'))
      .toHaveText('Alpha');
    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check();
    await input.click();
    await expect(page.getByRole('listbox', { name: 'Tags', exact: true }))
      .toHaveCSS('direction', 'rtl');
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).check();
    await expect(input).toBeDisabled();
    const form = page.getByRole('form', { name: 'Tags native form', exact: true });
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tags')))
      .toEqual([]);
  });

for (const entry of optionsReference.cases) {
  test(`Select tags exposes source option order and disabled state for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=select-tags');
      await page.getByRole('combobox', { name: 'Tags reference phase', exact: true })
        .selectOption('options');
      await page.getByRole('combobox', { name: 'Tags sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Tags', exact: true }).click();
      const expected = entry.sample.id === 'whitespace' ? [] : entry.options.map(option => ({
        label: option.label, disabled: option.disabled
      }));

      await expect.poll(() => page.locator('[data-select-tags] [role="option"]').evaluateAll(nodes =>
        nodes.map(node => ({
          label: node.querySelector('.ant-select-item-option-content')!.textContent,
          disabled: node.getAttribute('aria-disabled') === 'true'
        })))).toEqual(expected);
    });
}
