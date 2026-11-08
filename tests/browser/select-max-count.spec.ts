import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-select-max-count-reference.json' with { type: 'json' };

async function readSelection(page: Page) {
  return page.evaluate(() => ({
    values: JSON.parse(document.querySelector('[aria-label="Tags values"]')!.textContent!),
    events: JSON.parse(document.querySelector('[aria-label="Tags events"]')!.textContent!),
    labels: [...document.querySelectorAll('[data-select-tags] .ant-select-selection-item-content')]
      .map(node => node.textContent),
    query: document.querySelector<HTMLInputElement>('[data-select-tags] input[role="combobox"]')!.value,
    open: document.querySelector('[data-select-tags] .ant-select')!.classList.contains('ant-select-open'),
    options: [...document.querySelectorAll('[data-select-tags] [role="option"]')].map(node => ({
      label: node.querySelector('.ant-select-item-option-content')!.textContent,
      disabled: node.getAttribute('aria-disabled') === 'true'
    }))
  }));
}

function sourceSnapshot(result: {
  values: (string | number)[];
  events: unknown[];
  labels: string[];
  query: string;
  open: boolean;
  options: { label: string; disabled: boolean }[];
}) {
  return { ...structuredClone(result), options: result.options.map(option => ({
    label: option.label, disabled: option.disabled
  })) };
}

for (const entry of reference.cases) {
  test(`Select maxCount retains source limits for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=select-max-count');
    await page.getByRole('combobox', { name: 'Limit sample', exact: true })
      .selectOption(entry.sample.id);
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    if ('open' in entry.sample && entry.sample.open) await input.click();
    if ('compose' in entry.sample) await input.dispatchEvent('compositionstart');
    if ('text' in entry.sample && typeof entry.sample.text === 'string') {
      await input.fill(entry.sample.text);
    }
    if ('intermediate' in entry) {
      await expect.poll(() => readSelection(page)).toEqual(sourceSnapshot(entry.intermediate!));
      await input.dispatchEvent('compositionend', { data: entry.sample.text });
    }
    if ('keys' in entry.sample) {
      for (const key of entry.sample.keys!) await input.press(key);
    }
    if ('clear' in entry.sample) await page.locator('[data-select-tags] .clear').click();
    if ('blur' in entry.sample) await page.locator('#tags-outside').click();
    const expected = sourceSnapshot(entry.result);
    if (['controlled-query-blur', 'controlled-query-enter'].includes(entry.sample.id)) {
      // Source submit обходит maxCount при controlled query; Native не превышает лимит.
      expected.values = ['a'];
      expected.labels = ['Alpha'];
      expected.events = [];
      expected.options = expected.options.map(option => ({ ...option, disabled: true }));
    }

    await expect.poll(() => readSelection(page)).toEqual(expected);
  });
}

test('Select maxCount updates eligibility while retaining input, search, focus and selection',
  async ({ page }) => {
    await page.goto('/?fixture=select-max-count');
    await page.getByRole('combobox', { name: 'Limit sample', exact: true })
      .selectOption('tags-open-at-limit');
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    await input.click();
    const original = await input.elementHandle();
    await expect(page.getByRole('option', { name: 'Zero', exact: true })).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Override selection limit', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.checked = true;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });

    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(page.getByRole('option', { name: 'Zero', exact: true })).toBeEnabled();
    await input.fill('draft');
    await page.getByRole('spinbutton', { name: 'Selection limit', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = '0';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await expect(input).toHaveValue('draft');
    await input.press('Enter');
    await expect(page.getByRole('status', { name: 'Tags values', exact: true }))
      .toHaveText('["a"]');
    await page.locator('#tags-outside').click();
    await expect(input).toHaveValue('');
    const form = page.getByRole('form', { name: 'Tags native form', exact: true });
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tags')))
      .toEqual(['a']);
  });

test('Select maxCount preserves native forms, reset and disabled state and ignores single mode',
  async ({ page }) => {
    await page.goto('/?fixture=select-max-count');
    await page.getByRole('combobox', { name: 'Limit sample', exact: true })
      .selectOption('tags-list-cap');
    await page.getByRole('checkbox', { name: 'Native limit constraints', exact: true }).check();
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    const form = page.getByRole('form', { name: 'Tags native form', exact: true });
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(false);
    await input.fill('a,b,c');
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tags')))
      .toEqual(['a', 'b']);
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(true);
    await page.getByRole('button', { name: 'Reset tags', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Tags values', exact: true })).toHaveText('[]');
    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check();
    await input.click();
    await expect(page.getByRole('listbox', { name: 'Tags', exact: true }))
      .toHaveCSS('direction', 'rtl');
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).check();
    await expect(input).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).uncheck();
    await page.getByRole('combobox', { name: 'Single ignores limit', exact: true }).click();
    await expect(page.getByRole('option', { name: 'Alpha', exact: true })).toBeEnabled();
    await page.getByRole('option', { name: 'Alpha', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Single ignores limit', exact: true }))
      .toHaveValue('Alpha');
  });
