import { test, expect } from './test';
import reference from './fixtures/ant-design-core-prefix-reference.json' with { type: 'json' };
import { snapshotCorePrefix } from './core-prefix-metrics';

for (const entry of reference.cases) {
  test(`Shared Divider Flex and Segmented prefixes match source for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=core-prefix');
      await page.getByRole('combobox', { name: 'Core prefix sample', exact: true })
        .selectOption(entry.sample.id);

      await expect.poll(() => page.evaluate(snapshotCorePrefix)).toEqual(entry.result);
    });
}

test('Core prefix updates preserve selection forms callbacks and focus', async ({ page }) => {
  await page.goto('/?fixture=core-prefix');
  await page.getByRole('checkbox', { name: 'Live core prefix', exact: true }).check();
  const scope = page.locator('[data-core-prefix-scope="normal"]');
  const roots = scope.locator('[data-prefix-widget] > :first-child');
  const oldRoots = await roots.elementHandles();
  const radios = scope.getByRole('radio');
  const oldRadios = await radios.elementHandles();
  await scope.getByRole('radiogroup').getByText('Alpha', { exact: true }).click();
  const input = page.getByRole('textbox', { name: 'normal widget draft', exact: true });
  const oldInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live core prefix value', exact: true })
      .evaluate((node: HTMLInputElement, prefix) => {
        node.value = prefix;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotCorePrefix)).toEqual(step.result);
    for (let index = 0; index < oldRoots.length; index++) {
      expect(await roots.nth(index).evaluate((node, old) => node === old, oldRoots[index]))
        .toBe(step.rootsRetained);
    }
    for (let index = 0; index < oldRadios.length; index++) {
      expect(await radios.nth(index).evaluate((node, old) => node === old, oldRadios[index]))
        .toBe(true);
    }
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    await expect(scope.locator('[data-prefix-changes]')).toHaveText(step.changes);
    expect(await scope.evaluate((node: HTMLFormElement) =>
      new FormData(node).get('normal-segment'))).toBe(step.formValue);
  }

  await radios.nth(0).focus();
  await page.keyboard.press('ArrowRight');

  await expect(radios.nth(1)).toBeChecked();
  await expect(radios.nth(1)).toBeFocused();
  await expect(scope.locator('[data-prefix-changes]')).toHaveText('2');
});
