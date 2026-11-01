import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=checkbox-features');
  await expect(page.getByRole('checkbox', { name: 'Child zero', exact: true })).toBeChecked();
});

test(
  'CheckboxGroup children cross Grid boundaries and emit typed child events before group values',
  async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Child false', exact: true }).check();

    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toHaveText('child:boolean:false:true|group:[0,false]|value:[0,false]');
    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0,false]');
    expect(await page.locator('#source-checkbox-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).getAll('choices'))).toEqual(['0', 'false']);
  }
);

test(
  'CheckboxGroup children preserve selection insertion order when their DOM order changes',
  async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Child false', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Child zero', exact: true }).uncheck();
    await page.getByRole('checkbox', { name: 'Child zero', exact: true }).check();
    await page.getByLabel('Reverse source checkbox children', { exact: true }).check();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[false,0]');
    expect(await page.locator('#source-checkbox-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).getAll('choices'))).toEqual(['false', '0']);
    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toContainText('group:[false,0]|value:[false,0]');
  }
);

test(
  'CheckboxGroup retains removed children in raw state while filtering its change callbacks',
  async ({ page }) => {
    await page.getByLabel('Hide source zero child', { exact: true }).check();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0]');
    await expect(page.getByLabel('Source checkbox events', { exact: true })).toHaveText('');

    await page.getByRole('checkbox', { name: 'Child false', exact: true }).check();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0,false]');
    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toHaveText('child:boolean:false:true|group:[false]|value:[false]');

    await page.getByLabel('Hide source zero child', { exact: true }).uncheck();

    await expect(page.getByRole('checkbox', { name: 'Child zero', exact: true })).toBeChecked();
  }
);

test(
  'CheckboxGroup re-registers a changed child value without mutating external owner data',
  async ({ page }) => {
    const variable = page.getByRole('checkbox', { name: 'Variable child', exact: true });
    await page.getByRole('button', { name: 'Set source checkbox owner', exact: true }).click();
    await expect(variable).not.toBeChecked();

    await page.getByRole('button', { name: 'Change source child value', exact: true }).click();

    await expect(variable).toBeChecked();
    await expect(variable).toHaveAttribute('value', 'variable-b');
    await expect(page.getByLabel('Source checkbox events', { exact: true })).toHaveText('');

    await variable.uncheck();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[99]');
    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toHaveText('child:string:variable-b:false|group:[]|value:[]');
  }
);

test(
  'Checkbox skipGroup bypasses name and selection and can rejoin the current group',
  async ({ page }) => {
    const skipped = page.getByRole('checkbox', { name: 'Skipped child', exact: true });

    await skipped.check();

    await expect(skipped).toHaveAttribute('name', 'skipped');
    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0]');
    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toHaveText('child:string:skipped:true');

    await page.getByLabel('Skip source checkbox group', { exact: true }).uncheck();

    await expect(skipped).not.toBeChecked();
    await expect(skipped).toHaveAttribute('name', 'choices');
    await skipped.check();
    await expect(page.getByLabel('Source checkbox owner', { exact: true }))
      .toHaveText('[0,"skipped"]');

    await skipped.uncheck();
    await page.getByLabel('Skip source checkbox group', { exact: true }).check();

    await expect(skipped).not.toBeChecked();
    await expect(page.getByLabel('Source checkbox skipped owner', { exact: true }))
      .toHaveText('false');
  }
);

test(
  'CheckboxGroup rich options replace children and keep input metadata and source title placement',
  async ({ page }) => {
    await page.getByLabel('Use source checkbox options', { exact: true }).check();
    const zero = page.getByRole('checkbox', { name: 'Option zero', exact: true });

    await expect(page.getByRole('checkbox', { name: 'Child zero', exact: true })).toHaveCount(0);
    await expect(zero).toHaveAttribute('id', 'source-option-zero');
    await expect(zero).toHaveAttribute('required');
    await expect(zero.locator('..')).toHaveAttribute('title', 'Zero metadata');
    await expect(zero.locator('xpath=ancestor::label')).not.toHaveAttribute('title');
    await expect(zero.locator('xpath=ancestor::label')).toHaveClass(/source-zero-class/);
    await expect(zero.locator('xpath=ancestor::label')).toHaveCSS('color', 'rgb(0, 128, 0)');

    await page.getByRole('checkbox', { name: 'Rich checkbox option', exact: true }).check();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0,false]');
    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toHaveText('child:boolean:false:true|group:[0,false]|value:[0,false]');

    await page.getByLabel('Use source checkbox options', { exact: true }).uncheck();

    await expect(page.getByRole('checkbox', { name: 'Child false', exact: true })).toBeChecked();
  }
);

test(
  'CheckboxGroup callbacks receive separate arrays and cannot mutate the bound selection',
  async ({ page }) => {
    await page.getByLabel('Mutate source checkbox callback', { exact: true }).check();

    await page.getByRole('checkbox', { name: 'Child false', exact: true }).check();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0,false]');
    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toHaveText('child:boolean:false:true|group:[0,false]|value:[0,false]');
  }
);

test(
  'CheckboxGroup nested groups and Table row selection stay outside the parent selection',
  async ({ page }) => {
    await page.getByRole('group', { name: 'Independent nested checkbox group', exact: true })
      .getByRole('checkbox', { name: 'other', exact: true }).check();
    const table = page.getByRole('table', { name: 'Grouped selection table', exact: true });

    await table.getByRole('checkbox').nth(1).check();

    await expect(page.getByLabel('Source checkbox table keys', { exact: true }))
      .toHaveText('["one"]');
    await expect(page.getByLabel('Source checkbox host owner', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Source checkbox host events', { exact: true })).toHaveText('0');

    await table.getByRole('checkbox').first().check();

    await expect(page.getByLabel('Source checkbox table keys', { exact: true }))
      .toHaveText('["one","two"]');
    await expect(page.getByLabel('Source checkbox host events', { exact: true })).toHaveText('0');
    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0]');
  }
);

test(
  'CheckboxGroup function binding restores rejected typed children without mixing zero and its string',
  async ({ page }) => {
    await page.getByLabel('Freeze source checkbox owner', { exact: true }).check();

    await page.getByRole('checkbox', { name: 'Child false', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Child string zero', exact: true }).click();

    await expect(page.getByRole('checkbox', { name: 'Child zero', exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Child false', exact: true }))
      .not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Child string zero', exact: true }))
      .not.toBeChecked();
    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0]');
  }
);

test(
  'Checkbox stopPropagation keeps selection callbacks while stopping the native change bubble',
  async ({ page }) => {
    await page.getByLabel('Stop source checkbox change', { exact: true }).check();

    await page.getByRole('checkbox', { name: 'Child false', exact: true }).check();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0,false]');
    await expect(page.getByLabel('Source checkbox change bubbles', { exact: true }))
      .toHaveText('0');
  }
);

test(
  'Checkbox semantic config merges three slots and follows the four-layer root style priority',
  async ({ page }) => {
    await page.getByLabel('Style source checkboxes', { exact: true }).check();
    const solo = page.getByRole('checkbox', { name: 'Standalone source checkbox', exact: true });
    const label = solo.locator('xpath=ancestor::label');

    await expect(label).toHaveCSS('color', 'rgb(255, 165, 0)');
    await expect(solo.locator('..')).toHaveClass(/checkbox-config-icon.*checkbox-local-icon/);
    await expect(label.locator('.ant-checkbox-label')).toHaveCSS('color', 'rgb(128, 0, 128)');
    await expect(label.locator('.ant-checkbox-label')).toHaveCSS('font-weight', '700');
    await expect(page.getByRole('checkbox', { name: 'Child zero', exact: true })
      .locator('xpath=ancestor::label')).toHaveClass(/checkbox-config-checked/);
    await expect(page.getByRole('checkbox', { name: 'Inherited checkbox config', exact: true })
      .locator('xpath=ancestor::label')).toHaveClass(/checkbox-config-checked/);

    await solo.check();

    await expect(label).toHaveClass(/checkbox-local-true/);
  }
);

test(
  'Checkbox label activation emits one external click and preserves mixed-state and native events',
  async ({ page }) => {
    const solo = page.getByRole('checkbox', { name: 'Standalone source checkbox', exact: true });
    await expect(solo).toHaveJSProperty('indeterminate', true);

    await page.getByText('Standalone source checkbox', { exact: true }).click();

    await expect(solo).toBeChecked();
    await expect(solo).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('Source checkbox mixed', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source solo events', { exact: true }))
      .toHaveText('click|checked:true|source:boolean:false:true|native:false');
    await expect(page.getByLabel('Source checkbox click bubbles', { exact: true })).toHaveText('1');
    await expect(page.getByLabel('Source checkbox submits', { exact: true })).toHaveText('0');
  }
);

test(
  'Checkbox source keyboard and focus aliases precede the native input handlers',
  async ({ page }) => {
    const solo = page.getByRole('checkbox', { name: 'Standalone source checkbox', exact: true });

    await solo.focus();
    await solo.press('a');
    await page.getByRole('button', { name: 'Blur source checkbox ref', exact: true }).click();

    await expect(page.getByLabel('Source checkbox input events', { exact: true }))
      .toHaveText('source-focus|native-focus|source-key:a|native-key:a|source-press:a|native-press:a|source-blur|native-blur');
  }
);

test(
  'Checkbox source hover handlers belong to the label and title remains on the holder',
  async ({ page }) => {
    const solo = page.getByRole('checkbox', { name: 'Standalone source checkbox', exact: true });

    await page.getByText('Standalone source checkbox', { exact: true }).hover();
    await page.mouse.move(0, 0);

    await expect(page.getByLabel('Source checkbox mouse events', { exact: true }))
      .toHaveText('enter:LABEL|leave:LABEL');
    await expect(solo.locator('..')).toHaveAttribute('title', 'Standalone title');
    await expect(solo).not.toHaveAttribute('title');
  }
);

test(
  'Checkbox ref and bind:this expose native focus and blur and clear their handles on unmount',
  async ({ page }) => {
    const solo = page.getByRole('checkbox', { name: 'Standalone source checkbox', exact: true });
    await expect(page.getByLabel('Source checkbox refs', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('Source checkbox group ref', { exact: true }))
      .toHaveText('FIELDSET');
    await expect(solo).toHaveAttribute('tabindex', '2');

    await page.getByRole('button', { name: 'Focus source checkbox ref', exact: true }).click();
    await expect(solo).toBeFocused();
    await page.getByRole('button', { name: 'Blur source checkbox ref', exact: true }).click();
    await expect(solo).not.toBeFocused();
    await page.getByRole('button', { name: 'Focus source checkbox instance', exact: true }).click();
    await expect(solo).toBeFocused();

    await page.getByLabel('Mount source checkboxes', { exact: true }).uncheck();

    await expect(page.getByLabel('Source checkbox refs', { exact: true })).toHaveText('false');
    await expect(page.getByLabel('Source checkbox group ref', { exact: true })).toHaveText('none');
  }
);

test(
  'Checkbox autoFocus alias focuses its input after remount',
  async ({ page }) => {
    await page.getByLabel('Mount source checkboxes', { exact: true }).uncheck();
    await page.getByLabel('Autofocus source checkbox', { exact: true }).check();

    await page.getByLabel('Mount source checkboxes', { exact: true }).check();

    await expect(page.getByRole('checkbox', { name: 'Standalone source checkbox', exact: true }))
      .toBeFocused();
  }
);

test(
  'Checkbox keyed removal can blur the old input without reading destroyed parent props',
  async ({ page }) => {
    const input = page.getByRole('checkbox', { name: 'Keyed source checkbox', exact: true });
    await input.focus();

    await page.getByRole('button', { name: 'Replace keyed source checkbox', exact: true }).click();

    await expect(input).not.toBeChecked();
    await expect(input).toHaveAttribute('value', 'keyed-1');
  }
);

test(
  'CheckboxGroup callback can synchronously unmount controls without a stale value callback',
  async ({ page }) => {
    await page.getByLabel('Remove source checkboxes on change', { exact: true }).check();

    await page.getByRole('checkbox', { name: 'Child false', exact: true }).click();

    await expect(page.getByRole('group', { name: 'Source child checkboxes', exact: true }))
      .toHaveCount(0);
    await expect(page.getByLabel('Source checkbox events', { exact: true }))
      .toHaveText('child:boolean:false:true|group:[0,false]');
  }
);

test(
  'CheckboxGroup children reset to group defaults without source callbacks',
  async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Child false', exact: true }).check();
    await page.getByRole('button', { name: 'Clear source checkbox events', exact: true }).click();

    await page.getByRole('button', { name: 'Reset source checkboxes', exact: true }).click();

    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[]');
    await expect(page.getByRole('checkbox', { name: 'Child zero', exact: true })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Child false', exact: true }))
      .not.toBeChecked();
    await expect(page.getByLabel('Source checkbox events', { exact: true })).toHaveText('');
  }
);

test(
  'CheckboxGroup disabled blocks participating and skipped controls without changing selected values',
  async ({ page }) => {
    await page.getByLabel('Disable source checkbox group', { exact: true }).check();
    const group = page.getByRole('group', { name: 'Source child checkboxes', exact: true });

    for (const input of await group.getByRole('checkbox').all()) await expect(input).toBeDisabled();
    await expect(page.getByLabel('Source checkbox owner', { exact: true })).toHaveText('[0]');
    await expect(page.getByLabel('Source checkbox events', { exact: true })).toHaveText('');
    expect(await page.locator('#source-checkbox-form').evaluate((form: HTMLFormElement) =>
      new FormData(form).getAll('choices'))).toEqual([]);
  }
);

test.describe('mobile Checkbox source features', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test(
    'keeps Grid children usable in dark compact RTL without widening the viewport',
    async ({ page }) => {
      for (const label of [
        'Dark source checkboxes',
        'Compact source checkboxes',
        'Right to left'
      ]) {
        await page.getByLabel(label, { exact: true }).check();
      }

      await page.getByText('Child false', { exact: true }).tap();

      await expect(page.getByLabel('Source checkbox owner', { exact: true }))
        .toHaveText('[0,false]');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      await expect(page.getByRole('group', { name: 'Source child checkboxes', exact: true }))
        .toHaveCSS('direction', 'rtl');
    }
  );
});
