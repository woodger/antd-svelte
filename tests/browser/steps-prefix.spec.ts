import { test, expect } from './test';
import reference from './fixtures/ant-design-steps-prefix-reference.json' with { type: 'json' };
import { snapshotStepsPrefix } from './steps-prefix-metrics';

for (const entry of reference.cases) {
  test(`Steps prefix matches source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=steps-prefix');
    await page.getByRole('combobox', { name: 'Steps prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotStepsPrefix)).toEqual(entry.metrics);
  });
}

test('Steps prefix updates keep root identity and sibling scope', async ({ page }) => {
  await page.goto('/?fixture=steps-prefix');
  const select = page.getByRole('combobox', { name: 'Steps prefix transition', exact: true });
  await select.selectOption('before');
  const original = await page.locator('[data-steps-prefix="normal"] ol').elementHandle();

  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect.poll(() => page.evaluate(snapshotStepsPrefix)).toEqual(entry.metrics);
    expect(entry.sameRoot).toBe(true);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-steps-prefix="normal"] ol'
    ), original)).toBe(true);
  }
});

test('Steps prefix updates keep keyboard focus, selection and Icon context', async ({ page }) => {
  await page.goto('/?fixture=steps-prefix');
  await page.getByRole('checkbox', { name: 'Interactive prefix steps', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Custom prefix icons', exact: true }).check();
  const host = page.locator('[data-steps-prefix="normal"]');
  const first = host.getByRole('button', { name: 'First Sub A', exact: true });
  const second = host.getByRole('button', { name: 'Second', exact: true });
  const original = await first.elementHandle();
  const id = await host.locator('ol').getAttribute('id');
  await first.focus();
  await page.keyboard.press('Tab');
  await expect(second).toBeFocused();
  await expect(second).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(second).toHaveAttribute('aria-current', 'step');

  const select = page.getByRole('combobox', { name: 'Steps prefix transition', exact: true });
  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute('aria-current', 'step');
    expect(await host.locator('ol').getAttribute('id')).toBe(id);
    expect(await first.evaluate((node, previous) => node === previous, original)).toBe(true);
    const prefix = entry.sample.prefixCls || 'ant-steps';
    await expect(host.getByTestId('prefix-step-icon').first())
      .toHaveClass(new RegExp(`(^| )${prefix}-item-icon( |$)`));
  }
});

test('Steps custom prefix retains focus recovery on item removal', async ({ page }) => {
  await page.goto('/?fixture=steps-prefix');
  await page.getByRole('checkbox', { name: 'Interactive prefix steps', exact: true }).check();
  const host = page.locator('[data-steps-prefix="normal"]');
  await host.getByRole('button', { name: 'First Sub A', exact: true }).focus();
  await page.getByRole('checkbox', { name: 'Remove first prefix step', exact: true })
    .evaluate(node => (node as HTMLInputElement).click());

  await expect(host.getByRole('button', { name: 'Second', exact: true })).toBeFocused();
});
