import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=switch-features');
  await expect(page.getByRole('switch', { name: 'Source switch', exact: true })).toBeVisible();
});

test(
  'Switch emits native cancellation, binding, source change and source click in order',
  async ({ page }) => {
    await page.getByRole('switch', { name: 'Source switch', exact: true }).click();

    await expect(page.getByLabel('Source switch owner', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toHaveText('native-click|checked:true|change:true:click:BUTTON|click:true:click');
    await expect(page.getByLabel('Source switch submits', { exact: true })).toHaveText('0');
  }
);

test(
  'Switch arrows emit repeated source changes before key callbacks without a click',
  async ({ page }) => {
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });
    await control.press('ArrowRight');

    await expect(control).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toHaveText('checked:true|change:true:keydown:BUTTON|source-key:ArrowRight|native-key:ArrowRight');

    await page.getByRole('button', { name: 'Clear source switch events', exact: true }).click();
    await control.press('ArrowRight');

    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toHaveText('checked:true|change:true:keydown:BUTTON|source-key:ArrowRight|native-key:ArrowRight');

    await control.press('ArrowLeft');

    await expect(control).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toContainText('checked:false|change:false:keydown:BUTTON|source-key:ArrowLeft|native-key:ArrowLeft');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .not.toContainText('click');
  }
);

test(
  'Switch keeps physical left and right meanings in RTL',
  async ({ page }) => {
    await page.getByLabel('Right to left', { exact: true }).check();
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });

    await control.press('ArrowRight');

    await expect(control).toHaveAttribute('aria-checked', 'true');

    await control.press('ArrowLeft');

    await expect(control).toHaveAttribute('aria-checked', 'false');
  }
);

test(
  'Switch uses source legacy key codes for synthetic events without a key name',
  async ({ page }) => {
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });

    await control.dispatchEvent('keydown', { keyCode: 39 });

    await expect(control).toHaveAttribute('aria-checked', 'true');

    await control.dispatchEvent('keydown', { keyCode: 37 });

    await expect(control).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('button', { name: 'Clear source switch events', exact: true }).click();

    await control.dispatchEvent('keydown', { key: 'ArrowRight', keyCode: 38 });

    await expect(control).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toHaveText('source-key:ArrowRight|native-key:ArrowRight');
  }
);

test(
  'Switch value alias updates its binding and accepts external values without events',
  async ({ page }) => {
    const control = page.getByRole('switch', { name: 'Alias switch', exact: true });

    await control.click();

    await expect(page.getByLabel('Source switch alias owner', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('Source switch alias events', { exact: true }))
      .toHaveText('[true]');

    await page.getByRole('button', { name: 'Set source switch alias', exact: true }).click();

    await expect(control).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByLabel('Source switch alias events', { exact: true }))
      .toHaveText('[true]');
  }
);

test(
  'Switch checked overrides value and explicit false defaults override defaultValue',
  async ({ page }) => {
    const priority = page.getByRole('switch', { name: 'Priority switch', exact: true });
    await expect(priority).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('switch', { name: 'Default priority switch', exact: true }))
      .toHaveAttribute('aria-checked', 'false');

    await priority.click();
    await priority.click();

    await expect(priority).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByLabel('Source switch priority owners', { exact: true }))
      .toHaveText('false|true');
  }
);

test(
  'Switch captures defaultValue once and restores it through native reset',
  async ({ page }) => {
    const control = page.getByRole('switch', { name: 'Default alias switch', exact: true });
    await expect(control).toHaveAttribute('aria-checked', 'true');

    await control.click();
    await page.getByRole('button', { name: 'Replace source switch default', exact: true }).click();
    await page.getByRole('button', { name: 'Reset source switches', exact: true }).click();

    await expect(control).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('Source switch events', { exact: true })).toHaveText('');
    await expect(page.getByLabel('Source switch alias events', { exact: true })).toHaveText('[]');
  }
);

test(
  'Switch function binding can reject state while callbacks report the requested value',
  async ({ page }) => {
    await page.getByLabel('Freeze source switch', { exact: true }).check();
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });

    await control.click();

    await expect(control).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByLabel('Source switch owner', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toHaveText('native-click|checked:true|change:true:click:BUTTON|click:true:click');
  }
);

test(
  'Switch native preventDefault cancels source callbacks and state',
  async ({ page }) => {
    await page.getByLabel('Cancel source switch click', { exact: true }).check();

    await page.getByRole('switch', { name: 'Source switch', exact: true }).click();

    await expect(page.getByLabel('Source switch owner', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toHaveText('native-click');
  }
);

test(
  'Switch loading blocks pointer and arrow changes without losing native disabled state',
  async ({ page }) => {
    await page.getByLabel('Load source switch', { exact: true }).check();
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });

    await control.dispatchEvent('click');
    await control.dispatchEvent('keydown', { key: 'ArrowRight', keyCode: 39 });

    await expect(control).toBeDisabled();
    await expect(control).toHaveAttribute('aria-busy', 'true');
    await expect(control).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .not.toContainText('change:');
  }
);

test(
  'Switch merges semantic config into both content spans and keeps root style priority',
  async ({ page }) => {
    await page.getByLabel('Style source switch', { exact: true }).check();
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });

    await expect(control).toHaveCSS('color', 'rgb(255, 165, 0)');
    await expect(control).toHaveClass(/switch-config-medium-false/);
    await expect(control.locator('.ant-switch-handle')).toHaveClass(/switch-config-indicator/);
    await expect(control.locator('.ant-switch-handle')).toHaveCSS('outline-style', 'solid');
    await expect(control.locator('.switch-config-content.switch-local-content')).toHaveCount(2);
    await expect(control.locator('.ant-switch-inner-unchecked')).toHaveText('0');
    await expect(control.locator('.ant-switch-inner-unchecked'))
      .toHaveCSS('color', 'rgb(128, 0, 128)');
    await expect(control.locator('.ant-switch-inner-unchecked')).toHaveCSS('font-weight', '700');
    await expect(page.getByRole('switch', { name: 'Inherited switch config', exact: true }))
      .toHaveClass(/switch-config-middle-false/);

    await control.click();

    await expect(control).toHaveAccessibleName('Source switch');
    await expect(control.locator('.ant-switch-inner-checked strong')).toHaveText('Rich ON');
  }
);

test(
  'Switch medium, middle and default sizes use the ordinary track while small stays small',
  async ({ page }) => {
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });

    for (const size of ['medium', 'middle', 'default', 'small']) {
      await page.getByLabel('Source switch size', { exact: true }).selectOption(size);

      await expect(control).toHaveCSS('height', size === 'small' ? '16px' : '22px');
    }
  }
);

test(
  'Switch refs and instance methods expose focus and blur and clear on unmount',
  async ({ page }) => {
    const control = page.getByRole('switch', { name: 'Source switch', exact: true });
    await expect(page.getByLabel('Source switch refs', { exact: true })).toHaveText('true');
    await expect(control).toHaveAttribute('tabindex', '2');

    await page.getByRole('button', { name: 'Focus source switch ref', exact: true }).click();

    await expect(control).toBeFocused();

    await page.getByRole('button', { name: 'Blur source switch ref', exact: true }).click();
    await page.getByRole('button', { name: 'Focus source switch instance', exact: true }).click();

    await expect(control).toBeFocused();

    await page.getByRole('button', { name: 'Blur source switch instance', exact: true }).click();

    await expect(control).not.toBeFocused();
    await expect(page.getByLabel('Source switch focus events', { exact: true }))
      .toContainText('source-focus|native-focus|source-blur|native-blur');

    await page.getByLabel('Mount source switch', { exact: true }).uncheck();

    await expect(page.getByLabel('Source switch refs', { exact: true })).toHaveText('false');
  }
);

test(
  'Switch autoFocus focuses its native button on remount',
  async ({ page }) => {
    await page.getByLabel('Mount source switch', { exact: true }).uncheck();
    await page.getByLabel('Autofocus source switch', { exact: true }).check();

    await page.getByLabel('Mount source switch', { exact: true }).check();

    await expect(page.getByRole('switch', { name: 'Source switch', exact: true })).toBeFocused();
  }
);

test(
  'Switch keyed replacement can blur old props and keeps a stable accessible label',
  async ({ page }) => {
    const control = page.getByRole('switch', { name: 'Keyed source switch', exact: true });
    await control.focus();

    await page.getByRole('button', { name: 'Replace keyed source switch', exact: true }).click();

    await expect(control).toHaveAttribute('aria-checked', 'false');
    await expect(control.locator('.ant-switch-inner-checked')).toHaveText('1');
  }
);

test(
  'Switch change callback can synchronously unmount without invoking a stale source click',
  async ({ page }) => {
    await page.getByLabel('Remove source switch on change', { exact: true }).check();

    await page.getByRole('switch', { name: 'Source switch', exact: true }).click();

    await expect(page.getByRole('switch', { name: 'Source switch', exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Source switch events', { exact: true }))
      .toHaveText('native-click|checked:true|change:true:click:BUTTON');
    await expect(page.getByLabel('Source switch refs', { exact: true })).toHaveText('false');
  }
);

test(
  'Switch cancels a scheduled native reset when removed before its timer runs',
  async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T11:59:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T12:00:00Z'));
    await page.getByRole('switch', { name: 'Source switch', exact: true }).click();
    await page.getByRole('button', { name: 'Clear source switch events', exact: true }).click();

    await page.getByRole('button', { name: 'Reset and remove source switch', exact: true }).click();
    await page.clock.runFor(1000);

    await expect(page.getByLabel('Source switch owner', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('Source switch events', { exact: true })).toHaveText('');
    await expect(page.getByLabel('Source switch refs', { exact: true })).toHaveText('false');
  }
);

test(
  'Switch source aliases serialize one native value and reset without source events',
  async ({ page }) => {
    await page.getByRole('switch', { name: 'Source switch', exact: true }).click();
    await page.getByRole('switch', { name: 'Alias switch', exact: true }).click();

    expect(await page.locator('#source-switch-form').evaluate((form: HTMLFormElement) =>
      [...new FormData(form)])).toEqual([['enabled', 'on'], ['alias', 'on'], ['default', 'on']]);

    await page.getByRole('button', { name: 'Clear source switch events', exact: true }).click();
    await page.getByRole('button', { name: 'Reset source switches', exact: true }).click();

    await expect(page.getByLabel('Source switch owner', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source switch alias owner', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source switch events', { exact: true })).toHaveText('');
    await expect(page.getByLabel('Source switch alias events', { exact: true }))
      .toHaveText('[true]');
  }
);

test(
  'Switch external canonical changes do not call source change or click',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Set source switch owner', exact: true }).click();

    await expect(page.getByRole('switch', { name: 'Source switch', exact: true }))
      .toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('Source switch events', { exact: true })).toHaveText('');
  }
);

test.describe('mobile Switch source features', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'keeps rich content usable in dark compact RTL without widening the viewport',
    async ({ page }) => {
      for (const label of ['Dark source switch', 'Compact source switch', 'Right to left']) {
        await page.getByLabel(label, { exact: true }).check();
      }

      const control = page.getByRole('switch', { name: 'Source switch', exact: true });
      await control.tap();

      await expect(control).toHaveAttribute('aria-checked', 'true');
      await expect(control).toHaveCSS('direction', 'rtl');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
    }
  );
});
