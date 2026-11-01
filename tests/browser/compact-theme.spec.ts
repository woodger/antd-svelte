import { test, expect } from './test';
import reference from './fixtures/ant-design-compact-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=compact-theme');
  await expect(page.getByRole('heading', { name: 'Compact theme metrics', exact: true })).toBeVisible();
});

for (const mode of ['native', 'source']) {
  for (const sample of reference.cases) {
    test(`${mode} metrics match the official UMD for ${sample.name}/${sample.size}`, async ({ page }) => {
      await page.getByLabel('Compact theme mode', { exact: true }).selectOption(mode);
      await page.getByLabel('Compact theme preset', { exact: true }).selectOption(sample.name);
      await page.getByLabel('Compact control size', { exact: true }).selectOption(sample.size);

      const controls = {
        input: page.locator('#compact-metrics-input'),
        select: page.locator('#compact-metrics .ant-select'),
        number: page.locator('#compact-metrics .ant-input-number'),
        numberInput: page.locator('#compact-metrics-number'),
        button: page.locator('#compact-metrics-button')
      };
      for (const name of Object.keys(controls) as (keyof typeof controls)[]) {
        const metrics = sample.metrics[name];
        await expect.poll(async () => (await controls[name].boundingBox())?.height)
          .toBeCloseTo(metrics.height, 2);
        for (const key of ['fontSize', 'lineHeight', 'paddingBlockStart', 'paddingBlockEnd',
          'paddingInlineStart', 'paddingInlineEnd'] as const) {
          const value = await controls[name].evaluate((element, property) =>
            getComputedStyle(element)[property], key);
          expect(value, `${name}.${key}`).toBe(metrics[key]);
        }
      }
    });
  }
}

for (const mode of ['native', 'source', 'native-token', 'source-parent']) {
  test(`${mode} CSS text metrics agree with calculated tokens`, async ({ page }) => {
    await page.getByLabel('Compact theme mode', { exact: true }).selectOption(mode);
    await page.getByLabel('Compact theme preset', { exact: true }).selectOption('dark-compact');

    const tokenData = await page.locator('#compact-metrics').getAttribute('data-tokens');
    const tokens: Record<string, number> = JSON.parse(tokenData!);
    const css = await page.locator('#compact-metrics').evaluate(element => {
      const style = getComputedStyle(element);
      return Object.fromEntries(['font-size', 'font-size-sm', 'font-size-lg', 'line-height',
        'line-height-sm', 'line-height-lg', 'font-height', 'font-height-sm', 'font-height-lg',
        'control-height', 'control-height-sm', 'control-height-lg']
        .map(name => [name, style.getPropertyValue(`--ant-${name}`).trim()]));
    });
    for (const [name, value] of Object.entries(css)) {
      const token = name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
        .replace(/Sm$/, 'SM').replace(/Lg$/, 'LG');
      expect(Number.parseFloat(value), name).toBeCloseTo(tokens[token], 8);
    }
    for (const selector of ['.ant-input', '.ant-select', '.ant-input-number', '.ant-btn']) {
      await expect(page.locator('#compact-metrics').locator(selector).first()).toHaveCSS('height', '28px');
    }
  });
}

test('native metrics retain legacy colors and keep source styles disabled', async ({ page }) => {
  await page.getByLabel('Compact theme preset', { exact: true }).selectOption('dark-compact');

  await expect(page.locator('#compact-metrics-button')).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await expect(page.locator('#compact-metrics-input')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(page.locator('head style[data-ant-svelte-theme]')).toHaveCount(1);
  await expect(page.locator('.compact-metrics-provider')).not.toHaveAttribute('style');
  await expect(page.locator('#compact-metrics-button')).not.toHaveClass(/css-var-|css-dev-only/);
});

test('native compact inheritance, explicit false and reset remain isolated', async ({ page }) => {
  for (const id of ['compact-inherited', 'compact-normal-child', 'compact-reset-child',
    'compact-outside']) {
    await expect(page.locator(`#${id}-input`))
      .toHaveCSS('height', id === 'compact-inherited' ? '28px' : '32px');
  }
  await expect(page.locator('#compact-style-priority')).toHaveCSS('padding-block-start', '9px');
  await expect(page.locator('#compact-style-priority')).toHaveCSS('padding-inline-start', '17px');
});

test('theme switches retain input identity, edits and focus while updating metrics', async ({ page }) => {
  const input = page.locator('#compact-metrics-input');
  await input.fill('Edited value');
  const original = await input.elementHandle();

  await page.getByLabel('Compact theme preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'default';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(input).toHaveCSS('height', '32px');
  await expect(input).toHaveValue('Edited value');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element, previous) => element === previous, original)).toBe(true);

  await page.getByLabel('Compact theme preset', { exact: true }).selectOption('compact');
  await expect(input).toHaveCSS('height', '28px');
  await page.getByLabel('Compact theme mode', { exact: true }).selectOption('source');
  await expect(input).toHaveCSS('height', '28px');
  await expect(input).toHaveValue('Edited value');
});
