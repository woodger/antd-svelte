import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-radio-prefix-reference.json' with { type: 'json' };
import { snapshotRadioPrefix } from './radio-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Radio prefixes match source styles and state for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=radio-prefix');
    await page.getByRole('combobox', { name: 'Radio prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotRadioPrefix)).toEqual(entry.matched);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Radio prefix value' : 'Live Radio prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Radio prefix changes retain selected value, nodes, refs, focus and native form data', async ({
  page
}) => {
  await page.goto('/?fixture=radio-prefix');
  await page.getByRole('checkbox', { name: 'Live Radio prefix', exact: true }).check();
  const scope = page.locator('[data-radio-prefix-scope="normal"]');
  const group = scope.locator('.fixture-radio-group');
  const oldGroup = await group.elementHandle();
  const inputs = group.locator('input');
  const oldInputs = await inputs.elementHandles();
  await group.getByText('Beta', { exact: true }).click();
  const editor = scope.getByRole('textbox', { name: 'normal radio draft', exact: true });
  const oldEditor = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotRadioPrefix)).toEqual(step.result);
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
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('normal-choice')))
      .toBe(step.radioValue);
    await expect(scope.getByLabel('normal radio refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal radio events')).toHaveText('b');
  }
  await setPrefix(page, 'choice', true);

  await expect(group).toHaveClass(/choice-group-solid/);
  await expect(editor).toBeFocused();
  await group.getByRole('radio', { name: 'Beta', exact: true }).focus();
  await page.keyboard.press('ArrowRight');

  await expect(group.getByRole('radio', { name: 'Gamma', exact: true })).toBeChecked();
  await expect(scope.getByLabel('normal radio events')).toHaveText('b|c');
});

for (const sample of ['vertical', 'vertical-badge']) {
  test(`Radio prefixes retain the same Native fieldset spacing for ${sample}`, async ({ page }) => {
    await page.goto('/?fixture=radio-prefix');
    await page.getByRole('combobox', { name: 'Radio prefix sample', exact: true })
      .selectOption(sample);
    const metrics = () => page.locator('[data-radio-prefix-scope] .fixture-radio-group')
      .evaluateAll(groups => groups.map(group => {
        const style = getComputedStyle(group);
        const labels = [...group.querySelectorAll('label')];
        const first = labels[0].getBoundingClientRect();
        const second = labels[1].getBoundingClientRect();

        return {
          display: style.display,
          rowGap: style.rowGap,
          gap: second.top - first.bottom,
          height: group.getBoundingClientRect().height
        };
      }));

    const canonical = (await metrics())[2];

    await expect.poll(async () => (await metrics()).slice(0, 2)).toEqual([canonical, canonical]);
  });
}
