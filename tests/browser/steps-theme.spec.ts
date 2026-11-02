import { test, expect } from './test';
import reference from './fixtures/ant-design-steps-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/?fixture=steps-theme');
});

for (const sample of reference.cases) {
  for (const direction of ['ltr', 'rtl']) {
    test(`Steps and Timeline match Ant Design source metrics for ${sample.name}/${direction}`,
      async ({ page }) => {
        await page.getByLabel('Steps token preset', { exact: true }).selectOption(sample.name);
        if (direction === 'rtl') {
          await page.getByLabel('RTL themed Steps', { exact: true }).check();
        }

        for (const [name, expected] of Object.entries(sample.metrics)) {
          if (!name.startsWith(direction + '/')) continue;
          const variant = name.slice(direction.length + 1);
          const root = page.locator(`.steps-token-${variant}`);

          await expect.poll(() => root.evaluate((element, metrics: Record<
            string, Record<string, string>
          >) => {
            const rows = element.querySelectorAll(':scope > .ant-steps-item');
            const first = rows[0];
            return Object.fromEntries(Object.entries(metrics).map(([name, fields]) => {
              const target = name === 'root' ? element
                : name === 'nav' || name === 'item' ? first
                : name.startsWith('icon-') ? rows[Number(name.slice(5))]
                  .querySelector('.ant-steps-item-icon')
                : first.querySelector(`.ant-steps-item-${name === 'verticalRail' ? 'rail' : name}`);
              if (!target) throw new Error(`Missing Steps metric ${name}`);
              const css = getComputedStyle(target, name === 'nav' ? '::after' : null);
              return [name, Object.fromEntries(Object.keys(fields).map(key => [key,
                css[key as keyof CSSStyleDeclaration]
              ]))];
            }));
          }, expected), { message: `${sample.name}/${name}` }).toEqual(expected);
        }
      });
  }
}

test('token updates retain native step buttons, focus and controlled callbacks', async ({ page }) => {
  const root = page.locator('.steps-token-interactive');
  const button = root.getByRole('button', { name: 'Waiting Third', exact: true });
  await button.focus();
  const original = await button.elementHandle();

  await page.getByLabel('Steps icon size', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '44';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(root.locator('.ant-steps-item-icon').first()).toHaveCSS('width', '44px');
  await expect(button).toBeFocused();
  expect(await button.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(page.getByLabel('Steps theme events', { exact: true })).toHaveText('[]');
  await button.press('Enter');

  await expect(button).toHaveAttribute('aria-current', 'step');
  await expect(page.getByLabel('Steps theme events', { exact: true })).toHaveText('["change:2"]');
  await expect(root.getByRole('button', { name: 'Error Fourth', exact: true })).toBeDisabled();
});

test('algorithm changes preserve focused nodes and keyboard activation', async ({ page }) => {
  const root = page.locator('.steps-token-interactive');
  const button = root.getByRole('button', { name: 'Finished First', exact: true });
  await button.focus();
  const original = await button.elementHandle();

  await page.getByLabel('Steps token preset', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'steps-algorithm';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(root).toHaveCSS('font-size', '18px');
  await expect(button).toBeFocused();
  expect(await button.evaluate((element, previous) => element === previous, original)).toBe(true);
  await button.press('Space');

  await expect(button).toHaveAttribute('aria-current', 'step');
  await expect(page.getByLabel('Steps theme events', { exact: true })).toHaveText('["change:0"]');
});

test('semantic and plain styles retain priority over both component token sets', async ({ page }) => {
  await page.getByLabel('Steps token preset', { exact: true }).selectOption('steps-tokens');
  await page.getByLabel('Override Steps token styles', { exact: true }).check();

  await expect(page.locator('.steps-token-basic .ant-steps-item-icon').first())
    .toHaveCSS('width', '47px');
  await expect(page.locator('.steps-token-timeline .ant-steps-item-icon').first())
    .toHaveCSS('width', '27px');

  await page.getByLabel('Steps token preset', { exact: true }).selectOption('timeline-tokens');

  await expect(page.locator('.steps-token-basic .ant-steps-item-icon').first())
    .toHaveCSS('width', '47px');
  await expect(page.locator('.steps-token-timeline .ant-steps-item-icon').first())
    .toHaveCSS('width', '27px');
});

test('source scopes reset parent aliases and keep Steps aliases inside composed Timeline',
  async ({ page }) => {
    await page.getByLabel('Steps token preset', { exact: true }).selectOption('both-aliases');
    await page.getByLabel('Parent Steps aliases', { exact: true }).check();

    await expect(page.locator('.steps-token-basic')).toHaveCSS('font-size', '20px');
    await expect(page.locator('.steps-token-timeline')).toHaveCSS('font-size', '26px');
    await expect(page.locator('.steps-token-timeline .ant-steps-item-icon').first())
      .toHaveCSS('font-size', '20px');
    await expect(page.locator('.steps-token-timeline .ant-steps-item-title').first())
      .toHaveCSS('color', 'rgb(136, 51, 68)');
  });

test('source removal restores native metrics without remounting focused controls', async ({ page }) => {
  const root = page.locator('.steps-token-interactive');
  const button = root.getByRole('button', { name: 'Waiting Third', exact: true });
  const original = await button.elementHandle();
  await button.focus();

  await page.getByLabel('Apply source Steps tokens', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(root).not.toHaveClass(/ant-steps-source-theme/);
  await expect(root.locator('.ant-steps-item-icon').first()).toHaveCSS('width', '32px');
  await expect(button).toBeFocused();
  expect(await button.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(page.locator('style[data-ant-svelte-theme="steps-source-scope"]')).toHaveCount(0);
});

test('custom prefixes, hash removal and narrow RTL layouts keep keyboard access and scope cleanup',
  async ({ page }) => {
    await page.getByLabel('Steps token preset', { exact: true }).selectOption('custom-prefix');
    await page.getByLabel('Hash themed Steps', { exact: true }).uncheck();
    await page.getByLabel('RTL themed Steps', { exact: true }).check();
    await page.getByLabel('Narrow themed Steps', { exact: true }).check();
    const root = page.locator('.steps-token-interactive');

    await expect(root).not.toHaveClass(/(?:^|\s)css-[a-z0-9]+(?:\s|$)/);
    await expect(root.locator('.ant-steps-item-icon').first()).toHaveCSS('width', '36px');
    expect((await root.boundingBox())!.width).toBeLessThanOrEqual(200);
    const button = root.getByRole('button', { name: 'Waiting Third', exact: true });
    await button.focus();
    await button.press('Enter');

    await expect(button).toHaveAttribute('aria-current', 'step');
    await expect(page.getByLabel('Steps theme events', { exact: true })).toHaveText('["change:2"]');
    await page.getByLabel('Mount themed Steps', { exact: true }).uncheck();

    await expect(root).toHaveCount(0);
    await expect(page.locator('style[data-ant-svelte-theme="steps-source-scope"]')).toHaveCount(0);
  });
