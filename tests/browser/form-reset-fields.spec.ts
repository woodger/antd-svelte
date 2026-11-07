import { test, expect } from './test';
import type { ElementHandle } from '@playwright/test';
import reference from './fixtures/ant-design-form-reset-fields-observation.json' with { type: 'json' };

test('Form resetFields matches source exact metadata, remounts, scratch state and focus across paths and lists', async ({ page }) => {
  await page.goto('/?fixture=form-reset-fields');
  await expect(page.locator('#form-reset-fields-fixture')).toBeVisible();
  const actions: Record<string, string> = {
    seeded: 'Seed reset fields', 'nested-reset': 'Reset nested field',
    'parent-seeded': 'Seed reset parent', 'parent-reset': 'Reset parent value',
    'literal-reset': 'Reset literal field', 'numeric-reset': 'Reset numeric field',
    'string-reset': 'Reset string field', 'missing-reset': 'Reset missing value',
    'empty-reset': 'Reset no fields', 'repeated-reset': 'Reset repeated field',
    'root-value-reset': 'Reset root value', 'full-reset': 'Reset all fields',
    'list-initial': 'Show reset list', 'list-seeded': 'Seed reset list',
    'row-value-reset': 'Reset row value', 'row-field-reset': 'Reset row field',
    'list-reset': 'Reset list field', 'list-full-reset': 'Reset all fields',
    'fallback-initial': 'Show reset fallback',
    'fallback-seeded': 'Seed reset fallback', 'fallback-reset': 'Reset list field'
  };
  let previous: Record<string, ElementHandle> = {};

  for (const sample of reference.cases) {
    if (sample.id === 'list-initial' || sample.id === 'fallback-initial') previous = {};
    if (actions[sample.id]) {
      await page.getByRole('button', { name: actions[sample.id], exact: true }).evaluate(
        (button: HTMLButtonElement) => { button.click(); }
      );
    }
    const { id, controls, focus, ...model } = sample;
    const { keys, ...withoutKeys } = model as typeof model & { keys?: number[] };
    await expect.poll(async () => {
      const actual = JSON.parse((await page.getByRole('status', {
        name: 'Reset fields snapshot', exact: true
      }).textContent())!);
      // Счётчики снятых строк остаются в истории; source публикует только видимые controls.
      return { ...actual, mounts: Object.fromEntries(
        Object.keys(controls).map((tag) => [tag, actual.mounts[tag]])
      ) };
    }).toEqual({ ...withoutKeys, mounts: Object.fromEntries(
      Object.entries(controls).map(([tag, control]) => [tag, control.mounts])
    ) });
    await expect(page.locator('[data-reset-probe]'), id).toHaveCount(Object.keys(controls).length);
    if (keys) {
      await expect(page.getByRole('status', { name: 'Reset list keys', exact: true }))
        .toHaveText(JSON.stringify(keys));
    }
    for (const [tag, control] of Object.entries(controls)) {
      const input = page.locator(`[data-reset-main="${tag}"]`);
      const stale = reference.observations.find((entry) => entry.case === id && entry.tag === tag);
      // Source оставляет stale input после сброса родителя; здесь видимое значение должно совпасть со store.
      await expect(input, id).toHaveValue(stale ? String(stale.store ?? '') : control.value);
      await expect(page.locator(`[data-reset-local="${tag}"]`), id).toHaveValue(control.local);
      if (control.retained !== null) {
        expect(await input.evaluate((element, old) => element === old, previous[tag]), id)
          .toBe(control.retained);
      }
      previous[tag] = (await input.elementHandle())!;
    }
    expect(await page.evaluate(() => {
      const input = document.activeElement as HTMLInputElement | null;
      return input?.dataset.resetLocal ? {
        tag: input.dataset.resetLocal, selection: [input.selectionStart, input.selectionEnd]
      } : null;
    }), id).toEqual(focus);
  }
});

test('Form named reset keeps old validation messages out of its newly mounted control', async ({ page }) => {
  await page.goto('/?fixture=form-reset-fields');
  await page.getByRole('button', { name: 'Validate held reset field', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Reset pending', exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'Reset held field', exact: true }).click();
  await page.getByRole('button', { name: 'Complete reset validations', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Reset validation result', exact: true }))
    .toHaveText('outdated');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByLabel('Bound name', { exact: true })).toHaveValue('Anna');
});

test('Form reset retains the local rules of controls nested inside a reset field', async ({ page }) => {
  await page.goto('/?fixture=form-reset-fields');
  await page.getByRole('button', { name: 'Show reset compound', exact: true }).click();
  await page.getByLabel('Bound child', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Reset compound group', exact: true }).click();
  await page.getByRole('button', { name: 'Validate compound child', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Reset validation result', exact: true }))
    .toHaveText('invalid');
  await expect(page.getByLabel('Bound child', { exact: true }))
    .toHaveAccessibleDescription('Child required');
});

test('Form reset restores native focus and selection to its newly mounted associated control', async ({ page }) => {
  await page.goto('/?fixture=form-reset-fields');
  const input = page.getByLabel('Bound name', { exact: true });
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 3); });
  const previous = await input.elementHandle();
  await page.getByRole('button', { name: 'Reset held field', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );

  await expect(input).toBeFocused();
  expect(await input.evaluate((element, old) => element === old, previous)).toBe(false);
  expect(await input.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 3]);
});

test('Form reset respects focus moved by the caller before the next DOM commit', async ({ page }) => {
  await page.goto('/?fixture=form-reset-fields');
  const input = page.getByLabel('Bound name', { exact: true });
  const sibling = page.getByLabel('Local sibling', { exact: true });
  await input.focus();
  await page.getByRole('button', { name: 'Reset held field', exact: true }).evaluate(
    (button: HTMLButtonElement) => {
      button.click();
      document.querySelector<HTMLInputElement>('[data-reset-local="sibling"]')!.focus();
    }
  );

  await expect(sibling).toBeFocused();
  await expect(page.getByRole('status', { name: 'Reset fields snapshot', exact: true }))
    .toContainText('"name":2');
  await expect(sibling).toBeFocused();
});
