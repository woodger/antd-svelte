import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-input-prefix-reference.json' with { type: 'json' };
import { snapshotInputPrefix } from './input-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Input/TextArea prefixes match source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=input-prefix');
    await page.getByRole('combobox', { name: 'Input prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotInputPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Input prefix value' : 'Live Input prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Input prefixes retain leaves, wrappers, values, refs, selection and focus', async ({ page }) => {
  await page.goto('/?fixture=input-prefix');
  await page.getByRole('checkbox', { name: 'Live Input prefix', exact: true }).check();
  const scope = page.locator('[data-input-prefix-scope="normal"]');
  const input = scope.getByRole('textbox', { name: 'normal single draft', exact: true });
  const textarea = scope.getByRole('textbox', { name: 'normal multiline draft', exact: true });
  const oldInput = await input.elementHandle();
  const oldTextarea = await textarea.elementHandle();
  const roots = scope.locator('.fixture-input-root,.fixture-textarea-root');
  const oldRoots = await roots.elementHandles();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotInputPrefix)).toEqual(step.result);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await textarea.evaluate((node, old) => node === old, oldTextarea)).toBe(step.sameTextarea);
    for (const [index, oldRoot] of oldRoots.entries()) {
      expect(await roots.nth(index).evaluate((node, old) => node === old, oldRoot))
        .toBe(step.sameRoots);
    }
    await expect(input).toHaveValue(step.value);
    await expect(textarea).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual(step.selection);
    expect(await scope.evaluate(node => [...new FormData(node as HTMLFormElement).entries()]))
      .toEqual(step.formValues);
    await expect(scope.getByLabel('normal input refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal input events')).toHaveText('input:kept draft');
  }
  await textarea.focus();
  await textarea.evaluate((node: HTMLTextAreaElement) => { node.setSelectionRange(2, 6); });
  await setPrefix(page, 'field', true);

  await expect(input).toHaveClass(/field/);
  await expect(textarea).toHaveClass(/field/);
  await expect(textarea).toBeFocused();
  expect(await textarea.evaluate((node: HTMLTextAreaElement) => [
    node.selectionStart, node.selectionEnd
  ])).toEqual([2, 6]);
  await scope.locator('.fixture-textarea-root .fixture-input-clear').click();

  await expect(input).toHaveValue('');
  await expect(textarea).toHaveValue('');
  await expect(scope.getByLabel('normal input events')).toHaveText('input:kept draft|textarea:');
});
