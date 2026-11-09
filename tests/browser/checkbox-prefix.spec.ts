import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-checkbox-prefix-reference.json' with { type: 'json' };
import { snapshotCheckboxPrefix } from './checkbox-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Checkbox prefixes match source styles and state for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=checkbox-prefix');
    await page.getByRole('combobox', { name: 'Checkbox prefix sample', exact: true })
      .selectOption(entry.sample.id);

    const expected = 'expectedNative' in entry ? entry.expectedNative : entry.result;

    await expect.poll(() => page.evaluate(snapshotCheckboxPrefix)).toEqual(expected);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Checkbox prefix value' : 'Live Checkbox prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Checkbox prefix changes retain selected value, nodes, refs, focus and native form data', async ({
  page
}) => {
  await page.goto('/?fixture=checkbox-prefix');
  await page.getByRole('checkbox', { name: 'Live Checkbox prefix', exact: true }).check();
  const scope = page.locator('[data-checkbox-prefix-scope="normal"]');
  const group = scope.locator('.fixture-checkbox-group');
  const oldGroup = await group.elementHandle();
  const inputs = group.locator('input');
  const oldInputs = await inputs.elementHandles();
  await group.getByText('Beta', { exact: true }).click();
  const editor = scope.getByRole('textbox', { name: 'normal checkbox draft', exact: true });
  const oldEditor = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotCheckboxPrefix)).toEqual(step.result);
    expect(await group.evaluate((node, old) => node === old, oldGroup)).toBe(step.sameGroup);
    for (const [index, oldInput] of oldInputs.entries()) {
      expect(await inputs.nth(index).evaluate((node, old) => node === old, oldInput))
        .toBe(step.sameInputs);
    }
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
      .toBe(step.formValue);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).getAll('normal-choice')))
      .toEqual(step.checkboxValues);
    await expect(scope.getByLabel('normal checkbox refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal checkbox events')).toHaveText('a,b');
  }
  await setPrefix(page, 'choice', true);

  await expect(group).toHaveClass(/choice-group/);
  await expect(editor).toBeFocused();
  await group.getByRole('checkbox', { name: 'Gamma', exact: true }).focus();
  await page.keyboard.press('Space');

  await expect(group.getByRole('checkbox', { name: 'Gamma', exact: true })).toBeChecked();
  await expect(scope.getByLabel('normal checkbox events')).toHaveText('a,b|a,b,c');
});

for (const sample of ['default', 'row']) {
  test(`Checkbox prefixes retain the same Native group layout for ${sample}`, async ({ page }) => {
    await page.goto('/?fixture=checkbox-prefix');
    await page.getByRole('combobox', { name: 'Checkbox prefix sample', exact: true })
      .selectOption(sample);
    const metrics = () => page.locator('[data-checkbox-prefix-scope] .fixture-checkbox-group')
      .evaluateAll(groups => groups.map(group => {
        const labels = [...group.querySelectorAll('label')];
        const first = labels[0].getBoundingClientRect();
        const second = labels[1].getBoundingClientRect();

        return {
          gap: second.left - first.right,
          height: group.getBoundingClientRect().height,
          rowGap: getComputedStyle(group).rowGap,
          columnGap: getComputedStyle(group).columnGap
        };
      }));
    const canonical = (await metrics())[2];

    await expect.poll(async () => (await metrics()).slice(0, 2)).toEqual([canonical, canonical]);
  });
}
