import { test, expect } from './test';
import type { Page } from '@playwright/test';
import reference from './fixtures/ant-design-form-dom-observation.json' with { type: 'json' };

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
}

const controls = [
  'input', 'password', 'search', 'textarea', 'number', 'checkbox', 'radio', 'switch',
  'select', 'slider', 'range', 'otp', 'date', 'dates', 'time', 'times', 'rate',
  'mentions', 'autocomplete', 'tree-select', 'cascader', 'checkbox-group', 'radio-group'
];

for (const name of controls) {
  test(`Form focusField reaches the ${name} control and preserves its ref`, async ({ page }) => {
    await page.goto('/?fixture=form-dom');
    await act(page, `Focus ${name}`);

    const field = page.locator(`[data-dom-field="${name}"]`);
    const source = reference.cases.find(({ id }) => id === `focus-${name}`);
    expect(await field.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
    if (source) {
      expect(await page.evaluate(() =>
        document.activeElement?.closest<HTMLElement>('[data-dom-field]')?.dataset.domField
      )).toBe(source.active.tag);
    }
    const snapshot = page.getByRole('status', { name: 'DOM snapshot', exact: true });
    const first = JSON.parse((await snapshot.textContent())!);
    expect(first).toMatchObject({ tag: name, instance: true });
    if (first.sameRef !== null) expect(first.sameRef).toBe(true);

    await act(page, `Focus ${name}`);
    expect(JSON.parse((await snapshot.textContent())!)).toMatchObject({ stable: true });
    if (name === 'otp') await expect(field.locator('input').first()).toBeFocused();
    if (name === 'slider' || name === 'range') {
      // Опубликованный Svelte Slider ref сохраняет native range, а не React handle div.
      await expect(field.locator('input[type="range"]').first()).toBeFocused();
    }
    if (name === 'select') await expect(field.getByRole('combobox')).toBeFocused();
  });
}

test('Form keeps literal and typed paths distinct when their upstream ref keys collide', async ({ page }) => {
  await page.goto('/?fixture=form-dom');
  for (const tag of ['nested', 'literal', 'numeric', 'string']) {
    await act(page, `Focus ${tag}`);
    await expect(page.locator(`[data-dom-field="${tag}"] input`)).toBeFocused();
  }
});

test('Form delegates the exact custom ref with its receiver and supports native id fallback', async ({ page }) => {
  await page.goto('/?fixture=form-dom');
  await act(page, 'Focus custom');
  await expect(page.getByRole('textbox', { name: 'Custom input', exact: true })).toBeFocused();
  await expect(page.getByRole('status', { name: 'Custom focus calls', exact: true })).toHaveText('1');
  expect(JSON.parse((await page.getByRole('status', { name: 'DOM snapshot' }).textContent())!))
    .toMatchObject({ instance: true, sameRef: true });

  await act(page, 'Focus raw');
  await expect(page.locator('#dom-raw')).toBeFocused();
  expect(JSON.parse((await page.getByRole('status', { name: 'DOM snapshot' }).textContent())!))
    .toMatchObject({ instance: true, sameRef: true });

  await act(page, 'Focus fallback');
  await expect(page.locator('#dom-fallback')).toBeFocused();
  expect(JSON.parse((await page.getByRole('status', { name: 'DOM snapshot' }).textContent())!))
    .toMatchObject({ instance: false });
  await act(page, 'Focus missing');
  await expect(page.locator('#dom-fallback')).toBeFocused();
  await act(page, 'Focus disabled');
  await expect(page.locator('#dom-fallback')).toBeFocused();
  await act(page, 'Focus transfer');
  await expect(page.locator('#dom-fallback')).toBeFocused();
  expect(JSON.parse((await page.getByRole('status', { name: 'DOM snapshot' }).textContent())!))
    .toMatchObject({ instance: true, sameRef: true });
});

test('Form follows keyed List refs through move and removal without replacing the surviving control', async ({ page }) => {
  await page.goto('/?fixture=form-dom');
  await act(page, 'Focus first person');
  const anna = page.locator('[data-dom-field="person-0"] input');
  const bob = page.locator('[data-dom-field="person-1"] input');
  await expect(anna).toBeFocused();
  const oldAnna = await anna.elementHandle();

  await act(page, 'Move DOM person');
  await act(page, 'Focus first person');
  await expect(bob).toBeFocused();
  await act(page, 'Remove DOM person');
  await expect(bob).toHaveCount(0);
  await act(page, 'Focus first person');
  await expect(anna).toBeFocused();
  expect(await anna.evaluate((element, previous) => element === previous, oldAnna)).toBe(true);
});

test('Form releases removed refs, registers reset controls and detaches a replaced model', async ({ page }) => {
  await page.goto('/?fixture=form-dom');
  const input = page.locator('[data-dom-field="input"] input');
  await act(page, 'Focus input');
  const previous = await input.elementHandle();
  await act(page, 'Reset DOM input');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element, old) => element === old, previous)).toBe(false);
  await expect(page.getByRole('status', { name: 'DOM snapshot' }))
    .toHaveText('{"tag":"input","instance":true,"stable":false,"sameRef":null}');

  await act(page, 'Toggle DOM field');
  await expect(page.locator('[data-dom-field="removable"]')).toHaveCount(0);
  await act(page, 'Focus removable');
  expect(JSON.parse((await page.getByRole('status', { name: 'DOM snapshot' }).textContent())!))
    .toMatchObject({ instance: false });
  await act(page, 'Toggle DOM field');
  await act(page, 'Focus removable');
  await expect(page.locator('[data-dom-field="removable"] input')).toBeFocused();

  await act(page, 'Replace DOM model');
  await expect(page.getByRole('status', { name: 'DOM snapshot' })).toHaveText('{"oldInstance":false}');
  await expect(input).toBeFocused();
  await act(page, 'Toggle DOM form');
  await expect(input).toHaveCount(0);
  await act(page, 'Focus input');
  expect(JSON.parse((await page.getByRole('status', { name: 'DOM snapshot' }).textContent())!))
    .toMatchObject({ instance: false });
});

test('Form focusField preserves typed input text and selection', async ({ page }) => {
  await page.goto('/?fixture=form-dom');
  const input = page.locator('[data-dom-field="input"] input');
  await input.fill('Draft text');
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  await act(page, 'Focus input');

  await expect(input).toHaveValue('Draft text');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 4]);
});

test('Form scrollToField matches source nearest, alignment, custom actions and optional focus', async ({ page }) => {
  await page.goto('/?fixture=form-dom-scroll');
  const actions: Record<string, string> = {
    missing: 'Scroll missing', nearest: 'Scroll nearest', visible: 'Scroll visible',
    start: 'Scroll start', center: 'Scroll center', 'end-focus': 'Scroll end', custom: 'Custom scroll'
  };
  for (const sample of reference.scrollCases) {
    if (sample.id === 'start' || sample.id === 'custom') await act(page, 'Reset scroll');
    await act(page, actions[sample.id]);
    await expect(page.getByRole('status', { name: 'Scroll snapshot', exact: true }))
      .toHaveText(JSON.stringify(sample));
  }
  await expect(page.getByRole('status', { name: 'Scroll actions', exact: true }))
    .toHaveText(JSON.stringify(reference.custom));
  await expect(page.getByRole('status', { name: 'Scroll focus calls', exact: true })).toHaveText('1');
  await act(page, 'Custom scroll focus');
  await expect(page.getByRole('textbox', { name: 'Scroll target', exact: true })).toBeFocused();
  await expect(page.getByRole('status', { name: 'Scroll focus calls', exact: true })).toHaveText('2');
});

test('Form scopes scroll boundaries and can skip hidden overflow in nested containers', async ({ page }) => {
  await page.goto('/?fixture=form-dom-scroll');
  await page.getByLabel('Nested scrolling', { exact: true }).check();
  const box = page.getByTestId('scroll-box');
  const outer = page.locator('.outer');
  await act(page, 'Bounded scroll');
  expect(await box.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await outer.evaluate((element) => element.scrollTop)).toBe(0);

  await act(page, 'Reset scroll');
  await act(page, 'Predicate scroll');
  expect(await box.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await outer.evaluate((element) => element.scrollTop)).toBe(0);

  await act(page, 'Reset scroll');
  await page.getByLabel('Hidden overflow', { exact: true }).check();
  await act(page, 'Skip hidden scroll');
  expect(await box.evaluate((element) => element.scrollTop)).toBe(0);
  expect(await outer.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await act(page, 'Reset scroll');
  await act(page, 'Scroll nearest');
  expect(await box.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});

test('Form completes smooth scrolling and keeps a visible control stable when scroll margins are set', async ({ page }) => {
  await page.goto('/?fixture=form-dom-scroll');
  await act(page, 'Smooth scroll');
  const box = page.getByTestId('scroll-box');
  await expect.poll(() => box.evaluate((element) => [element.scrollTop, element.scrollLeft]))
    .toEqual([184, 220]);
  await act(page, 'Reset scroll');
  await page.getByLabel('Scroll margin', { exact: true }).check();
  await act(page, 'Scroll nearest');
  const position = await box.evaluate((element) => [element.scrollTop, element.scrollLeft]);
  await act(page, 'Scroll visible');
  expect(await box.evaluate((element) => [element.scrollTop, element.scrollLeft])).toEqual(position);
  expect(await page.getByRole('textbox', { name: 'Scroll target', exact: true }).evaluate(
    (input) => {
      const bounds = input.getBoundingClientRect();
      const frame = input.parentElement!.getBoundingClientRect();
      return bounds.top >= frame.top && bounds.bottom <= frame.bottom
        && bounds.left >= frame.left && bounds.right <= frame.right;
    }
  )).toBe(true);
});

test('Form targets its own control when adjacent forms share an explicit native id', async ({ page }) => {
  await page.goto('/?fixture=form-dom-scroll');
  await act(page, 'Focus first form');
  await expect(page.getByRole('textbox', { name: 'First form input' })).toBeFocused();
  await act(page, 'Focus second form');
  await expect(page.getByRole('textbox', { name: 'Second form input' })).toBeFocused();
});
