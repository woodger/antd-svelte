import { test, expect } from './test';

interface BackTopMotionProbe {
  animations: Animation[];
  settled: Promise<void>[];
}

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=back-top'); });

test('BackTop keeps its root hidden until the inclusive scroll threshold and delegates native action',
  async ({ page }) => {
    const root = page.locator('#fixture-deprecated-back-top');
    const area = page.locator('#back-top-first');
    await expect(root).toBeHidden();
    await expect(root).toHaveCount(1);
    await area.evaluate(node => { node.scrollTop = 399; });
    await expect(root).toBeHidden();

    await area.evaluate(node => { node.scrollTop = 400; });

    await expect(root).toBeVisible();
    await expect(root.getByRole('button', { name: 'Наверх', exact: true })).toBeEnabled();
    await expect(page.getByLabel('Deprecated BackTop ref', { exact: true }))
      .toHaveText('fixture-deprecated-back-top');
    await root.getByRole('button').press('Enter');

    await expect.poll(() => area.evaluate(node => node.scrollTop)).toBe(0);
    await expect(root).toBeHidden();
    await expect(page.getByLabel('Deprecated BackTop clicks', { exact: true })).toHaveText('1');
    await expect(page.getByLabel('Deprecated BackTop current target', { exact: true }))
      .toHaveText('fixture-deprecated-back-top');
  });

test('BackTop updates visibilityHeight at rest and changes scroll targets without stale events',
  async ({ page }) => {
    const root = page.locator('#fixture-deprecated-back-top');
    const first = page.locator('#back-top-first');
    const second = page.locator('#back-top-second');
    await page.getByLabel('Deprecated BackTop threshold', { exact: true }).fill('0');
    await expect(root).toBeVisible();

    await page.getByLabel('Deprecated BackTop threshold', { exact: true }).fill('400');

    await expect(root).toBeHidden();
    await first.evaluate(node => { node.scrollTop = 450; });
    await expect(root).toBeVisible();

    await page.getByRole('combobox', { name: 'Deprecated BackTop target', exact: true })
      .selectOption('second');

    await expect(root).toBeHidden();
    await first.evaluate(node => { node.scrollTop = 800; });
    await second.evaluate(node => { node.scrollTop = 450; });
    await expect(root).toBeVisible();

    await page.getByRole('combobox', { name: 'Deprecated BackTop target', exact: true })
      .selectOption('null');

    await expect(root).toBeHidden();
  });

for (const target of ['window', 'document']) {
  test(`BackTop scrolls ${target} and respects reduced motion`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Deprecated BackTop target', exact: true })
      .selectOption(target);
    await page.getByLabel('Deprecated BackTop duration', { exact: true }).fill('450');
    await page.evaluate(() => {
      document.body.style.minHeight = '4000px';
      window.scrollTo(0, 800);
    });
    const root = page.locator('#fixture-deprecated-back-top');
    await expect(root).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await root.getByRole('button').click();

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(root).toBeHidden();
  });
}

test('BackTop keeps locale, RTL, component aliases and local styles reactive', async ({ page }) => {
  await page.getByLabel('Deprecated BackTop threshold', { exact: true }).fill('0');
  const root = page.locator('#fixture-deprecated-back-top');
  await expect(root.getByRole('button', { name: 'Наверх', exact: true })).toBeVisible();

  await page.getByLabel('English locale', { exact: true }).check();
  await page.getByLabel('Right to left', { exact: true }).check();
  await page.getByRole('button', { name: 'Update deprecated BackTop theme', exact: true }).click();

  await expect(root).toHaveAttribute('dir', 'rtl');
  await expect(root).toHaveCSS('z-index', '777');
  await expect(root.getByRole('button', { name: 'Back to top', exact: true }))
    .toHaveCSS('width', '48px');
  await expect(root.locator('.ant-back-top-icon')).toHaveCSS('font-size', '32px');

  await page.getByLabel('Custom BackTop prefix', { exact: true }).check();
  await page.getByLabel('Local BackTop style', { exact: true }).check();

  await expect(root).toHaveClass(/owned-top-rtl/);
  await expect(root).toHaveCSS('z-index', '901');
  await expect(root.locator('.owned-top-content')).toHaveCSS('height', '56px');
});

test('BackTop theme changes preserve custom controls, focus, selection and form values',
  async ({ page }) => {
    await page.getByLabel('Deprecated BackTop threshold', { exact: true }).fill('0');
    await page.getByRole('combobox', { name: 'Deprecated BackTop content', exact: true })
      .selectOption('control');
    const root = page.locator('#fixture-deprecated-back-top');
    const input = root.getByRole('textbox', { name: 'BackTop draft', exact: true });
    await input.fill('BackTop draft retained');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const previous = await input.elementHandle();
    const previousRoot = await root.elementHandle();

    await page.getByRole('button', { name: 'Update deprecated BackTop theme', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveCSS('z-index', '777');
    await expect(input).toHaveValue('BackTop draft retained');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, previous)).toBe(true);
    expect(await root.evaluate((node, old) => node === old, previousRoot)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await page.getByRole('form', { name: 'Deprecated BackTop form', exact: true })
      .evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
      .toBe('BackTop draft retained');

    await page.getByLabel('Replace BackTop custom root', { exact: true }).check();
    await root.getByRole('button', { name: 'Custom top', exact: true }).press('Space');

    await expect(root.locator('[data-back-top-custom]')).toHaveJSProperty('tagName', 'SPAN');
    await expect(page.getByLabel('Deprecated BackTop clicks', { exact: true })).toHaveText('1');
  });

test('BackTop handles empty/text snippets and removes owned styles and listeners on unmount',
  async ({ page }) => {
    await page.getByLabel('Deprecated BackTop threshold', { exact: true }).fill('0');
    const root = page.locator('#fixture-deprecated-back-top');
    await page.getByRole('combobox', { name: 'Deprecated BackTop content', exact: true })
      .selectOption('empty');
    await expect(root).toBeHidden();

    await page.getByRole('combobox', { name: 'Deprecated BackTop content', exact: true })
      .selectOption('text');

    await expect(root).toBeVisible();
    await expect(root).toHaveText('Up');
    await page.getByLabel('Mount deprecated BackTop', { exact: true }).uncheck();
    await page.locator('#back-top-first').evaluate(node => { node.scrollTop = 800; });

    await expect(root).toHaveCount(0);
    await expect(page.locator('head style[data-ant-svelte-theme^="ant-svelte-back-top-"]'))
      .toHaveCount(0);
    await expect(page.getByLabel('Deprecated BackTop clicks', { exact: true })).toHaveText('0');
  });

test('BackTop cancels obsolete fades and follows replaced snippet roots through unmount',
  async ({ page }) => {
    await page.evaluate(() => {
      const probe: BackTopMotionProbe = { animations: [], settled: [] };
      (window as typeof window & { backTopMotion: BackTopMotionProbe }).backTopMotion = probe;
      const animate = Element.prototype.animate;
      // Останавливаем реальную анимацию до кадра, сохраняя её настоящий finished Promise.
      Element.prototype.animate = function (this: Element, frames, options) {
        const animation = animate.call(this, frames, options);
        if (this.parentElement?.id === 'fixture-deprecated-back-top') {
          probe.animations.push(animation);
          probe.settled.push(animation.finished.then(() => {}, () => {}));
          animation.pause();
        }
        return animation;
      };
    });
    const root = page.locator('#fixture-deprecated-back-top');
    const threshold = page.getByLabel('Deprecated BackTop threshold', { exact: true });
    await page.getByLabel('Animate deprecated BackTop', { exact: true }).check();
    await threshold.fill('0');
    const action = root.locator(':scope > button');
    await expect.poll(() => action.evaluate(node => node.getAnimations().length)).toBe(1);
    await action.evaluate(node => node.getAnimations()[0].finish());
    await expect.poll(() => action.evaluate(node => node.getAnimations().length)).toBe(0);
    const previous = await action.elementHandle();

    await threshold.fill('400');

    await expect(root).toHaveJSProperty('inert', true);
    await expect(root).toHaveJSProperty('hidden', false);
    await expect.poll(() => action.evaluate(node => node.getAnimations().length)).toBe(1);
    await action.evaluate(node => { node.getAnimations()[0].currentTime = 50; });

    await threshold.fill('0');
    await page.evaluate(async () => {
      await (window as typeof window & { backTopMotion: BackTopMotionProbe })
        .backTopMotion.settled[1];
    });

    await expect(root).toBeVisible();
    await expect(root).toHaveJSProperty('inert', false);
    expect(await action.evaluate((node, old) => node === old, previous)).toBe(true);
    await action.evaluate(node => node.getAnimations()[0].finish());
    await expect.poll(() => action.evaluate(node => node.getAnimations().length)).toBe(0);
    await page.getByRole('combobox', { name: 'Deprecated BackTop content', exact: true })
      .selectOption('control');
    const custom = root.locator('[data-back-top-custom]');
    const previousCustom = await custom.elementHandle();
    await page.getByLabel('Replace BackTop custom root', { exact: true }).check();
    await expect(custom).toHaveJSProperty('tagName', 'SPAN');

    await threshold.fill('400');

    await expect.poll(() => custom.evaluate(node => node.getAnimations().length)).toBe(1);
    expect(await previousCustom!.evaluate(node => node.isConnected)).toBe(false);
    await expect(root).toHaveJSProperty('inert', true);

    await page.getByLabel('Mount deprecated BackTop', { exact: true }).uncheck();
    const cancelled = await page.evaluate(async () => {
      const probe = (window as typeof window & { backTopMotion: BackTopMotionProbe }).backTopMotion;
      await Promise.all(probe.settled);
      return probe.animations.map(animation => animation.playState);
    });

    expect(cancelled).toEqual(['idle', 'idle', 'idle', 'idle']);
    await expect(root).toHaveCount(0);
    await expect(page.locator('head style[data-ant-svelte-theme^="ant-svelte-back-top-"]'))
      .toHaveCount(0);
  });
