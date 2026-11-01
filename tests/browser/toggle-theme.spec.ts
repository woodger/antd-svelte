import { test, expect } from './test';
import reference from './fixtures/ant-design-toggle-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=toggle-theme');
  await expect(page.getByRole('heading', { name: 'Source checkable tokens', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`checkable geometry and colors match the official UMD for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Checkable token preset', { exact: true }).selectOption(sample.name);

    const controls = {
      radio: page.locator('#themed-radio').locator('..'),
      checkbox: page.locator('#themed-checkbox').locator('..'),
      switch: page.locator('#themed-switch'),
      small: page.locator('#themed-small-switch')
    };
    for (const name of Object.keys(controls) as (keyof typeof controls)[]) {
      const metric = sample.metrics[name];
      await expect(controls[name]).toHaveCSS('width', metric.width);
      await expect(controls[name]).toHaveCSS('height', metric.height);
      await expect(controls[name]).toHaveCSS('background-color', metric.backgroundColor);
      await expect(controls[name]).toHaveCSS('border-width', metric.borderWidth);
    }
  });
}

test('prepared Radio variables reach both group appearances and use unitless dimensions', async ({ page }) => {
  await page.getByLabel('Checkable token preset', { exact: true }).selectOption('own-radio');

  await expect(page.locator('#themed-radio-group .ant-radio').first()).toHaveCSS('width', '24px');
  await expect(page.locator('#themed-radio-group .ant-radio-wrapper').first())
    .toHaveCSS('margin-inline-end', '13px');
  const selected = page.locator('#themed-button-group .ant-radio-button-wrapper-checked');
  await expect(selected).toHaveCSS('background-color', 'rgb(250, 204, 0)');
  await expect(selected).toHaveCSS('padding-inline-start', '18px');
  expect(await page.locator('#themed-radio').evaluate(element =>
    getComputedStyle(element).getPropertyValue('--ant-radio-radio-size').trim()
  )).toBe('24');
});

test('Checkbox groups consume their own aliases without changing nearby controls', async ({ page }) => {
  await page.getByLabel('Checkable token preset', { exact: true }).selectOption('checkbox-aliases');

  const selected = page.locator('#themed-checkbox-group .ant-checkbox-checked');
  await expect(selected).toHaveCSS('width', '25px');
  await expect(selected).toHaveCSS('background-color', 'rgb(0, 185, 107)');
  await expect(page.locator('#outside-themed-checkbox').locator('..'))
    .toHaveCSS('width', '16px');
  await expect(page.locator('#themed-switch')).toHaveCSS('background-color', 'rgb(22, 119, 255)');
});

test('Switch applies handle metrics in both sizes and preserves plain style priority', async ({ page }) => {
  await page.getByLabel('Checkable token preset', { exact: true }).selectOption('own-switch');

  await expect(page.locator('#themed-switch .ant-switch-handle')).toHaveCSS('width', '25px');
  await expect(page.locator('#themed-small-switch .ant-switch-handle')).toHaveCSS('width', '13px');
  await expect(page.locator('#toggle-style-priority')).toHaveCSS('height', '37px');
});

test('token updates retain the native input, focus, value and callback contract', async ({ page }) => {
  const input = page.getByLabel('Themed checkbox', { exact: true });
  await input.uncheck();
  await input.focus();
  const previous = await input.elementHandle();

  await page.getByLabel('Checkable token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'checkbox-aliases';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(input.locator('..')).toHaveCSS('width', '25px');
  expect(await input.evaluate((element, old) => element === old, previous)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).not.toBeChecked();
  await expect(page.getByLabel('Checkable change count', { exact: true })).toHaveText('1');

  await page.getByRole('button', { name: 'Reset themed checkables', exact: true }).click();

  await expect(input).toBeChecked();
  expect(await page.locator('#toggle-theme-form').evaluate(element =>
    new FormData(element as HTMLFormElement).get('single-check')
  )).toBe('chosen');
});

test('nested provider inheritance can reset component aliases', async ({ page }) => {
  await page.getByLabel('Checkable token preset', { exact: true }).selectOption('checkbox-aliases');
  await expect(page.locator('#nested-themed-checkbox').locator('..')).toHaveCSS('width', '25px');

  await page.getByLabel('Inherit child checkables', { exact: true }).uncheck();

  await expect(page.locator('#nested-themed-checkbox').locator('..')).toHaveCSS('width', '16px');
  await expect(page.locator('#nested-themed-checkbox').locator('..'))
    .toHaveCSS('background-color', 'rgb(22, 119, 255)');
});

test('custom CSS prefixes work on group roots with hashing disabled', async ({ page }) => {
  await page.getByLabel('Checkable token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Hash themed checkables', { exact: true }).uncheck();

  for (const id of ['themed-radio-group', 'themed-checkbox-group', 'themed-switch']) {
    await expect(page.locator('#' + id)).toHaveClass(/toggle-source-scope/);
    await expect(page.locator('#' + id)).not.toHaveClass(/css-dev-only/);
  }
  await expect(page.locator('#themed-radio-group .ant-radio').first()).toHaveCSS('width', '23px');
  await expect(page.locator('#themed-checkbox-group .ant-checkbox').first()).toHaveCSS('width', '21px');
});

test('removing source settings and unmounting clears component variables and scope styles', async ({ page }) => {
  await page.getByLabel('Checkable token preset', { exact: true }).selectOption('own-switch');
  const style = page.locator('head style[data-ant-svelte-theme="toggle-source-scope"]');
  await expect(style).toHaveCount(1);

  await page.getByLabel('Apply source checkable tokens', { exact: true }).uncheck();

  await expect(page.locator('#themed-switch')).toHaveCSS('height', '22px');
  await expect(style).toHaveCount(0);

  await page.getByLabel('Apply source checkable tokens', { exact: true }).check();
  await expect(page.locator('#themed-switch')).toHaveCSS('height', '31px');
  await page.getByLabel('Mount themed checkables', { exact: true }).uncheck();

  await expect(style).toHaveCount(0);
});
