import { test, expect } from './test';
import type { ElementHandle, Page } from '@playwright/test';
import reference from './fixtures/ant-design-form-hidden-reference.json' with { type: 'json' };

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
}

test('Form hidden fields match source values, refs, local state, reset and validation', async ({ page }) => {
  await page.goto('/?fixture=form-hidden');
  const actions: Record<string, string> = {
    initial: 'Inspect hidden field', seeded: 'Seed hidden field', hidden: 'Conceal field',
    'reset-hidden': 'Reset hidden field', shown: 'Show hidden field',
    'hidden-invalid': 'Validate hidden field', 'revealed-invalid': 'Reveal invalid field'
  };
  let previous: ElementHandle | undefined;
  for (const sample of reference.cases) {
    await act(page, actions[sample.id]);
    await expect(page.getByRole('status', { name: 'Hidden snapshot', exact: true }))
      .toHaveText(JSON.stringify(sample));
    const input = page.getByLabel('Concealed', { exact: true });
    if (sample.retained !== null) {
      expect(await input.evaluate((element, old) => element === old, previous!)).toBe(sample.retained);
    }
    previous = (await input.elementHandle())!;
    if (sample.hidden) await expect(input).toBeHidden();
    else await expect(input).toBeVisible();
  }
});

for (const layout of ['vertical', 'horizontal', 'inline']) {
  test(`Form hidden controls leave keyboard navigation in ${layout} without losing values`, async ({ page }) => {
    await page.goto('/?fixture=form-hidden');
    await page.getByRole('combobox', { name: 'Hidden layout', exact: true }).selectOption(layout);
    await act(page, 'Conceal field');
    await page.getByRole('button', { name: 'Before hidden controls', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Sibling', { exact: true })).toBeFocused();
    expect(await page.locator('#form-hidden-fixture form').evaluate((element: HTMLFormElement) =>
      Object.fromEntries(new FormData(element))
    )).toEqual({ concealed: 'Alpha', sibling: 'Beta' });
  });
}

test('Form submit still rejects the invalid hidden binding and reveals its stored accessible error', async ({ page }) => {
  await page.goto('/?fixture=form-hidden');
  await act(page, 'Validate hidden field');
  await page.locator('#form-hidden-fixture form').evaluate((element: HTMLFormElement) => {
    element.requestSubmit();
  });
  await expect(page.getByRole('status', { name: 'Hidden submission errors', exact: true }))
    .toHaveText('[{"name":["concealed"],"errors":["Concealed required"],"warnings":[]}]');
  await expect(page.getByRole('status', { name: 'Hidden submissions', exact: true })).toHaveText('0');
  await act(page, 'Reveal invalid field');
  await expect(page.getByLabel('Concealed', { exact: true }))
    .toHaveAccessibleDescription('Concealed required');
  await expect(page.getByLabel('Concealed', { exact: true })).toBeFocused();
});
