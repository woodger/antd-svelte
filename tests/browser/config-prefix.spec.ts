import { test, expect } from './test';
import reference from './fixtures/ant-design-config-prefix-reference.json' with { type: 'json' };
import { snapshotConfigPrefix } from './config-prefix-metrics';

function expected(source: typeof reference.cases[number]['result'], legacy = false) {
  return Object.fromEntries(Object.entries(source).map(([scope, value]) => [scope, {
    token: legacy && scope !== 'sibling' ? {
      fontSize: 'var(--ant-font-size)', colorText: 'var(--ant-color-text)'
    } : value.token,
    classes: value.classes
  }]));
}

for (const entry of reference.cases) {
  test(`ConfigProvider prefixes and theme namespace match source for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=config-prefix');
      await page.getByRole('combobox', { name: 'Global prefix sample', exact: true })
        .selectOption(entry.sample.id);

      await expect.poll(() => page.evaluate(snapshotConfigPrefix))
        .toEqual(expected(entry.result, 'noTheme' in entry.sample && entry.sample.noTheme));
    });
}

test('ConfigProvider prefix updates preserve Layout and input identity drafts focus and selection',
  async ({ page }) => {
    await page.goto('/?fixture=config-prefix');
    await page.getByRole('checkbox', { name: 'Live global prefix', exact: true }).check();
    const input = page.getByRole('textbox', { name: 'normal prefix draft', exact: true });
    const root = page.locator('[data-prefix-scope="normal"] [data-prefix-part="layout"]');
    const previous = { input: await input.elementHandle(), root: await root.elementHandle() };
    await input.fill('kept draft');
    await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });
    for (const step of reference.transitions) {
      await page.getByRole('textbox', { name: 'Live prefix', exact: true })
        .evaluate((node: HTMLInputElement, prefix) => {
          node.value = prefix;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotConfigPrefix)).toEqual(expected(step.result));
      expect(await input.evaluate((node, old) => node === old, previous.input))
        .toBe(step.sameInput);
      expect(await root.evaluate((node, old) => node === old, previous.root)).toBe(step.sameRoot);
      await expect(input).toHaveValue(step.value);
      await expect(input).toBeFocused();
      expect(await input.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual(step.selection);
    }
  });

test('ConfigProvider keeps legacy variables under a custom prefix', async ({ page }) => {
  await page.goto('/?fixture=config-prefix');
  await page.getByRole('combobox', { name: 'Global prefix sample', exact: true })
    .selectOption('without-theme');
  await page.getByRole('checkbox', { name: 'Legacy prefix theme', exact: true }).check();
  const referenceCase = reference.cases.find(entry => entry.sample.id === 'without-theme')!;

  await expect.poll(() => page.evaluate(snapshotConfigPrefix))
    .toEqual(expected(referenceCase.result, true));
  await expect(page.locator('[data-prefix-scope="normal"] [data-prefix-part="layout"]'))
    .toHaveClass(/suite-layout/);
});
