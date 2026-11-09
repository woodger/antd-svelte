import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-button-prefix-reference.json' with { type: 'json' };
import { snapshotButtonPrefix } from './button-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Button prefixes match source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=button-prefix');
    await page.getByRole('combobox', { name: 'Button prefix sample', exact: true })
      .selectOption(entry.sample.id);

    const expected = 'expectedNative' in entry ? entry.expectedNative : entry.result;

    await expect.poll(() => page.evaluate(snapshotButtonPrefix)).toEqual(expected);
  });

  for (const [state, expected] of Object.entries(entry.states)) {
    test(`Button ${state} follows its global variable namespace for ${entry.sample.id}`, async ({
      page
    }) => {
      await page.goto('/?fixture=button-prefix');
      await page.getByRole('combobox', { name: 'Button prefix sample', exact: true })
        .selectOption(entry.sample.id);
      const button = page.locator('[data-button-prefix-scope="normal"] .fixture-button-prefix')
        .first();
      await button.hover({ force: true });
      if (state === 'active') await page.mouse.down();

      await expect.poll(() => page.evaluate(snapshotButtonPrefix)).toEqual(expected);
      if (state === 'active') {
        await page.mouse.move(850, 950);
        await page.mouse.up();
      }
    });
  }
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Button prefix value' : 'Live Button prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Button prefix changes retain nodes, editor selection, focus and native submit', async ({
  page
}) => {
  await page.goto('/?fixture=button-prefix');
  await page.getByRole('checkbox', { name: 'Live Button prefix', exact: true }).check();
  const scope = page.locator('[data-button-prefix-scope="normal"]');
  const buttons = scope.locator('.fixture-button-prefix');
  const oldButtons = await buttons.elementHandles();
  const editor = scope.getByRole('textbox', { name: 'normal button draft', exact: true });
  const oldInput = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotButtonPrefix)).toEqual(step.result);
    for (const [index, oldButton] of oldButtons.entries()) {
      expect(await buttons.nth(index).evaluate((node, old) => node === old, oldButton))
        .toBe(step.sameButtons);
    }
    expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
      .toBe(step.formValue);
    await expect(scope.getByLabel('normal Button prefix ref')).toHaveText('mounted');
    await expect(scope.getByLabel('normal Button prefix events')).toHaveText('0');
  }
  await buttons.first().focus();
  await setPrefix(page, 'action', true);

  await expect(buttons.first()).toHaveClass(/action-variant-outlined/);
  await expect(buttons.first()).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(scope.getByLabel('normal Button prefix events')).toHaveText('1');
  await expect(scope.getByLabel('normal Button prefix submissions')).toHaveText('1');
});

for (const dark of [false, true]) {
  for (const compact of [false, true]) {
    test(`Button retains Native theme metrics for dark=${dark} compact=${compact}`, async ({
      page
    }) => {
      await page.goto('/?fixture=button-prefix');
      await page.getByRole('checkbox', { name: 'Native Button dark', exact: true }).setChecked(dark);
      await page.getByRole('checkbox', { name: 'Native Button compact', exact: true })
        .setChecked(compact);
      const metrics = () => page.getByRole('button', { name: /^Native .* Button$/ })
        .evaluateAll(nodes => nodes.map(node => {
          const style = getComputedStyle(node);

          return ['height', 'padding-top', 'padding-left', 'font-size', 'color', 'background-color',
            'border-top-color', 'border-radius', 'line-height'].map(name => style.getPropertyValue(name));
        }));

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
