import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-input-number-prefix-reference.json' with {
  type: 'json'
};
import { snapshotInputNumberPrefix } from './input-number-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`InputNumber prefixes preserve source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=input-number-prefix');
    await page.getByRole('combobox', { name: 'InputNumber prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotInputNumberPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local InputNumber prefix value' : 'Live InputNumber prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('InputNumber prefix changes preserve refs, decimal draft, canonical form value and selection', async ({
  page
}) => {
  await page.goto('/?fixture=input-number-prefix');
  await page.getByRole('checkbox', { name: 'Live InputNumber prefix', exact: true }).check();
  const scope = page.locator('[data-number-prefix-scope="normal"]');
  const root = scope.locator('.fixture-number-root');
  const input = root.getByRole('spinbutton');
  const oldInput = await input.elementHandle();
  const oldRoot = await root.elementHandle();
  await input.fill('2.50');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(0, 2); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotInputNumberPrefix)).toEqual(step.expectedNative);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => [...new FormData(node as HTMLFormElement).entries()]))
      .toEqual([['amount', '2.5']]);
    await expect(scope.getByLabel('normal number refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal number events')).toHaveText('change:2.5');
  }
  await setPrefix(page, 'meter', true);

  await expect(root).toHaveClass(/meter/);
  await expect(input).toBeFocused();
  await page.keyboard.press('ArrowUp');

  await expect(input).toHaveValue('2.75');
  await expect(scope.getByLabel('normal number events')).toHaveText('change:2.5|change:2.75');
});

for (const dark of [false, true]) {
  for (const compact of [false, true]) {
    test(`InputNumber retains Native themes for dark=${dark} compact=${compact}`, async ({ page }) => {
      await page.goto('/?fixture=input-number-prefix');
      await page.getByRole('checkbox', { name: 'Native InputNumber dark', exact: true })
        .setChecked(dark);
      await page.getByRole('checkbox', { name: 'Native InputNumber compact', exact: true })
        .setChecked(compact);
      const metrics = () => page.getByRole('spinbutton', { name: /^Native .* number$/ })
        .evaluateAll(inputs => inputs.map(input => [input.parentElement!, input].map(node => {
          const style = getComputedStyle(node);

          return ['width', 'height', 'padding-top', 'padding-inline-start', 'font-size',
            'line-height', 'background-color', 'border-top-color', 'color']
            .map(name => style.getPropertyValue(name));
        })));

      for (const prefix of ['suite', 'next', 'ant']) {
        await setPrefix(page, prefix);

        await expect.poll(async () => {
          const values = await metrics();

          return values.length === 2 && JSON.stringify(values[0]) === JSON.stringify(values[1]);
        }).toBe(true);
      }
    });
  }
}
