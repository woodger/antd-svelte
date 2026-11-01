import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=wave');
  await expect(page.getByRole('heading', { name: 'Source Wave', exact: true })).toBeVisible();
});

test('ordinary Wave follows source geometry and ends only on its opacity transition', async ({ page }) => {
  const button = page.locator('#wave-primary');
  await button.click();
  const wave = button.locator('.ant-wave');
  await expect(wave).toHaveClass(/wave-motion-appear-active/);
  await expect(wave).toHaveCSS('pointer-events', 'none');
  await expect(wave).toHaveCSS('transition-duration', '0.4s, 2s');
  const width = await button.evaluate((element: HTMLButtonElement) => element.offsetWidth);
  await expect(wave).toHaveCSS('width', `${width}px`);
  await expect(wave).toHaveCSS('left', '-1px');
  await expect(wave).toHaveCSS('top', '-1px');

  await wave.evaluate(element => element.dispatchEvent(new TransitionEvent('transitionend', {
    propertyName: 'box-shadow', bubbles: true
  })));

  await expect(wave).toHaveCount(1);
  await wave.evaluate(element => element.dispatchEvent(new TransitionEvent('transitionend', {
    propertyName: 'opacity', bubbles: true
  })));

  await expect(wave).toHaveCount(0);
  await expect(button).toBeFocused();
  await expect(page.getByLabel('Wave control changes', { exact: true })).toHaveText('1');
});

test('source fallback color and live resize metrics come from the target', async ({ page }) => {
  const button = page.locator('#wave-white');
  await button.click();
  const wave = button.locator('.ant-wave');
  await expect(wave).toHaveClass(/wave-motion-appear-active/);
  await expect(wave).toHaveCSS('color', 'rgb(255, 0, 0)');

  await button.evaluate(element => {
    element.style.width = '240px';
    element.style.height = '48px';
    element.style.borderRadius = '12px 10px 8px 6px';
    element.style.borderColor = 'rgb(0, 128, 0)';
  });

  await expect(wave).toHaveCSS('width', '240px');
  await expect(wave).toHaveCSS('height', '48px');
  await expect(wave).toHaveCSS('border-radius', '12px 10px 8px 6px');
  await expect(wave).toHaveCSS('color', 'rgb(0, 128, 0)');
});

test('Checkbox uses its quick target when checked and skips the default effect on uncheck', async ({ page }) => {
  const input = page.getByLabel('Wave checkbox', { exact: true });
  await input.check();
  const wave = input.locator('..').locator('.ant-wave');
  await expect(wave).toHaveClass(/wave-quick/);
  await expect(wave).toHaveClass(/wave-motion-appear-active/);
  await expect(wave).toHaveCSS('transition-duration', '0.3s, 0.3s');
  await wave.evaluate(element => element.dispatchEvent(new TransitionEvent('transitionend', {
    propertyName: 'opacity', bubbles: true
  })));

  await input.uncheck();
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));

  await expect(wave).toHaveCount(0);
  await expect(page.getByLabel('Wave control changes', { exact: true })).toHaveText('2');
});

test('Radio, RadioButton, Switch and Steps select their source targets', async ({ page }) => {
  await page.getByLabel('Wave radio', { exact: true }).check();
  await expect(page.locator('#wave-radio').locator('..').locator('.ant-wave'))
    .toHaveClass(/wave-quick/);
  await page.locator('#wave-radio-buttons').getByText('two', { exact: true }).click();
  await expect(page.locator('#wave-radio-buttons .ant-radio-button-wrapper-checked .ant-wave'))
    .toHaveClass(/wave-motion-appear-active/);
  await expect(page.locator('#wave-radio-buttons .ant-wave')).not.toHaveClass(/wave-quick/);
  await page.getByRole('switch', { name: 'Wave switch', exact: true }).click();
  await expect(page.locator('#wave-switch > div > .ant-wave')).toHaveCount(1);
  await page.locator('#wave-steps').getByRole('button', { name: 'Wave second', exact: true }).click();
  await expect(page.locator('#wave-steps .ant-steps-item-icon > div > .ant-wave')).toHaveCount(1);
  await page.locator('#wave-readonly-steps').dispatchEvent('click');
  await expect(page.locator('#wave-readonly-steps .ant-wave')).toHaveCount(0);
});

test('Tag callbacks and a single anchor get Wave while plain and CheckableTag stay unchanged', async ({ page }) => {
  for (const id of ['wave-tag', 'wave-link-tag']) {
    await page.locator('#' + id).click();
    await expect(page.locator('#' + id + ' .ant-wave')).toHaveCount(1);
  }
  await page.locator('#wave-plain-tag').click();
  await page.locator('#wave-checkable-tag').click();

  await expect(page.locator('#wave-plain-tag .ant-wave')).toHaveCount(0);
  await expect(page.locator('#wave-checkable-tag .ant-wave')).toHaveCount(0);
  await expect(page.getByLabel('Wave control changes', { exact: true })).toHaveText('2');
});

test('custom effect receives full current tokens, native events and the chosen target', async ({ page }) => {
  await page.getByLabel('Custom wave effect', { exact: true }).check();
  await page.locator('#wave-primary').click();

  const output = page.getByLabel('Wave callback reports', { exact: true });
  await expect(output).toContainText('"component":"Button"');
  const [report] = JSON.parse(await output.innerText());
  expect(report).toMatchObject({ target: 'wave-primary', event: 'click', primary: '#1677ff',
    fontSize: 17, buttonPrimary: '#ff0000', colorSource: null, receiver: 'undefined' });
  expect(report.fields).toBeGreaterThanOrEqual(537);
  expect(report.className).toBe(`ant-wave ${report.hashId}`);
  await expect(page.locator('.ant-wave')).toHaveCount(0);

  await page.getByLabel('Wave primary', { exact: true }).fill('#00b96b');
  await page.getByLabel('Custom wave CSS prefix', { exact: true }).check();
  await page.getByLabel('Hash wave controls', { exact: true }).uncheck();
  await page.locator('#wave-primary').click();

  await expect(output).toContainText('"primary":"#00b96b"');
  const next = JSON.parse(await output.innerText()).at(-1);
  expect(next.className).toBe('ant-wave');
  expect(next.hashId).toBe('');
});

test('custom Checkbox effect also receives uncheck and Steps exposes its color source', async ({ page }) => {
  await page.getByLabel('Custom wave effect', { exact: true }).check();
  const checkbox = page.getByLabel('Wave checkbox', { exact: true });
  await checkbox.check();
  await expect(page.getByLabel('Wave callback reports', { exact: true })).toContainText('"checked":true');
  await checkbox.uncheck();
  await expect(page.getByLabel('Wave callback reports', { exact: true })).toContainText('"checked":false');
  await page.locator('#wave-steps').getByRole('button', { name: 'Wave second', exact: true }).click();

  await expect(page.getByLabel('Wave callback reports', { exact: true }))
    .toContainText('"colorSource":"color"');
});

for (const trigger of ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup']) {
  test(`trigger ${trigger} uses capture and merges the latest event in one frame`, async ({ page }) => {
    await page.getByLabel('Custom wave effect', { exact: true }).check();
    await page.getByLabel('Wave trigger', { exact: true }).selectOption(trigger);
    await page.locator('#wave-primary').evaluate((element, type) => {
      element.addEventListener(type, event => event.stopPropagation(), { once: true });
      element.dispatchEvent(new MouseEvent(type, { bubbles: true, detail: 1 }));
      element.dispatchEvent(new MouseEvent(type, { bubbles: true, detail: 2 }));
    }, trigger);

    const output = page.getByLabel('Wave callback reports', { exact: true });
    await expect(output).toContainText('"detail":2');
    const reports = JSON.parse(await output.innerText());
    expect(reports).toHaveLength(1);
    expect(reports[0].event).toBe(trigger);
  });
}

test('disabling Wave keeps callbacks and native form values active', async ({ page }) => {
  await page.getByLabel('Disable wave effect', { exact: true }).check();
  await page.locator('#wave-primary').click();
  await page.getByLabel('Wave checkbox', { exact: true }).check();

  await expect(page.getByLabel('Wave control changes', { exact: true })).toHaveText('2');
  expect(await page.locator('#wave-form').evaluate(form =>
    new FormData(form as HTMLFormElement).get('wave-check'))).toBe('yes');
  await expect(page.locator('.ant-wave')).toHaveCount(0);
});

test('disabled, hidden, leaving and unbordered roots do not invoke the custom effect', async ({ page }) => {
  await page.getByLabel('Custom wave effect', { exact: true }).check();
  for (const id of ['wave-disabled', 'wave-loading', 'wave-text', 'wave-link', 'wave-href']) {
    await page.locator('#' + id).dispatchEvent('click');
  }
  for (const value of ['sample-disabled', 'sample-leave']) {
    await page.getByLabel('Wave root class', { exact: true }).selectOption(value);
    await page.locator('#wave-primary').click();
  }
  await page.getByLabel('Wave root class', { exact: true }).selectOption('');
  await page.locator('#wave-primary').evaluate(element => {
    element.style.display = 'none';
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));

  await expect(page.getByLabel('Wave callback reports', { exact: true })).toHaveText('[]');
  await page.locator('#wave-primary').evaluate(element => { element.style.display = ''; });
  await page.getByLabel('Wave root class', { exact: true }).selectOption('disabled:sample');
  await page.locator('#wave-primary').click();
  await expect(page.getByLabel('Wave callback reports', { exact: true })).toContainText('"component":"Button"');
});

test('nested wave records inherit when omitted and replace rather than merge when explicit', async ({ page }) => {
  await page.getByLabel('Custom wave effect', { exact: true }).check();
  await page.locator('#wave-child').click();
  await expect(page.getByLabel('Wave callback reports', { exact: true })).toContainText('"target":"wave-child"');
  await page.getByRole('button', { name: 'Clear wave reports', exact: true }).click();
  await page.getByLabel('Replace child wave config', { exact: true }).check();
  await page.locator('#wave-child').click();

  await expect(page.locator('#wave-child .ant-wave')).toHaveCount(1);
  await expect(page.getByLabel('Wave callback reports', { exact: true })).toHaveText('[]');
});

test('synchronous unmount cancels a pending custom effect and closing a Tag keeps its callback stopped', async ({ page }) => {
  await page.getByLabel('Custom wave effect', { exact: true }).check();
  await page.locator('#wave-close-tag').getByRole('button').click();
  await expect(page.locator('#wave-close-tag')).toHaveCount(0);
  await expect(page.getByLabel('Wave control changes', { exact: true })).toHaveText('0');
  await page.getByLabel('Remove controls during click', { exact: true }).check();
  await page.locator('#wave-primary').click();
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));

  await expect(page.locator('#wave-primary')).toHaveCount(0);
  await expect(page.getByLabel('Wave callback reports', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Wave control changes', { exact: true })).toHaveText('1');
});

test('the source deadline removes a zero-duration quick effect and ordinary motion keeps its fixed durations', async ({ page }) => {
  await page.clock.install();
  await page.getByLabel('Source wave motion', { exact: true }).uncheck();
  await page.getByLabel('Wave checkbox', { exact: true }).check();
  await page.clock.runFor(200);
  const quick = page.locator('#wave-checkbox').locator('..').locator('.ant-wave');
  await expect(quick).toHaveClass(/wave-motion-appear-active/);
  await expect(quick).toHaveCSS('transition-duration', '0s, 0s');
  await page.locator('#wave-primary').click();
  await page.clock.runFor(200);
  await expect(page.locator('#wave-primary .ant-wave')).toHaveCSS('transition-duration', '0.4s, 2s');

  await page.clock.runFor(5000);

  await expect(page.locator('.ant-wave')).toHaveCount(0);
});

test('repeated effects own their observers and disconnect all of them when the control unmounts', async ({ page }) => {
  await page.evaluate(() => {
    const NativeObserver = window.ResizeObserver;
    const state = { active: 0 };
    Object.assign(window, { waveObserverState: state });
    window.ResizeObserver = class extends NativeObserver {
      private tracked = false;
      observe(target: Element, options?: ResizeObserverOptions) {
        if (!this.tracked && target.id === 'wave-primary') {
          this.tracked = true;
          state.active++;
        }
        super.observe(target, options);
      }
      disconnect() {
        if (this.tracked) {
          this.tracked = false;
          state.active--;
        }
        super.disconnect();
      }
    };
  });
  await page.locator('#wave-primary').click();
  await expect(page.locator('#wave-primary .ant-wave')).toHaveCount(1);
  await page.locator('#wave-primary').click();
  await expect(page.locator('#wave-primary .ant-wave')).toHaveCount(2);
  expect(await page.evaluate(() => Reflect.get(window, 'waveObserverState').active)).toBe(2);

  await page.getByLabel('Mount wave controls', { exact: true }).uncheck();

  await expect(page.locator('.ant-wave')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'waveObserverState').active)).toBe(0);
});

test('changing Button to an unbordered variant cancels its pending Wave without replacing the button', async ({ page }) => {
  await page.getByLabel('Custom wave effect', { exact: true }).check();
  await page.getByLabel('Unborder button during click', { exact: true }).check();
  const button = page.locator('#wave-primary');
  const previous = await button.elementHandle();

  await button.click();
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));

  await expect(button).toHaveClass(/ant-btn-variant-text/);
  expect(await button.evaluate((element, old) => element === old, previous)).toBe(true);
  await expect(page.getByLabel('Wave callback reports', { exact: true })).toHaveText('[]');
});

for (const kind of ['handler', 'link']) {
  test(`removing a Tag ${kind} cleans its active Wave and keeps the native root`, async ({ page }) => {
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 100));
    const tag = page.locator(kind === 'handler' ? '#wave-tag' : '#wave-link-tag');
    const previous = await tag.elementHandle();
    await tag.click();
    await page.clock.runFor(200);
    const wave = tag.locator('.ant-wave');
    await expect(wave).toHaveClass(/wave-motion-appear-active/);
    await wave.evaluate(element => element.getAnimations().forEach(animation => animation.pause()));

    await page.getByLabel(kind === 'handler' ? 'Interactive wave tag' : 'Link in wave tag',
      { exact: true }).uncheck();

    await expect(wave).toHaveCount(0, { timeout: 1000 });
    expect(await tag.evaluate((element, old) => element === old, previous)).toBe(true);
  });
}
