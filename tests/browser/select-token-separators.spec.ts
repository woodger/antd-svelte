import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-select-token-separators-reference.json'
  with { type: 'json' };

async function readSelection(page: Page) {
  return page.evaluate(() => ({
    values: JSON.parse(document.querySelector('[aria-label="Tags values"]')!.textContent!),
    events: JSON.parse(document.querySelector('[aria-label="Tags events"]')!.textContent!),
    query: document.querySelector<HTMLInputElement>('[data-select-tags] input[role="combobox"]')!.value,
    labels: [...document.querySelectorAll('[data-select-tags] .ant-select-selection-item-content')]
      .map(node => node.textContent),
    open: document.querySelector('[data-select-tags] .ant-select')!.classList.contains('ant-select-open')
  }));
}

async function paste(input: Locator, text: string) {
  await input.evaluate((node: HTMLInputElement, text) => {
    node.focus();
    const data = new DataTransfer();
    data.setData('text', text);
    const event = new ClipboardEvent('paste', {
      clipboardData: data, bubbles: true, cancelable: true
    });
    if (!node.dispatchEvent(event)) return;
    const normalized = text.replace(/[\r\n]+$/, '').replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(node, normalized);
    node.dispatchEvent(new InputEvent('input', {
      bubbles: true, inputType: 'insertFromPaste', data: text
    }));
  }, text);
}

for (const entry of reference.cases) {
  test(`Select token separators match source interaction ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=select-token-separators');
    await page.getByRole('combobox', { name: 'Token sample', exact: true })
      .selectOption(entry.sample.id);
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    if ('compose' in entry.sample) await input.dispatchEvent('compositionstart');
    if ('paste' in entry.sample) await paste(input, entry.sample.text);
    else await input.fill(entry.sample.text);
    if ('intermediate' in entry) {
      await expect.poll(() => readSelection(page)).toEqual(entry.intermediate);
      // Enter во время IME не должен выбирать option до compositionend.
      await input.press('Enter');
      await expect.poll(() => readSelection(page)).toEqual(entry.intermediate);
      await input.dispatchEvent('compositionend', { data: entry.sample.text });
    }
    const expected: {
      values: (string | number)[];
      labels: string[];
      events: { type: string; values?: (string | number)[]; query?: string }[];
      query: string;
      open: boolean;
    } = structuredClone(entry.result);
    if (['multiple-disabled', 'multiple-explicit-value', 'whitespace-token']
      .includes(entry.sample.id)) {
      // Source разрешает disabled в multiple и неявные blank tags; сохраняем native ограничения.
      expected.values = expected.values.filter(value => value !== 'locked' && value !== '   ');
      expected.labels = expected.labels.filter(label => label !== 'Locked' && label !== '   ');
      expected.events = expected.events.map(event => event.type === 'change'
        ? { ...event, values: expected.values } : event);
    }

    await expect.poll(() => readSelection(page)).toEqual(expected);
  });
}

test('Token separators update after mount and preserve native validation, reset, disabled and RTL',
  async ({ page }) => {
    await page.goto('/?fixture=select-token-separators');
    await page.getByRole('checkbox', { name: 'Native token constraints', exact: true }).check();
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    const form = page.getByRole('form', { name: 'Tags native form', exact: true });
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(false);
    await input.fill('a,b');
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tags')))
      .toEqual(['a', 'b']);
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(true);
    await page.getByRole('checkbox', { name: 'Use semicolon tokens', exact: true }).check();
    await input.fill('c,d');
    await expect(page.getByRole('status', { name: 'Tags values', exact: true }))
      .toHaveText('["a","b"]');
    await input.fill('c;d');
    await expect(page.getByRole('status', { name: 'Tags values', exact: true }))
      .toHaveText('["a","b","c","d"]');
    await page.getByRole('button', { name: 'Reset tags', exact: true }).click();
    await expect(input).toHaveValue('');
    await expect(page.getByRole('status', { name: 'Tags values', exact: true })).toHaveText('[]');
    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check();
    await input.fill('a');
    await expect(page.getByRole('listbox', { name: 'Tags', exact: true }))
      .toHaveCSS('direction', 'rtl');
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).check();
    await expect(input).toBeDisabled();
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tags')))
      .toEqual([]);
  });

test('Token input preserves native event receivers and respects cancelled paste/composition',
  async ({ page }) => {
    await page.goto('/?fixture=select-token-separators');
    await page.getByRole('combobox', { name: 'Token sample', exact: true })
      .selectOption('paste-crlf');
    const input = page.getByRole('combobox', { name: 'Tags', exact: true });
    await page.getByRole('checkbox', { name: 'Cancel token paste', exact: true }).check();
    await paste(input, 'a\r\nb');
    await expect(input).toHaveValue('');
    await page.getByRole('combobox', { name: 'Token sample', exact: true })
      .selectOption('compose-tags');
    await page.getByRole('checkbox', { name: 'Cancel composition end', exact: true }).check();
    await input.dispatchEvent('compositionstart');
    await input.fill('a,b');
    await input.dispatchEvent('compositionend', { data: 'a,b' });

    await expect(page.getByRole('status', { name: 'Tags values', exact: true })).toHaveText('[]');
    await expect(input).toHaveValue('a,b');
    await expect(page.getByRole('status', { name: 'Token native events', exact: true }))
      .toHaveText('["paste:true","compositionstart:true","compositionend:true"]');
  });
