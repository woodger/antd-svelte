import type { Page } from '@playwright/test';
import { test, expect } from './test';

function sourceNumber(page: Page) {
  return page.getByRole('spinbutton', { name: 'Source number', exact: true });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=input-number-features');
  await expect(sourceNumber(page)).toHaveValue('1.2');
});

test(
  'InputNumber stringMode preserves precise strings through steps, callbacks and FormData',
  async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Precise string number', exact: true });
    const next = '9007199254740993.00000000000002';

    await input.press('ArrowUp');

    await expect(input).toHaveValue(next);
    await expect(input).toHaveAttribute('aria-valuenow', next);
    await expect(page.getByLabel('Precise number owner', { exact: true })).toHaveText(JSON.stringify(next));
    await expect(page.getByLabel('Precise number changes', { exact: true })).toHaveText(JSON.stringify([next]));
    expect(await page.locator('#source-number-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).getAll('high'))).toEqual([next]);
  }
);

test(
  'InputNumber stringMode clamps a draft only on commit and keeps the canonical model string',
  async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Precise string number', exact: true });

    await input.fill('9007199254740995');

    await expect(page.getByLabel('Precise number changes', { exact: true })).toHaveText('[]');
    await expect(input.locator('..')).toHaveClass(/ant-input-number-out-of-range/);

    await input.press('Tab');

    await expect(input).toHaveValue('9007199254740994.00000000000000');
    await expect(page.getByLabel('Precise number owner', { exact: true }))
      .toHaveText('"9007199254740994"');
  }
);

test(
  'InputNumber stringMode confirms an externally supplied out-of-range value on blur',
  async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Precise string number', exact: true });
    await page.getByRole('button', { name: 'Exceed precise number owner', exact: true }).click();

    await expect(page.getByLabel('Precise number changes', { exact: true })).toHaveText('[]');
    await input.focus();
    await input.press('Tab');

    await expect(input).toHaveValue('9007199254740994.00000000000000');
    await expect(page.getByLabel('Precise number changes', { exact: true }))
      .toHaveText('["9007199254740994"]');
  }
);

test(
  'InputNumber emits source and native callbacks before onInput and confirms before onPressEnter',
  async ({ page }) => {
    const input = sourceNumber(page);

    await input.fill('1.4');

    await expect(page.getByLabel('Source number events', { exact: true }))
      .toHaveText('change:1.4|value:1.4|input:1.4');

    await input.press('Enter');

    await expect(page.getByLabel('Source number events', { exact: true }))
      .toHaveText('change:1.4|value:1.4|input:1.4|enter');
    await expect(page.getByLabel('Source number submissions', { exact: true })).toHaveText('1');
    expect(JSON.parse(await page.getByLabel('Source number form data', { exact: true }).innerText()).amount)
      .toBe('1.4');
  }
);

test(
  'InputNumber reports source step emitters and applies Shift as a tenfold decimal step',
  async ({ page }) => {
    const input = sourceNumber(page);

    await input.press('ArrowUp');

    await expect(input).toHaveValue('1.3');
    await expect(page.getByLabel('Source number step', { exact: true }))
      .toHaveText('{"offset":0.1,"type":"up","emitter":"keyboard"}');

    await input.press('Shift+ArrowUp');

    await expect(input).toHaveValue('2.3');
    await expect(page.getByLabel('Source number step', { exact: true }))
      .toHaveText('{"offset":"1","type":"up","emitter":"keyboard"}');
  }
);

test(
  'InputNumber wheel is opt-in, prevents scrolling while focused and releases on blur',
  async ({ page }) => {
    const input = sourceNumber(page);
    await input.focus();

    expect(await input.evaluate(element => element.dispatchEvent(new WheelEvent('wheel', {
      deltaY: -1, bubbles: true, cancelable: true
    })))).toBe(true);
    await expect(input).toHaveValue('1.2');

    await page.getByLabel('Wheel source number', { exact: true }).check();
    await input.focus();

    expect(await input.evaluate(element => element.dispatchEvent(new WheelEvent('wheel', {
      deltaY: -1, bubbles: true, cancelable: true
    })))).toBe(false);
    await expect(input).toHaveValue('1.3');
    await expect(page.getByLabel('Source number step', { exact: true }))
      .toHaveText('{"offset":0.1,"type":"up","emitter":"wheel"}');

    await page.getByRole('button', { name: 'Ref blur source number', exact: true }).click();

    expect(await input.evaluate(element => element.dispatchEvent(new WheelEvent('wheel', {
      deltaY: -1, bubbles: true, cancelable: true
    })))).toBe(true);
    await expect(input).toHaveValue('1.3');
  }
);

test(
  'InputNumber changeOnBlur false retains a draft and Enter confirms even with keyboard false',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Commit source number on blur', { exact: true }).uncheck();
    await page.getByLabel('Keyboard source number', { exact: true }).uncheck();

    await input.fill('99');
    await input.press('Tab');

    await expect(input).toHaveValue('99');
    await expect(page.getByLabel('Source number owner', { exact: true })).toHaveText('1.2');

    await input.press('Enter');

    await expect(input).toHaveValue('10');
    await expect(page.getByLabel('Source number events', { exact: true }))
      .toHaveText('input:99|change:10|value:10|enter');
  }
);

test(
  'InputNumber function binding supports a rejected owner without committing its draft',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Freeze source number', { exact: true }).check();

    await input.fill('2.4');

    await expect(input).toHaveValue('2.4');
    await expect(input).toHaveAttribute('aria-valuenow', '1.2');
    await expect(page.getByLabel('Source number owner', { exact: true })).toHaveText('1.2');

    await input.press('Tab');

    await expect(input).toHaveValue('1.2');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('1.2');
    await expect(page.getByLabel('Source number step', { exact: true }))
      .toHaveText('{"offset":0.1,"type":"up","emitter":"keyboard"}');
  }
);

test(
  'InputNumber changing external values and bounds emits no feedback and can step back into range',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByRole('button', { name: 'Exceed source number owner', exact: true }).click();
    await page.getByRole('button', { name: 'Shrink source number max', exact: true }).click();

    await expect(input).toHaveValue('15');
    await expect(input).toHaveAttribute('aria-valuemax', '2');
    await expect(input.locator('..')).toHaveClass(/ant-input-number-out-of-range/);
    await expect(page.getByLabel('Source number events', { exact: true })).toHaveText('');

    await input.press('ArrowDown');

    await expect(input).toHaveValue('2');
    await expect(input.locator('..')).not.toHaveClass(/ant-input-number-out-of-range/);
  }
);

test(
  'InputNumber decimalSeparator changes display while preserving numeric precision and form values',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Comma source number', { exact: true }).check();
    await page.getByRole('button', { name: 'Source number precision two', exact: true }).click();

    await input.fill('1,005');
    await input.press('Tab');

    await expect(input).toHaveValue('1,01');
    await expect(page.getByLabel('Source number owner', { exact: true })).toHaveText('1.01');
    expect(await page.locator('#source-number-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).getAll('amount'))).toEqual(['1.01']);
  }
);

test(
  'InputNumber formatter can replace a selected value after refocus without restoring an old caret',
  async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Currency number', exact: true });

    await input.fill('5000');
    await input.press('Tab');
    await expect(input).toHaveValue('$ 5,000');

    await input.fill('3000');

    await expect(input).toHaveValue('$ 3,000');
    await expect(page.getByLabel('Currency number owner', { exact: true })).toHaveText('3000');
  }
);

test(
  'InputNumber formatter preserves the editable raw minus zero until blur',
  async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Currency number', exact: true });
    await page.getByLabel('Percent source formatter', { exact: true }).check();

    await expect(input).toHaveValue('1234%');
    await input.fill('-');
    await input.fill('-0');

    await expect(input).toHaveValue('-0');
    await expect(page.getByLabel('Currency number owner', { exact: true })).toHaveText('0');

    await input.press('Tab');

    await expect(input).toHaveValue('0%');
  }
);

test(
  'InputNumber normalizes a fullwidth decimal separator in the next animation frame',
  async ({ page }) => {
    const input = sourceNumber(page);

    await input.fill('1。5');

    await expect(input).toHaveValue('1.5');
    await expect(page.getByLabel('Source number owner', { exact: true })).toHaveText('1.5');
    await expect(page.getByLabel('Source number events', { exact: true }))
      .toHaveText('input:1。5|change:1.5|value:1.5|input:1.5');
  }
);

test(
  'InputNumber ref and bind:this focus support start, end, all and blur',
  async ({ page }) => {
    const input = sourceNumber(page);
    await expect(page.getByLabel('Source number refs', { exact: true })).toHaveText('true');

    for (const [label, range] of [
      ['Ref focus source start', [0, 0]],
      ['Ref focus source end', [3, 3]],
      ['Ref focus source all', [0, 3]],
      ['Instance focus source', [0, 3]]
    ] as const) {
      await page.getByRole('button', { name: label, exact: true }).click();

      await expect(input).toBeFocused();
      expect(await input.evaluate((element: HTMLInputElement) =>
        [element.selectionStart, element.selectionEnd])).toEqual(range);
    }

    await page.getByRole('button', { name: 'Ref blur source number', exact: true }).click();

    await expect(input).not.toBeFocused();
  }
);

test(
  'InputNumber replaces a focused keyed spread without reading destroyed parent props',
  async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Keyed source number', exact: true });
    await input.fill('1.005');

    await page.getByRole('button', { name: 'Replace keyed source number', exact: true }).click();

    await expect(input).toHaveValue('2.00');
    await expect(page.getByLabel('Keyed source events', { exact: true })).toContainText('change:1.005');
  }
);

test(
  'InputNumber pointer hold follows the source 600ms delay and 200ms interval and stops on release',
  async ({ page }) => {
    const input = sourceNumber(page);
    await input.focus();
    const up = input.locator('..').getByRole('button', { name: 'Увеличить значение', exact: true });
    await up.hover();
    const box = (await up.boundingBox())!;
    const time = new Date('2026-11-01T00:00:00Z');
    // Clock идёт между install и pauseAt, поэтому стартуем раньше точки остановки.
    await page.clock.install({ time: new Date(time.getTime() - 60_000) });
    await page.clock.pauseAt(time);

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    await expect(input).toHaveValue('1.3');
    await page.clock.runFor(599);
    await expect(input).toHaveValue('1.3');
    await page.clock.runFor(1);
    await expect(input).toHaveValue('1.4');
    await page.clock.runFor(200);
    await expect(input).toHaveValue('1.5');

    await page.mouse.up();
    await page.clock.runFor(50);
    await page.clock.runFor(2000);

    await expect(input).toHaveValue('1.5');
    await expect(page.getByLabel('Source number step', { exact: true }))
      .toHaveText('{"offset":0.1,"type":"up","emitter":"handler"}');
  }
);

test(
  'InputNumber releases held-step timers and clears native refs when unmounted',
  async ({ page }) => {
    const input = sourceNumber(page);
    await input.focus();
    const up = input.locator('..').getByRole('button', { name: 'Увеличить значение', exact: true });
    await up.hover();
    const box = (await up.boundingBox())!;
    const time = new Date('2026-11-01T00:00:00Z');
    await page.clock.install({ time: new Date(time.getTime() - 60_000) });
    await page.clock.pauseAt(time);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(input).toHaveValue('1.3');
    const before = await page.getByLabel('Source number events', { exact: true }).innerText();

    await page.getByLabel('Mount source number', { exact: true })
      .evaluate((element: HTMLInputElement) => element.click());
    await page.mouse.up();
    await page.clock.runFor(2000);

    await expect(input).toHaveCount(0);
    await expect(page.getByLabel('Source number refs', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source number events', { exact: true })).toHaveText(before);
  }
);

test(
  'InputNumber can unmount synchronously inside onChange without starting a later repeat',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Remove source number on change', { exact: true }).check();
    await input.focus();
    const up = input.locator('..').getByRole('button', { name: 'Увеличить значение', exact: true });
    await up.hover();
    const box = (await up.boundingBox())!;
    const time = new Date('2026-11-01T00:00:00Z');
    await page.clock.install({ time: new Date(time.getTime() - 60_000) });
    await page.clock.pauseAt(time);

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    await page.clock.runFor(2000);

    await expect(input).toHaveCount(0);
    await expect(page.getByLabel('Source number events', { exact: true })).toHaveText('change:1.3');
  }
);

test(
  'InputNumber prefix and suffix clicks focus the same native field and never submit',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Source number affixes', { exact: true }).check();
    const prefix = input.locator('..').locator('.ant-input-number-prefix');
    const box = (await prefix.boundingBox())!;

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    await expect(input).toBeFocused();
    await expect(page.getByLabel('Source number submissions', { exact: true })).toHaveText('0');
  }
);

test(
  'InputNumber spinner places native decrement and increment controls around its input',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Spinner source number', { exact: true }).check();
    await page.getByLabel('Custom source number icons', { exact: true }).check();
    const root = input.locator('..');

    await expect(root.getByRole('button').first()).toHaveText('DOWN');
    await expect(root.getByRole('button').last()).toHaveText('UP');
    await root.getByRole('button').last().click();

    await expect(input).toHaveValue('1.3');
    await expect(input).toBeFocused();
    await expect(root).toHaveClass(/ant-input-number-mode-spinner/);
    await expect(page.getByLabel('Source number submissions', { exact: true })).toHaveText('0');
  }
);

test(
  'InputNumber source mouse callbacks target the root when a native action is pressed',
  async ({ page }) => {
    const input = sourceNumber(page);
    await input.focus();

    await input.locator('..').getByRole('button', { name: 'Увеличить значение', exact: true }).click();

    await expect(input).toHaveValue('1.3');
    await expect(page.getByLabel('Source number mouse events', { exact: true }))
      .toHaveText('down:true|up:true|click:true');
  }
);

test(
  'InputNumber legacy addons use Compact edges and preserve the owned value and rootClassName',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Source number addons', { exact: true }).check();
    const compact = page.locator('.ant-space-compact.number-feature-root');

    await expect(compact).toBeVisible();
    await expect(compact).toContainText('Before');
    await expect(compact).toContainText('After');
    await expect(input.locator('..')).toHaveClass(/ant-input-number-compact-item/);
    await expect(input.locator('..')).not.toHaveClass(/number-feature-root/);
    await input.fill('2.5');

    await page.getByLabel('Source number addons', { exact: true }).uncheck();

    await expect(input).toHaveValue('2.5');
    await expect(input.locator('..')).toHaveClass(/number-feature-root/);
    await expect(page.locator('.number-feature-root')).toHaveCount(1);
  }
);

test(
  'InputNumber config and local semantic layers merge with the source root-style priority',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Source number config', { exact: true }).check();
    await page.getByLabel('Inherit source number variant', { exact: true }).check();
    await page.getByLabel('Source number affixes', { exact: true }).check();
    const root = input.locator('..');

    await expect(root).toHaveClass(/number-context/);
    await expect(root).toHaveClass(/number-local-middle/);
    await expect(root).toHaveClass(/ant-input-number-filled/);
    await expect(root).toHaveCSS('color', 'rgb(255, 165, 0)');
    await expect(input).toHaveClass(/number-context-input/);
    await expect(root.locator('.ant-input-number-prefix')).toHaveCSS('color', 'rgb(128, 0, 128)');
    await expect(page.getByRole('spinbutton', { name: 'Inherited source number', exact: true }).locator('..'))
      .toHaveClass(/ant-input-number-filled/);

    await page.getByLabel('Source number size', { exact: true }).selectOption('small');

    await expect(root).toHaveClass(/number-local-small/);
    await expect(root).toHaveClass(/ant-input-number-sm/);
  }
);

for (const variant of ['outlined', 'filled', 'borderless', 'underlined']) {
  test(
    `InputNumber ${variant} keeps source border geometry and native control height`,
    async ({ page }) => {
      const input = sourceNumber(page);
      await page.getByLabel('Source number variant', { exact: true }).selectOption(variant);
      const root = input.locator('..');

      await expect(root).toHaveClass(new RegExp(`ant-input-number-${variant}`));
      await expect(root).toHaveCSS('height', '32px');
      await expect(root).toHaveCSS('border-left-width', variant === 'underlined' || variant === 'borderless' ? '0px' : '1px');
    }
  );
}

test(
  'InputNumber readOnly alias and disabled retain their native submission and control contracts',
  async ({ page }) => {
    const input = sourceNumber(page);
    await page.getByLabel('Read only source number', { exact: true }).check();

    await expect(input).toHaveAttribute('readonly');
    await expect(input.locator('..').getByRole('button')).toHaveCount(0);
    expect(await page.locator('#source-number-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).get('amount'))).toBe('1.2');

    await page.getByLabel('Read only source number', { exact: true }).uncheck();
    await page.getByLabel('Disable source number', { exact: true }).check();

    await expect(input).toBeDisabled();
    expect(await page.locator('#source-number-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).get('amount'))).toBeNull();
  }
);

test.describe('mobile InputNumber source features', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'supports touch spinner steps in dark compact RTL without widening the viewport',
    async ({ page }) => {
      const input = sourceNumber(page);
      await page.getByLabel('Spinner source number', { exact: true }).check();
      await page.getByLabel('Dark source number', { exact: true }).check();
      await page.getByLabel('Compact source number', { exact: true }).check();
      await page.getByLabel('Right to left', { exact: true }).check();
      const root = input.locator('..');

      await root.getByRole('button', { name: 'Увеличить значение', exact: true }).tap();

      await expect(input).toHaveValue('1.3');
      await expect(root).toHaveClass(/ant-input-number-rtl/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(375);
    }
  );
});
