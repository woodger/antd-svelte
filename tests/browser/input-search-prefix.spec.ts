import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-input-search-prefix-reference.json' with {
  type: 'json'
};
import { snapshotInputSearchPrefix } from './input-search-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Search prefixes preserve source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=input-search-prefix');
    await page.getByRole('combobox', { name: 'Search prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotInputSearchPrefix)).toEqual(entry.expectedNative);
  });
}

async function setPrefix(page: Page, name: string, value: string) {
  await page.getByRole('textbox', { name, exact: true }).evaluate(
    (node: HTMLInputElement, value) => {
      node.value = value;
      node.dispatchEvent(new Event('input', { bubbles: true }));
    }, value
  );
}

test('Search prefix changes retain controls, refs, value, selection and search events', async ({
  page
}) => {
  await page.goto('/?fixture=input-search-prefix');
  await page.getByRole('checkbox', { name: 'Live Search prefix', exact: true }).check();
  const scope = page.locator('[data-search-prefix-scope="normal"]');
  const root = scope.locator('.fixture-search-root');
  const input = root.locator('input');
  const button = root.locator(':scope > button');
  const oldInput = await input.elementHandle();
  const oldRoot = await root.elementHandle();
  const oldButton = await button.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, 'Live Search prefix value', step.prefix);

    await expect.poll(() => page.evaluate(snapshotInputSearchPrefix)).toEqual(step.expectedNative);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await button.evaluate((node, old) => node === old, oldButton)).toBe(step.sameButton);
    await expect(input).toHaveValue(step.value);
    await expect(input).toBeFocused();
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual([1, 5]);
    expect(await scope.evaluate(node => [...new FormData(node as HTMLFormElement).entries()]))
      .toEqual(step.formValues);
    await expect(scope.getByLabel('normal search refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal search events')).toHaveText('value:kept draft');
  }
  await setPrefix(page, 'Local Search prefix value', 'finder');
  await setPrefix(page, 'Local Search input prefix value', 'field');

  await expect(root).toHaveClass(/finder/);
  await expect(input).toHaveClass(/field/);
  await expect(button).toHaveClass(/finder-btn/);
  await expect(button).toHaveClass(/suite-btn/);
  await expect(input).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(scope.getByLabel('normal search events'))
    .toHaveText('value:kept draft|input:kept draft');
  await button.click();

  await expect(scope.getByLabel('normal search events'))
    .toHaveText('value:kept draft|input:kept draft|input:kept draft');
  await expect(input).toBeFocused();
});

for (const dark of [false, true]) {
  for (const compact of [false, true]) {
    test(`Search retains Native themes for dark=${dark} compact=${compact}`, async ({ page }) => {
      await page.goto('/?fixture=input-search-prefix');
      await page.getByRole('checkbox', { name: 'Native Search dark', exact: true }).setChecked(dark);
      await page.getByRole('checkbox', { name: 'Native Search compact', exact: true })
        .setChecked(compact);
      const metrics = () => page.locator('[data-native-search]').evaluateAll(roots => roots.map(
        root => [root, root.querySelector('input')!.parentElement!, root.lastElementChild!]
          .map(node => {
            const style = getComputedStyle(node);

            return ['height', 'padding-top', 'padding-inline-start', 'font-size', 'line-height',
              'background-color', 'border-top-color', 'color', 'border-radius']
              .map(name => style.getPropertyValue(name));
          })
      ));

      for (const prefix of ['suite', 'next', 'ant']) {
        await setPrefix(page, 'Live Search prefix value', prefix);

        await expect.poll(async () => {
          const values = await metrics();

          return values.length === 2 && JSON.stringify(values[0]) === JSON.stringify(values[1]);
        }).toBe(true);
      }
    });
  }
}
