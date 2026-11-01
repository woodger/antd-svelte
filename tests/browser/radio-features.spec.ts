import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=radio-features');
  await expect(page.getByRole('radio', { name: 'Numeric zero', exact: true })).toBeChecked();
});

test(
  'Radio options preserve source metadata and emit their typed event before the group',
  async ({ page }) => {
    const zero = page.getByRole('radio', { name: 'Numeric zero', exact: true });
    const boolean = page.getByRole('radio', { name: 'Boolean false', exact: true });

    await expect(zero).toHaveAttribute('id', 'source-radio-zero');
    await expect(zero.locator('xpath=ancestor::label')).toHaveAttribute('title', 'Zero title');
    await expect(zero.locator('xpath=ancestor::label')).toHaveClass(/zero-option/);
    await expect(zero).not.toHaveAttribute('title');
    await expect(boolean).toHaveAttribute('required');

    await boolean.check();

    await expect(page.getByLabel('Source radio events', { exact: true }))
      .toHaveText('option:boolean:false:0|group:boolean:false:true:true|value:boolean:false');
    await expect(page.getByLabel('Source radio value', { exact: true })).toHaveText('false');
    expect(await page.locator('#source-radio-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).get('source'))).toBe('false');

    await boolean.check();

    await expect(page.getByLabel('Source radio change bubbles', { exact: true })).toHaveText('1');
  }
);

test(
  'Radio rich option snippets update their label without changing the typed selection',
  async ({ page }) => {
    const rich = page.getByRole('radio', { name: 'Rich option 1', exact: true });

    await rich.check();
    await page.getByRole('button', { name: 'Clear source radio events', exact: true }).click();
    await page.getByRole('button', { name: 'Update rich radio label', exact: true }).click();

    await expect(page.getByRole('radio', { name: 'Rich option 2', exact: true })).toBeChecked();
    await expect(page.getByLabel('Source radio value', { exact: true })).toHaveText('"0"');
    await expect(page.getByLabel('Source radio events', { exact: true })).toHaveText('');
    await expect(page.locator('.ant-radio-label strong')).toHaveText('Rich option 2');
  }
);

test(
  'Radio merges semantic config and local slots using resolved checked state',
  async ({ page }) => {
    await page.getByLabel('Style source radios', { exact: true }).check();
    const zero = page.getByRole('radio', { name: 'Numeric zero', exact: true });
    const boolean = page.getByRole('radio', { name: 'Boolean false', exact: true });
    const standalone = page.getByRole('radio', { name: 'Standalone source radio', exact: true });
    const label = standalone.locator('xpath=ancestor::label');

    await expect(zero.locator('xpath=ancestor::label')).toHaveClass(/source-config-checked/);
    await expect(boolean.locator('xpath=ancestor::label')).toHaveClass(/source-config-unchecked/);
    await expect(label).toHaveCSS('color', 'rgb(255, 165, 0)');
    await expect(label.locator('.ant-radio-button-label')).toHaveCSS('color', 'rgb(128, 0, 128)');
    await expect(label.locator('.ant-radio-button-label')).toHaveCSS('font-weight', '700');
    await expect(standalone.locator('..')).toHaveClass(/source-config-icon.*source-local-icon/);
    await expect(standalone.locator('..')).toHaveCSS('outline-width', '1px');
    await expect(page.getByRole('radio', { name: 'Inherited semantic radio', exact: true })
      .locator('xpath=ancestor::label')).toHaveClass(/source-radio-config/);

    await boolean.check();
    await page.getByText('Standalone source radio', { exact: true }).click();

    await expect(zero.locator('xpath=ancestor::label')).toHaveClass(/source-config-unchecked/);
    await expect(boolean.locator('xpath=ancestor::label')).toHaveClass(/source-config-checked/);
    await expect(label).toHaveClass(/source-checked-true/);
  }
);

test(
  'Radio source stopPropagation retains callbacks while stopping the native change bubble',
  async ({ page }) => {
    await page.getByLabel('Stop source radio change', { exact: true }).check();

    await page.getByRole('radio', { name: 'Boolean false', exact: true }).check();

    await expect(page.getByLabel('Source radio events', { exact: true }))
      .toHaveText('option:boolean:false:0|group:boolean:false:true:true|value:boolean:false');
    await expect(page.getByLabel('Source radio change bubbles', { exact: true })).toHaveText('0');
  }
);

test(
  'Radio label activation fires one source click, one external click and the native value callbacks',
  async ({ page }) => {
    await page.getByText('Standalone source radio', { exact: true }).click();

    await expect(page.getByRole('radio', { name: 'Standalone source radio', exact: true })).toBeChecked();
    await expect(page.getByLabel('Source standalone events', { exact: true }))
      .toHaveText('click|checked:true|change:boolean:false|native:false');
    await expect(page.getByLabel('Source radio click bubbles', { exact: true })).toHaveText('1');
    await expect(page.getByLabel('Source radio submits', { exact: true })).toHaveText('0');
  }
);

test(
  'Radio direct input activation keeps later clicks available after its frame lock',
  async ({ page }) => {
    const input = page.getByRole('radio', { name: 'Standalone source radio', exact: true });

    await input.evaluate((element: HTMLInputElement) => element.click());
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    await input.evaluate((element: HTMLInputElement) => element.click());

    await expect(page.getByLabel('Source standalone events', { exact: true }))
      .toHaveText('click|checked:true|change:boolean:false|native:false|click');
    await expect(page.getByLabel('Source radio click bubbles', { exact: true })).toHaveText('2');
  }
);

test(
  'Radio source key aliases run before the corresponding native handlers',
  async ({ page }) => {
    const input = page.getByRole('radio', { name: 'Standalone source radio', exact: true });

    await input.focus();
    await input.press('a');

    await expect(page.getByLabel('Source radio key events', { exact: true }))
      .toHaveText('source-key:a|native-key:a|source-press:a|native-press:a');
  }
);

test(
  'Radio ref and bind:this expose native focus and blur and clear all handles on unmount',
  async ({ page }) => {
    const input = page.getByRole('radio', { name: 'Standalone source radio', exact: true });

    await expect(page.getByLabel('Source radio refs', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('Source radio group ref', { exact: true })).toHaveText('FIELDSET');
    await expect(input).toHaveAttribute('tabindex', '2');
    await page.getByRole('button', { name: 'Focus source radio ref', exact: true }).click();
    await expect(input).toBeFocused();
    await page.getByRole('button', { name: 'Blur source radio ref', exact: true }).click();
    await expect(input).not.toBeFocused();
    await page.getByRole('button', { name: 'Focus source radio instance', exact: true }).click();
    await expect(input).toBeFocused();

    await page.getByLabel('Mount source radios', { exact: true }).uncheck();

    await expect(page.getByLabel('Source radio refs', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source radio group ref', { exact: true })).toHaveText('none');
  }
);

test(
  'RadioGroup source focus callbacks bubble from the input and mouse callbacks belong to label',
  async ({ page }) => {
    const input = page.getByRole('radio', { name: 'Boolean false', exact: true });

    await input.focus();
    await input.press('Tab');

    await expect(page.getByLabel('Source radio focus events', { exact: true }))
      .toHaveText('focus:true|blur:true');

    await page.getByText('Standalone source radio', { exact: true }).hover();
    await page.mouse.move(0, 0);

    await expect(page.getByLabel('Source radio mouse events', { exact: true }))
      .toHaveText('enter:LABEL|leave:LABEL');
  }
);

test(
  'RadioGroup vertical alias yields to an explicit orientation',
  async ({ page }) => {
    const group = page.getByRole('radiogroup', { name: 'Source radio options', exact: true });
    await page.getByLabel('Vertical source radios', { exact: true }).check();

    await expect(group).toHaveAttribute('aria-orientation', 'vertical');
    await expect(group).toHaveClass(/ant-radio-group-vertical/);
    await expect(group).toHaveCSS('display', 'flex');

    await page.getByLabel('Source radio orientation', { exact: true }).selectOption('horizontal');

    await expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(group).not.toHaveClass(/ant-radio-group-vertical/);
  }
);

test(
  'RadioGroup function binding rejects a selection while still reporting its typed event',
  async ({ page }) => {
    await page.getByLabel('Freeze source radio owner', { exact: true }).check();
    await page.getByRole('radio', { name: 'Boolean false', exact: true }).click();

    await expect(page.getByRole('radio', { name: 'Numeric zero', exact: true })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Boolean false', exact: true })).not.toBeChecked();
    await expect(page.getByLabel('Source radio value', { exact: true })).toHaveText('0');
    await expect(page.getByLabel('Source radio events', { exact: true }))
      .toHaveText('option:boolean:false:0|group:boolean:false:true:true|value:boolean:false');

    await page.getByRole('radio', { name: 'Rich option 1', exact: true }).click();

    await expect(page.getByRole('radio', { name: 'Numeric zero', exact: true })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Rich option 1', exact: true })).not.toBeChecked();
    await expect(page.getByLabel('Source radio value', { exact: true })).toHaveText('0');
  }
);

test(
  'RadioGroup external owner changes do not emit source or native callbacks',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Set source radio owner', exact: true }).click();

    await expect(page.getByRole('radio', { name: 'Boolean false', exact: true })).toBeChecked();
    await expect(page.getByLabel('Source radio events', { exact: true })).toHaveText('');
    await expect(page.getByLabel('Source radio change bubbles', { exact: true })).toHaveText('0');
  }
);

test(
  'RadioGroup can unmount during its source callback without invoking a stale value callback',
  async ({ page }) => {
    await page.getByLabel('Remove source radios on change', { exact: true }).check();

    await page.getByRole('radio', { name: 'Boolean false', exact: true }).click();

    await expect(page.getByRole('radiogroup', { name: 'Source radio options', exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Source radio events', { exact: true }))
      .toHaveText('option:boolean:false:0|group:boolean:false:true:true');
  }
);

test(
  'Radio clears its click-frame resource and refs before time advances after unmount',
  async ({ page }) => {
    await page.clock.install();
    const input = page.getByRole('radio', { name: 'Standalone source radio', exact: true });
    await input.evaluate((element: HTMLInputElement) => element.click());
    const before = await page.getByLabel('Source standalone events', { exact: true }).innerText();

    await page.getByLabel('Mount source radios', { exact: true })
      .evaluate((element: HTMLInputElement) => element.click());
    await page.clock.runFor(1000);

    await expect(input).toHaveCount(0);
    await expect(page.getByLabel('Source radio refs', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source standalone events', { exact: true })).toHaveText(before);
  }
);

test(
  'Radio autoFocus alias focuses its native input on remount',
  async ({ page }) => {
    await page.getByLabel('Mount source radios', { exact: true }).uncheck();
    await page.getByLabel('Autofocus source radio', { exact: true }).check();

    await page.getByLabel('Mount source radios', { exact: true }).check();

    await expect(page.getByRole('radio', { name: 'Standalone source radio', exact: true })).toBeFocused();
  }
);

test.describe('mobile Radio source features', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'keeps rich button options selectable in dark compact RTL without overflowing',
    async ({ page }) => {
      await page.getByLabel('Dark source radios', { exact: true }).check();
      await page.getByLabel('Compact source radios', { exact: true }).check();
      await page.getByLabel('Right to left', { exact: true }).check();
      await page.getByLabel('Source radio appearance', { exact: true }).selectOption('button');
      await page.getByLabel('Vertical source radios', { exact: true }).check();

      await page.getByText('Rich option 1', { exact: true }).tap();

      await expect(page.getByLabel('Source radio value', { exact: true })).toHaveText('"0"');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole('radiogroup', { name: 'Source radio options', exact: true }))
        .toHaveCSS('direction', 'rtl');
    }
  );
});
