import { test, expect } from './test';
import reference from './fixtures/ant-design-notification-theme-reference.json' with { type: 'json' };
import { snapshotNotificationTheme } from './notification-theme-metrics';
import backgroundObservation
  from './fixtures/ant-design-notification-background-observation.json' with { type: 'json' };
import widthObservation
  from './fixtures/ant-design-notification-width-observation.json' with { type: 'json' };

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=notification-theme'); });
const antPrefix = reference.cases.find(sample => sample.name === 'component-aliases')!;

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Notification ${scope} theme matches source card for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Notification theme preset', { exact: true })
          .selectOption(sample.name);
        await page.getByLabel('Notification theme scope', { exact: true }).selectOption(scope);
        await expect(page.locator('.ant-notification-notice')).toBeVisible();
        await page.mouse.move(20, 1100);

        // В 6.6.8 status backgrounds привязаны к ant prefix; native bridge учитывает другой prefix.
        const matched = sample.name === 'custom-css-prefix' ? {
          ...expected,
          notice: {
            ...expected.notice,
            'background-color': antPrefix.scopes[scope as keyof typeof antPrefix.scopes]
              .notice['background-color']
          }
        } : expected;

        await expect.poll(() => page.evaluate(snapshotNotificationTheme)).toEqual(matched);
      });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Notification ${mode} theme matches source card for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Notification theme preset', { exact: true })
          .selectOption(sample.name);
        await page.getByLabel('Notification theme mode', { exact: true }).selectOption(mode);
        await expect(page.locator('.ant-notification-notice')).toBeVisible();
        await page.mouse.move(20, 1100);
        if (mode === 'close-hover') await page.locator('.ant-notification-notice-close').hover();

        const matched = sample.name === 'custom-css-prefix' ? {
          ...expected,
          notice: {
            ...expected.notice,
            'background-color': antPrefix.modes[mode as keyof typeof antPrefix.modes]
              .notice['background-color']
          }
        } : expected;

        await expect.poll(() => page.evaluate(snapshotNotificationTheme)).toEqual(matched);
      });
  }
}

test('Notification token updates preserve action controls, selection, focus and viewport styles',
  async ({ page }) => {
    await page.getByLabel('Edit themed Notification', { exact: true }).check();
    const input = page.getByRole('textbox', { name: 'Notification draft', exact: true });
    await input.fill('Retained draft');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const surface = page.locator('.ant-notification-surface');
    const notice = page.locator('.ant-notification-notice');
    const action = page.getByRole('button', { name: 'Action', exact: true });
    const originalSurface = await surface.elementHandle();
    const originalNotice = await notice.elementHandle();
    const originalInput = await input.elementHandle();
    const originalAction = await action.elementHandle();
    const viewport = await surface.evaluate(node => [node.style.width, node.style.left]);
    expect(viewport.every(Boolean)).toBe(true);

    await page.getByRole('button', { name: 'Update Notification tokens', exact: true })
      .dispatchEvent('click');

    await expect(notice).toHaveCSS('width', '460px');
    await expect(notice).toHaveCSS('background-color', 'rgb(255, 240, 246)');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Retained draft');
    expect(await surface.evaluate((node, old) => node === old, originalSurface)).toBe(true);
    expect(await notice.evaluate((node, old) => node === old, originalNotice)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await action.evaluate((node, old) => node === old, originalAction)).toBe(true);
    expect(await surface.evaluate(node => [node.style.width, node.style.left])).toEqual(viewport);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await page.getByRole('form', { name: 'Notification theme form' }).evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Retained draft');
    await expect(page.getByLabel('Notification theme events', { exact: true })).toHaveText('[]');

    await action.click();

    await expect(page.getByLabel('Notification theme events', { exact: true }))
      .toHaveText('["action"]');
    await expect(notice).toBeVisible();
  });

test('Notification inheritance reset preserves the focused action and removes parent colors',
  async ({ page }) => {
    await page.getByLabel('Notification theme scope', { exact: true }).selectOption('nested');
    const action = page.getByRole('button', { name: 'Action', exact: true });
    await action.focus();
    const notice = page.locator('.ant-notification-notice');
    const original = await notice.elementHandle();
    const expected = reference.cases.find(sample => sample.name === 'default')!.scopes.nested;

    await page.getByLabel('Inherit Notification theme', { exact: true }).dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotNotificationTheme)).toEqual(expected);
    expect(await notice.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(action).toBeFocused();
    await expect(page.getByLabel('Notification theme events', { exact: true })).toHaveText('[]');
  });

test('Notification token updates do not restart a running duration timer', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));
  await page.reload();
  await page.getByRole('button', { name: 'Open timed themed notification', exact: true })
    .dispatchEvent('click');
  const timed = page.locator('.timed-theme-notification');
  await expect(timed).toBeVisible();

  await page.clock.runFor(600);
  await page.getByRole('button', { name: 'Update Notification tokens', exact: true })
    .dispatchEvent('click');

  await expect(timed).toHaveCSS('width', '460px');
  await expect(timed).toBeVisible();
  await expect(page.getByLabel('Notification theme events', { exact: true })).toHaveText('[]');

  await page.clock.runFor(400);

  await expect(timed).toHaveCount(0);
  await expect(page.locator('.ant-notification-notice')).toHaveCount(1);
  await expect(page.getByLabel('Notification theme events', { exact: true }))
    .toHaveText('["timed-close"]');
});

test('Notification keeps the action draft through legacy styling and reads the current theme on reopen',
  async ({ page }) => {
    await page.getByLabel('Edit themed Notification', { exact: true }).check();
    const input = page.getByRole('textbox', { name: 'Notification draft', exact: true });
    await input.fill('Legacy draft');
    const original = await input.elementHandle();

    await page.getByLabel('Apply source Notification theme', { exact: true })
      .dispatchEvent('click');

    await expect(page.locator('.ant-notification-notice')).toHaveCSS('width', '384px');
    await expect(input).toHaveValue('Legacy draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(page.getByLabel('Notification theme events', { exact: true })).toHaveText('[]');

    await page.getByRole('button', { name: 'Close', exact: true }).click();

    await expect(page.locator('.ant-notification-notice')).toHaveCount(0);
    await expect(page.getByLabel('Notification theme events', { exact: true }))
      .toHaveText('["close"]');

    await page.getByRole('button', { name: 'Update Notification tokens', exact: true }).click();
    await page.getByLabel('Apply source Notification theme', { exact: true }).check();
    await page.getByRole('button', { name: 'Open another themed notification', exact: true })
      .click();

    await expect(page.locator('.ant-notification-notice-title'))
      .toHaveText('Reopened notification');
    await expect(page.locator('.ant-notification-notice')).toHaveCSS('width', '460px');
    await expect(page.locator('.ant-notification-notice'))
      .toHaveCSS('background-color', 'rgb(255, 240, 246)');

    await page.getByLabel('Mount themed Notification', { exact: true }).uncheck();

    await expect(page.locator('.ant-notification-surface')).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
  });

for (const mode of ['success', 'warning'] as const) {
  test(`Notification keeps an explicit ${mode} background equal to its global alias`,
    async ({ page }) => {
      await page.getByLabel('Notification theme preset', { exact: true })
        .selectOption('component-tokens');
      await page.getByLabel('Notification theme mode', { exact: true }).selectOption(mode);
      const original = await page.locator('.ant-notification-notice').elementHandle();
      const source = backgroundObservation.cases.find(
        sample => sample.name === 'component-tokens'
      )!;
      const equivalent = reference.cases.find(sample => sample.name === 'component-tokens')!;
      expect(source.backgrounds[mode]).not.toBe(equivalent.modes[mode].notice['background-color']);

      await page.getByLabel('Explicit matching Notification colors', { exact: true }).check();

      await expect(page.locator('.ant-notification-notice'))
        .toHaveCSS('background-color', equivalent.modes[mode].notice['background-color']);
      expect(await page.locator('.ant-notification-notice').evaluate((node, old) => node === old,
        original)).toBe(true);
    });
}

test('Notification keeps close reachable with explicit undefined width instead of source clipping',
  async ({ page }) => {
    const source = widthObservation.cases.find(sample => sample.name === 'undefined-width')!;
    expect(source.metrics.closeHit?.hit).toBe(false);

    await page.getByLabel('Undefined Notification width', { exact: true }).check();
    await page.getByRole('button', { name: 'Close', exact: true }).click();

    await expect(page.locator('.ant-notification-notice')).toHaveCount(0);
    await expect(page.getByLabel('Notification theme events', { exact: true }))
      .toHaveText('["close"]');
  });
