import { test, expect } from './test';
import type { Page } from '@playwright/test';
import reference from './fixtures/ant-design-form-debounce-observation.json' with { type: 'json' };

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await page.clock.runFor(32);
}

async function snapshot(page: Page) {
  return JSON.parse((await page.getByRole('status', { name: 'Debounce snapshot', exact: true })
    .textContent())!);
}

async function freeze(page: Page) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto('/?fixture=form-validate-debounce');
}

for (const id of new Set(reference.cases.map(({ id }) => id))) {
  test(`Form debounce follows source values, calls and metadata for ${id}`, async ({ page }) => {
    await freeze(page);
    if (id === 'zero') await act(page, 'Debounce disable');
    await act(page, id === 'change' || id === 'zero' ? 'Debounce first value' : 'Debounce old value');
    const actions: Record<string, string> = {
      burst: 'Debounce new value', explicit: 'Debounce validate', silent: 'Debounce validate silently',
      submit: 'Debounce submit', reset: 'Debounce reset', unmount: 'Debounce remove',
      'delay-update': 'Debounce shorten'
    };

    for (const sample of reference.cases.filter((sample) => sample.id === id)) {
      if (sample.phase === 'changed') {
        await page.clock.runFor(80);
        await act(page, actions[id]);
      } else if (sample.phase === 'action' && id !== 'burst') {
        await act(page, actions[id]);
      } else if (sample.phase === 'waiting' || sample.phase === 'settled') {
        await page.clock.runFor(sample.phase === 'waiting' ? 80 : 600);
      }
      const { id: _id, phase: _phase, ...expected } = sample;
      // В upstream validator запускается после unmount; здесь его таймер отменён.
      if (id === 'unmount' && sample.phase === 'settled') expected.calls = [];
      await expect.poll(() => snapshot(page)).toEqual(expected);
    }
  });
}

test('Form delayed errors follow real input and blur without replacing its focus or selection', async ({ page }) => {
  await freeze(page);
  const input = page.getByRole('textbox', { name: 'Name', exact: true });
  await input.fill('bad draft');
  await input.blur();
  await page.clock.runFor(32);
  await expect.poll(() => snapshot(page)).toMatchObject({ calls: [], validating: true });
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();

  await act(page, 'Debounce shorten');
  await page.clock.runFor(80);

  await expect.poll(() => snapshot(page)).toMatchObject({ calls: [], validating: true });
  await expect(input).toBeFocused();
  await page.clock.runFor(600);
  await expect(input).toHaveAccessibleDescription('Invalid bad draft');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
  expect(await input.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 4]);
  expect(await page.locator('#form-validate-debounce-fixture form')
    .evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element))))
    .toEqual({ name: 'bad draft' });
});

test('Form remount starts fresh validation without executing work from the removed control', async ({ page }) => {
  await freeze(page);
  await act(page, 'Debounce old value');
  await act(page, 'Debounce remove');
  await act(page, 'Debounce restore');
  const input = page.getByRole('textbox', { name: 'Name', exact: true });
  await expect(input).toHaveValue('bad-old');
  await page.clock.runFor(600);
  await expect.poll(() => snapshot(page)).toMatchObject({ calls: [], validating: false, touched: false });

  await input.fill('Good new');
  await input.blur();
  await page.clock.runFor(600);

  await expect.poll(() => snapshot(page)).toMatchObject({
    calls: ['Good new'], value: 'Good new', errors: [], validating: false, touched: true
  });
  await expect(input).not.toHaveAttribute('aria-invalid');
});
