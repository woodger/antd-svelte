import { test, expect } from './test';
import reference from './fixtures/ant-design-back-top-theme-reference.json' with { type: 'json' };
import { snapshotBackTopTheme } from './back-top-theme-metrics';

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=back-top-theme'); });

for (const sample of reference.cases) {
  for (const [mode, state] of Object.entries(sample.states)) {
    test(`BackTop registered source styles match ${sample.name}/${mode}`, async ({ page }) => {
      await page.getByRole('combobox', { name: 'BackTop theme preset', exact: true })
        .selectOption(sample.name);
      await page.getByRole('combobox', { name: 'BackTop theme mode', exact: true }).selectOption(mode);
      await page.setViewportSize({ width: state.width, height: 800 });
      const root = page.locator('#back-top-control');
      await root.waitFor({ state: 'attached' });
      if (mode === 'hover') {
        const position = await root.evaluate(node => {
          const target = node.firstElementChild ?? node;
          const box = target.getBoundingClientRect();
          return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        });
        await page.mouse.move(position.x, position.y);
      } else await page.mouse.move(1, 1);

      await expect.poll(() => page.evaluate(snapshotBackTopTheme)).toEqual(state.expected);
    });
  }
}

test('BackTop token and media updates retain the same root and native action', async ({ page }) => {
  const root = page.locator('#back-top-control');
  const action = root.getByRole('button');
  const previousRoot = await root.elementHandle();
  const previousAction = await action.elementHandle();
  await action.focus();

  await page.getByRole('button', { name: 'Update BackTop theme tokens', exact: true })
    .dispatchEvent('click');

  await expect(root).toHaveCSS('z-index', '999');
  await expect(action).toHaveCSS('width', '52px');
  await expect(action).toBeFocused();
  expect(await root.evaluate((node, old) => node === old, previousRoot)).toBe(true);
  expect(await action.evaluate((node, old) => node === old, previousAction)).toBe(true);

  await page.getByRole('combobox', { name: 'BackTop theme preset', exact: true })
    .selectOption('global-media');
  await page.setViewportSize({ width: 800, height: 800 });

  await expect(root).toHaveCSS('inset-inline-end', '78px');
  expect(await root.evaluate((node, old) => node === old, previousRoot)).toBe(true);
});
