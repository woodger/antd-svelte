import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-input-otp-prefix-reference.json' with { type: 'json' };
import { snapshotInputOTPPrefix } from './input-otp-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`OTP prefixes preserve source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=input-otp-prefix');
    await page.getByRole('combobox', { name: 'OTP prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotInputOTPPrefix)).toEqual(entry.expectedNative);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local OTP prefix value' : 'Live OTP prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('OTP prefix changes preserve cells, refs, code, focused index and keyboard selection', async ({
  page
}) => {
  await page.goto('/?fixture=input-otp-prefix');
  await page.getByRole('checkbox', { name: 'Live OTP prefix', exact: true }).check();
  const scope = page.locator('[data-otp-prefix-scope="normal"]');
  const root = scope.getByRole('group');
  const inputs = root.locator('input');
  const wrappers = root.locator(':scope > [role="presentation"]');
  const oldInputs = await inputs.elementHandles();
  const oldWrappers = await wrappers.elementHandles();
  const oldRoot = await root.elementHandle();
  await inputs.first().fill('9876');

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotInputOTPPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    for (const [index, old] of oldInputs.entries()) {
      expect(await inputs.nth(index).evaluate((node, old) => node === old, old))
        .toBe(step.sameInputs);
      expect(await wrappers.nth(index).evaluate((node, old) => node === old, oldWrappers[index]))
        .toBe(step.sameWrappers);
    }
    await expect(inputs.nth(step.focused)).toBeFocused();
    expect(await inputs.last().evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => [...new FormData(node as HTMLFormElement).entries()]))
      .toEqual(step.formValues);
    await expect(scope.getByLabel('normal OTP refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal OTP events')).toHaveText('input:9876|change:9876');
  }
  await setPrefix(page, 'code', true);

  await expect(root).toHaveClass(/code/);
  await expect(root.locator('.code-input-wrapper')).toHaveCount(4);
  await expect(inputs.first()).toHaveClass(/suite-input/);
  await expect(inputs.last()).toBeFocused();
  await page.keyboard.press('ArrowLeft');

  await expect(inputs.nth(2)).toBeFocused();
  await expect(scope.getByLabel('normal OTP events')).toHaveText('input:9876|change:9876');
});

for (const dark of [false, true]) {
  for (const compact of [false, true]) {
    test(`OTP retains Native themes for dark=${dark} compact=${compact}`, async ({ page }) => {
      await page.goto('/?fixture=input-otp-prefix');
      await page.getByRole('checkbox', { name: 'Native OTP dark', exact: true }).setChecked(dark);
      await page.getByRole('checkbox', { name: 'Native OTP compact', exact: true }).setChecked(compact);
      const metrics = () => page.locator('[data-native-otp]').evaluateAll(roots => roots.map(
        root => [root, ...root.querySelectorAll('input')].map(node => {
          const style = getComputedStyle(node);

          return ['width', 'height', 'column-gap', 'padding-top', 'padding-inline-start',
            'font-size', 'line-height', 'background-color', 'border-top-color', 'color']
            .map(name => style.getPropertyValue(name));
        })
      ));

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
