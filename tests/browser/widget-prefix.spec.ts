import { test, expect } from './test';
import reference from './fixtures/ant-design-widget-prefix-reference.json' with { type: 'json' };
import { snapshotWidgetPrefix } from './widget-prefix-metrics';

for (const entry of reference.cases) {
  test(`Shared display prefixes match source styles and composition for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=widget-prefix');
      await page.getByRole('combobox', { name: 'Widget prefix sample', exact: true })
        .selectOption(entry.sample.id);

      await expect.poll(() => page.evaluate(snapshotWidgetPrefix)).toEqual(entry.result);
    });
}

test('Display prefix updates preserve widgets draft focus and selection', async ({ page }) => {
  await page.goto('/?fixture=widget-prefix');
  await page.getByRole('checkbox', { name: 'Live widget prefix', exact: true }).check();
  const roots = page.locator(
    '[data-feedback-prefix-scope="normal"] [data-prefix-widget] > :first-child'
  );
  const previous = await roots.elementHandles();
  const input = page.getByRole('textbox', { name: 'normal widget draft', exact: true });
  const previousInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });
  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live widget prefix value', exact: true })
      .evaluate((node: HTMLInputElement, prefix) => {
        node.value = prefix;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotWidgetPrefix)).toEqual(step.result);
    for (let index = 0; index < previous.length; index++) {
      expect(await roots.nth(index).evaluate((node, old) => node === old, previous[index]))
        .toBe(step.rootsRetained);
    }
    expect(await input.evaluate((node, old) => node === old, previousInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
  }
});
