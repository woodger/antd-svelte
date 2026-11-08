import type { Page } from '@playwright/test';
import { test, expect } from './test';
import { formScrollFirstMetrics } from './form-scroll-first-metrics';
import reference from './fixtures/ant-design-form-scroll-first-reference.json' with { type: 'json' };

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate((button: HTMLButtonElement) => {
    button.focus({ preventScroll: true });
    button.click();
  });
}

for (const { sample, metrics } of reference.cases) {
  if (sample.id === 'context-reset') continue;

  test(`Form scrollToFirstError matches source options, order, focus and geometry for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-scroll-first');
    await page.getByRole('combobox', { name: 'First error sample', exact: true }).selectOption(sample.id);
    await act(page, 'Submit scroll form');
    await expect.poll(() => page.evaluate(formScrollFirstMetrics)).toEqual(metrics);
  });
}

test('Form resets the config record and preserves its native default focus without a scroll setting', async ({ page }) => {
  await page.goto('/?fixture=form-scroll-first');
  await page.getByRole('combobox', { name: 'First error sample', exact: true }).selectOption('context-reset');
  await act(page, 'Submit scroll form');
  const original = reference.cases.find(({ sample }) => sample.id === 'context-reset')!.metrics;

  await expect.poll(async () => {
    const { order, calls, failed } = await page.evaluate(formScrollFirstMetrics);
    return { order, calls, failed };
  }).toEqual({ order: original.order, calls: original.calls, failed: original.failed });
  await expect(page.getByLabel('First', { exact: true })).toBeFocused();
});

test('Form uses current scroll props without replacing its focused input or value', async ({ page }) => {
  await page.goto('/?fixture=form-scroll-first');
  const input = page.getByLabel('First', { exact: true });
  await input.fill('Draft');
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 3); });
  const original = await input.elementHandle();

  for (const name of ['Use center scrolling', 'Use focused scrolling']) {
    await page.getByRole('button', { name, exact: true }).evaluate(
      (button: HTMLButtonElement) => { button.click(); }
    );
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft');
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 3]);
  }
  await act(page, 'Submit scroll form');
  const second = page.getByLabel('Second', { exact: true });
  await expect(second).toBeFocused();
  await expect.poll(async () => (await page.evaluate(formScrollFirstMetrics)).calls)
    .toEqual([{ name: ['second'], options: { block: 'center', focus: true, behavior: 'instant' } }]);
});

for (const action of ['Reset scroll fields', 'Replace scroll model', 'Unmount scroll form']) {
  test(`Form avoids late scrolling and focus after ${action}`, async ({ page }) => {
    await page.goto('/?fixture=form-scroll-first');
    await act(page, 'Hold scroll validation');
    await act(page, 'Submit scroll form');
    await expect(page.getByRole('status', { name: 'Pending scroll validation', exact: true })).toHaveText('1');
    await act(page, action);
    await act(page, 'Release scroll validation');
    await expect(page.getByRole('status', { name: 'Settled scroll submits', exact: true })).toHaveText('1');
    await page.evaluate(() => new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    ));

    const state = JSON.parse((await page.getByRole('status', { name: 'First error capture', exact: true }).textContent())!);
    expect(state.calls).toEqual([]);
    if (action === 'Reset scroll fields') expect(state.failed?.outOfDate).toBe(true);
    else expect(state.failed).toBeNull();
    await expect(page.getByRole('button', { name: 'Release scroll validation', exact: true })).toBeFocused();
  });
}

for (const action of ['Replace model after failure', 'Unmount after failure']) {
  test(`Form avoids scrolling an obsolete binding when onFinishFailed requests ${action}`, async ({ page }) => {
    await page.goto('/?fixture=form-scroll-first');
    await act(page, action);
    await act(page, 'Submit scroll form');
    await expect(page.getByRole('status', { name: 'Settled scroll submits', exact: true })).toHaveText('1');
    await expect.poll(async () => {
      const state = JSON.parse((await page.getByRole('status', { name: 'First error capture', exact: true }).textContent())!);
      return state.failed?.outOfDate;
    }).toBe(false);
    await page.evaluate(() => new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    ));

    const state = JSON.parse((await page.getByRole('status', { name: 'First error capture', exact: true }).textContent())!);
    expect(state.calls).toEqual([]);
    await expect(page.getByRole('button', { name: 'Submit scroll form', exact: true })).toBeFocused();
  });
}
