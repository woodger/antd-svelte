import { test, expect } from './test';
import reference from './fixtures/ant-design-spin-source-reference.json' with { type: 'json' };
import { snapshotSpinSource } from './spin-source-metrics';

const root = '[data-spin-source] > [data-ant-spin-root]';
const caseSelect = 'Spin source case';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  const time = new Date('2026-11-04T00:00:00Z');
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto('/?fixture=spin-source');
  await expect(page.getByRole('heading', { name: 'Source Spin', exact: true })).toBeVisible();
});

for (const sample of reference.cases) {
  test(`Spin matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: caseSelect, exact: true }).selectOption(sample.name);
    const snapshot = () => page.evaluate(snapshotSpinSource, sample.props.prefixCls || 'ant-spin');
    const hiddenStandalone = ['inactive', 'delayed'].includes(sample.name);

    if (hiddenStandalone) {
      const actual = await snapshot();
      expect(actual.root.classes).toEqual(sample.snapshot.root.classes);
      expect(actual.dot).toBeNull();
      expect(actual.progress).toBeNull();
      await expect(page.locator(root)).toBeHidden();
    } else {
      await expect.poll(snapshot).toEqual(sample.snapshot);
    }
    await expect(page.getByLabel('Spin source ref', { exact: true })).toHaveText('true');
  });
}

test(
  'Spin auto progress follows the source clock and restarts after a new loading cycle',
  async ({ page }) => {
    await page.getByRole('combobox', { name: caseSelect, exact: true }).selectOption('auto');
    const value = () => page.locator(root).evaluate(node => Number(
      [...node.classList].find(name => name.startsWith('percent-'))!.slice(8)
    ));
    let previous = 0;

    for (const sample of reference.auto) {
      await page.clock.runFor(sample.time - previous);
      await expect.poll(value).toBe(sample.value);
      previous = sample.time;
    }
    const progress = page.locator(root).getByRole('progressbar');
    await expect(progress).toHaveAttribute('aria-valuenow', '96.01238963686535');

    await page.getByRole('button', { name: 'Stop source Spin', exact: true }).dispatchEvent('click');
    await page.clock.runFor(1000);

    await expect(progress).toHaveCount(0);
    await expect.poll(value).toBe(96.01238963686535);
    await page.getByRole('button', { name: 'Start source Spin', exact: true })
      .dispatchEvent('click');

    await expect.poll(value).toBe(0);
    await page.clock.runFor(200);
    await expect(progress).toHaveAttribute('aria-valuenow', '5');
  }
);

test(
  'Spin clamps numeric circles and retains the mounted ring when progress returns to zero',
  async ({ page }) => {
    const progress = page.locator(root).getByRole('progressbar');
    await expect(progress).toHaveCount(0);

    await page.getByRole('button', { name: 'Quarter Spin percent', exact: true }).click();

    await expect(progress).toHaveAttribute('aria-valuenow', '25');
    await expect(progress).toHaveAccessibleName('Загрузка…');
    const original = await progress.elementHandle();
    await page.getByRole('button', { name: 'Overflow Spin percent', exact: true }).click();

    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await page.getByRole('button', { name: 'Zero Spin percent', exact: true }).click();

    await expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(await progress.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(page.locator(root).locator('[data-ant-spin-part="progress"]'))
      .toHaveCSS('opacity', '0');
  }
);

test(
  'Spin auto timing starts after its delay and survives unrelated token and prefix changes',
  async ({ page }) => {
    await page.getByRole('combobox', { name: caseSelect, exact: true }).selectOption('delayed');
    await page.getByRole('button', { name: 'Auto Spin percent', exact: true }).click();
    const progress = page.locator(root).getByRole('progressbar');
    await page.clock.runFor(499);

    await expect(progress).toHaveCount(0);
    await page.clock.runFor(1);
    await expect(page.locator(root)).toBeVisible();
    await expect(progress).toHaveCount(0);
    await page.clock.runFor(200);

    await expect(progress).toHaveAttribute('aria-valuenow', '5');
    await page.getByRole('button', { name: 'Change Spin token', exact: true }).click();
    await page.getByRole('button', { name: 'Change Spin prefix', exact: true }).click();
    await page.clock.runFor(200);

    await expect(progress).toHaveAttribute('aria-valuenow', '9.75');
    await expect(page.locator(root).locator('.live-spin-dot')).toHaveCSS('width', '34px');
  }
);

test('Spin releases auto intervals on numeric mode, stop and unmount', async ({ page }) => {
  await page.evaluate(() => {
    const view = window as typeof window & { spinIntervals: Set<number>; };
    const start = window.setInterval;
    const clear = window.clearInterval;
    view.spinIntervals = new Set();
    window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      const id = start(handler, timeout, ...args);
      if (timeout === 200) view.spinIntervals.add(id);
      return id;
    }) as typeof setInterval;
    window.clearInterval = id => {
      view.spinIntervals.delete(Number(id));
      clear(id);
    };
  });
  const active = () => page.evaluate(() => (
    window as typeof window & { spinIntervals: Set<number>; }
  ).spinIntervals.size);
  for (const action of ['Quarter Spin percent', 'Stop source Spin', 'Toggle source Spin mount']) {
    await page.getByRole('button', { name: 'Auto Spin percent', exact: true })
      .dispatchEvent('click');
    await page.getByRole('button', { name: 'Start source Spin', exact: true })
      .dispatchEvent('click');
    await expect.poll(active).toBe(1);

    await page.getByRole('button', { name: action, exact: true }).dispatchEvent('click');
    await expect.poll(active).toBe(0);
    await page.clock.runFor(1000);
    await expect.poll(active).toBe(0);
  }
  await expect(page.getByLabel('Spin source ref', { exact: true })).toHaveText('false');
});

test(
  'Spin fullscreen stays in its DOM branch without trapping focus or making outside controls inert',
  async ({ page }) => {
    await page.getByRole('combobox', { name: caseSelect, exact: true }).selectOption('fullscreen');
    const spinner = page.locator(root);
    await expect(spinner).toHaveCSS('position', 'fixed');
    expect(await spinner.evaluate(node => node.parentElement?.hasAttribute('data-spin-source')))
      .toBe(true);
    await expect(spinner).toHaveCSS('pointer-events', 'auto');
    const outside = page.getByRole('textbox', { name: 'Spin source outside', exact: true });
    await outside.focus();
    await outside.press('Tab');

    await expect(page.getByRole('button', { name: 'Before source Spin', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Stop source Spin', exact: true }).dispatchEvent('click');

    await expect(spinner).toHaveCSS('pointer-events', 'none');
    await expect(spinner).toHaveCSS('opacity', '0');
    await expect(spinner).not.toHaveAttribute('hidden');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    await outside.fill('Available again');
    await expect(outside).toHaveValue('Available again');
  }
);

test(
  'Spin prefix and fullscreen updates retain children, native refs, drafts and focus recovery',
  async ({ page }) => {
    await page.getByRole('combobox', { name: caseSelect, exact: true }).selectOption('nested');
    await page.getByRole('button', { name: 'Stop source Spin', exact: true }).dispatchEvent('click');
    const draft = page.getByRole('textbox', { name: 'Spin source draft', exact: true });
    const original = await draft.elementHandle();
    const originalRoot = await page.locator(root).elementHandle();
    await draft.fill('Retained source draft');
    await page.getByRole('button', { name: 'Child counter 0', exact: true }).click();
    await draft.focus();
    await page.getByRole('button', { name: 'Start source Spin', exact: true })
      .dispatchEvent('click');

    await expect(page.locator(root)).toBeFocused();
    await page.getByRole('button', { name: 'Toggle source fullscreen', exact: true })
      .dispatchEvent('click');
    await page.getByRole('button', { name: 'Change Spin prefix', exact: true })
      .dispatchEvent('click');
    await page.getByRole('button', { name: 'Change Spin token', exact: true }).dispatchEvent('click');
    await page.getByRole('button', { name: 'Stop source Spin', exact: true }).dispatchEvent('click');

    await expect(draft).toHaveValue('Retained source draft');
    await expect(draft).toBeFocused();
    await expect(page.locator(root).locator('button')).toHaveText('Child counter 1');
    expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await page.locator(root).evaluate((node, old) => node === old, originalRoot)).toBe(true);
    await expect(page.getByLabel('Spin source ref', { exact: true })).toHaveText('true');
  }
);

test(
  'Spin theme scopes isolate tokens and keep explicit semantic and local variable precedence',
  async ({ page }) => {
    await page.getByLabel('Show Spin scopes', { exact: true }).check();
    const width = (scope: string) => page.locator(`[data-spin-scope="${scope}"] .ant-spin-dot`);

    for (const [scope, size] of [['parent', 30], ['child', 18], ['child-default', 9], ['reset', 20],
      ['priority', 38], ['neighbor', 24], ['outside', 20]] as const) {
      await expect(width(scope)).toHaveCSS('width', `${size}px`);
    }
    await expect(page.locator('[data-spin-scope="parent"]'))
      .toHaveCSS('--ant-spin-content-height', '260px');
    await page.getByRole('button', { name: 'Change Spin token', exact: true }).click();

    await expect(width('parent')).toHaveCSS('width', '34px');
    await expect(width('child')).toHaveCSS('width', '18px');
    await expect(width('child-default')).toHaveCSS('width', '9px');
    await expect(width('neighbor')).toHaveCSS('width', '24px');
    await expect(width('outside')).toHaveCSS('width', '20px');
  }
);

test(
  'Spin default indicator setter updates fallback on the next props change',
  async ({ page }) => {
    await expect(page.locator(root).locator('.ant-spin-dot-item')).toHaveCount(4);
    await page.getByRole('button', { name: 'Set global Spin indicator', exact: true }).click();

    await expect(page.locator(root).locator('.ant-spin-dot-item')).toHaveCount(4);
    await page.getByRole('button', { name: 'Refresh Spin props', exact: true }).click();

    await expect(page.locator(root).locator('[data-spin-custom="replacement"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Quarter Spin percent', exact: true }).click();
    await expect(page.locator(root).locator('[data-spin-custom]'))
      .toHaveAttribute('data-spin-percent', '25');
  }
);

test(
  'Spin reduced motion suppresses progress and fullscreen transitions with a custom prefix',
  async ({ page }) => {
    await page.getByRole('combobox', { name: caseSelect, exact: true }).selectOption('local-prefix');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Toggle source fullscreen', exact: true }).click();

    await expect(page.locator(root)).toHaveCSS('transition-duration', '0s');
    await expect(page.locator(root).locator('[data-ant-spin-part="progress"]'))
      .toHaveCSS('transition-duration', '0s');
    await expect(page.locator(root).locator('circle').first()).toHaveCSS('transition-duration', '0s');
    expect(await page.locator(root).evaluate(node => node.getAnimations({ subtree: true }).length))
      .toBe(0);
  }
);
