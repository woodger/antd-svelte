import { test, expect } from './test';
import reference from './fixtures/ant-design-slider-scalar-reference.json' with { type: 'json' };
import { snapshotSliderScalar } from './slider-scalar-metrics';

test.use({ viewport: reference.viewport });
const keyCodes: Record<string, number> = {
  ArrowRight: 39, ArrowUp: 38, PageDown: 34, Home: 36, End: 35
};

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=slider-scalar');
  await expect(page.getByRole('heading', { name: 'Scalar Slider source API', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Scalar Slider matches source marks, styling, ARIA and keys for ${sample.name}`,
    async ({ page }) => {
      await page.getByRole('combobox', { name: 'Scalar preset', exact: true })
        .selectOption(sample.name);
      await page.mouse.move(0, 0);

      await expect.poll(() => page.evaluate(snapshotSliderScalar)).toEqual(sample.base);

      const input = page.locator('[data-scalar-case]').getByRole('slider');
      if (sample.keys.length) await input.focus();
      for (const step of sample.keys) {
        if (sample.keysTransport === 'physical') await input.press(step.key);
        else {
          const keyCode = keyCodes[step.key];
          await input.dispatchEvent('keydown', { key: step.key, keyCode, bubbles: true });
          await input.dispatchEvent('keyup', { key: step.key, keyCode, bubbles: true });
        }

        await expect(input).toHaveAttribute('aria-valuenow', step.value!);
      }
      for (const pointer of sample.pointers) {
        const root = page.locator('[data-scalar-case] .ant-slider');
        const box = (await root.boundingBox())!;
        const vertical = sample.base.classes.includes('ant-slider-vertical');
        await page.mouse.click(box.x + box.width * (vertical ? 0.5 : pointer.ratio),
          box.y + box.height * (vertical ? pointer.ratio : 0.5));

        await expect(input).toHaveAttribute('aria-valuenow', pointer.value!);
      }
      await expect(page.getByLabel('Scalar changes', { exact: true }))
        .toHaveText(JSON.stringify(sample.events));
    });
}

test('Scalar mark clicks preserve numeric callback order and native form submission', async ({ page }) => {
  const input = page.locator('[data-scalar-case]').getByRole('slider');
  await input.focus();

  await page.getByRole('button', { name: 'Warm', exact: true }).click();

  await expect(input).toHaveValue('25');
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Scalar owner', { exact: true })).toHaveText('25');
  await expect(page.getByLabel('Scalar changes', { exact: true }))
    .toHaveText('[{"next":25,"previous":null}]');
  await expect(page.getByLabel('Scalar completions', { exact: true })).toHaveText('[25]');
  expect(await page.locator('#scalar-form').evaluate(form =>
    new FormData(form as HTMLFormElement).getAll('scalar'))).toEqual(['25']);
});

test('Scalar disabled handles leave Tab navigation and empty tabindex retains native focus',
  async ({ page }) => {
    const preset = page.getByRole('combobox', { name: 'Scalar preset', exact: true });
    await preset.selectOption('disabled-first');
    const input = page.locator('[data-scalar-case]').getByRole('slider');
    await expect(input).toBeDisabled();
    await page.getByLabel('Override scalar styles', { exact: true }).focus();
    await page.keyboard.press('Tab');

    await expect(page.getByRole('button', { name: 'Reset scalar form', exact: true })).toBeFocused();
    await preset.selectOption('aria-labelledby');
    await input.focus();

    await expect(input).toBeFocused();
    await input.press('ArrowRight');
    await expect(input).toHaveValue('49');
  });

test('Scalar mark updates retain the input, raw owner, focus and callback silence', async ({ page }) => {
  const input = page.locator('[data-scalar-case]').getByRole('slider');
  await page.getByRole('button', { name: 'Set scalar owner to 49', exact: true })
    .dispatchEvent('click');
  await input.focus();
  const original = await input.elementHandle();

  await page.getByLabel('Use alternate scalar marks', { exact: true }).dispatchEvent('click');

  await expect(input).toHaveValue('80');
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, before) => node === before, original)).toBe(true);
  await expect(page.getByLabel('Scalar owner', { exact: true })).toHaveText('49');
  await expect(page.getByLabel('Scalar changes', { exact: true })).toHaveText('[]');
  await expect(page.getByRole('button', { name: 'Updated', exact: true })).toBeVisible();
  expect(await page.locator('#scalar-form').evaluate(form =>
    new FormData(form as HTMLFormElement).get('scalar'))).toBe('80');
});

test('Scalar marks support native keyboard activation and disabled form omission', async ({ page }) => {
  const mark = page.getByRole('button', { name: 'Mild', exact: true });
  await mark.focus();
  await mark.press('Enter');

  await expect(mark).toBeFocused();
  await expect(page.locator('[data-scalar-case]').getByRole('slider')).toHaveValue('48');
  await page.getByLabel('Disable scalar', { exact: true }).dispatchEvent('click');

  await expect(mark).toBeDisabled();
  expect(await page.locator('#scalar-form').evaluate(form =>
    new FormData(form as HTMLFormElement).getAll('scalar'))).toEqual([]);
});

test('Scalar native reset restores the initial mark without extra callbacks', async ({ page }) => {
  const input = page.locator('[data-scalar-case]').getByRole('slider');
  await input.press('Home');
  const before = await page.getByLabel('Scalar changes', { exact: true }).textContent();

  await page.getByRole('button', { name: 'Reset scalar through ref', exact: true })
    .dispatchEvent('click');

  await expect(input).toHaveValue('48');
  await expect(page.getByLabel('Scalar owner', { exact: true })).toHaveText('48');
  await expect(page.getByLabel('Scalar changes', { exact: true })).toHaveText(before!);
});

test('Scalar key cancellation and focused removal retain native lifetime guards', async ({ page }) => {
  const input = page.locator('[data-scalar-case]').getByRole('slider');
  await page.getByLabel('Cancel scalar keys', { exact: true }).dispatchEvent('click');
  await input.focus();
  await input.press('ArrowRight');

  await expect(input).toHaveValue('48');
  await expect(page.getByLabel('Scalar changes', { exact: true })).toHaveText('[]');
  await page.getByLabel('Mount scalar', { exact: true }).dispatchEvent('click');

  await expect(input).toHaveCount(0);
  await expect(page.getByLabel('Scalar focus events', { exact: true }))
    .toHaveText('["focus","blur"]');
});

test('Scalar autoFocus and imperative refs use the native input once', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Scalar preset', exact: true }).selectOption('autofocus');
  const input = page.locator('[data-scalar-case]').getByRole('slider');

  await expect(input).toBeFocused();
  await expect(page.getByLabel('Scalar focus events', { exact: true })).toHaveText('["focus"]');
  await expect(page.getByLabel('Scalar native root', { exact: true })).toHaveText('DIV');
  await page.getByRole('button', { name: 'Blur scalar ref', exact: true }).dispatchEvent('click');
  await expect(input).not.toBeFocused();
  await page.getByRole('button', { name: 'Focus scalar ref', exact: true }).dispatchEvent('click');
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Scalar focus events', { exact: true }))
    .toHaveText('["focus","blur","focus"]');
});

test('Scalar semantic style updates keep the input, focus, value and callbacks', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Scalar preset', exact: true }).selectOption('callbacks');
  const input = page.locator('[data-scalar-case]').getByRole('slider');
  await input.focus();
  const original = await input.elementHandle();

  await page.getByLabel('Override scalar styles', { exact: true }).dispatchEvent('click');

  await expect(page.locator('[data-scalar-case] .ant-slider-rail')).toHaveCSS('height', '10px');
  await expect(page.locator('[data-scalar-case] .ant-slider')).toHaveCSS('color', 'rgb(30, 40, 50)');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('48');
  expect(await input.evaluate((node, before) => node === before, original)).toBe(true);
  await expect(page.getByLabel('Scalar changes', { exact: true })).toHaveText('[]');
});
