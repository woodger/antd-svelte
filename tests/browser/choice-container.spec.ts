import type { Page } from '@playwright/test';
import { expect, test } from './test';
import reference from './fixtures/ant-design-choice-container-reference.json' with { type: 'json' };
import type { ChoiceContainerCase } from './fixtures/choice-container-presets';

const surface = '.ant-tree-select-dropdown,.ant-cascader-dropdown';
const components = ['tree-select', 'tree-select-checkable', 'cascader',
  'cascader-multiple', 'cascader-custom'] as const;

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=choice-container');
});

function control(page: Page, component: ChoiceContainerCase['component']) {
  return component === 'cascader-custom'
    ? page.getByRole('button', { name: 'Custom choice', exact: true })
    : page.getByRole('combobox', { name: 'Container choice', exact: true });
}

async function check(page: Page, label: string, value: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, value) => {
    const input = node as HTMLInputElement;
    input.checked = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function open(page: Page, name: string) {
  await page.getByLabel('Choice reference', { exact: true }).selectOption(name);
  await page.evaluate(async () => {
    for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
  });
  const sample = reference.cases.find(item => item.name === name)!;
  await expect(page.getByLabel('Choice container calls', { exact: true }))
    .toHaveText(JSON.stringify(sample.beforeOpen));
  await control(page, sample.component as ChoiceContainerCase['component']).click();
  await expect(page.locator(surface).filter({ visible: true })).toHaveCount(1);
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const shadow = document.getElementById('choice-shadow')!.shadowRoot!;
    const popup = [...document.querySelectorAll('.ant-select-dropdown'),
      ...shadow.querySelectorAll('.ant-select-dropdown')]
      .find(node => node.getClientRects().length && getComputedStyle(node).display !== 'none')!;
    const trigger = document.querySelector('[data-choice-trigger],.ant-select')!;
    const calls: { getter: string; trigger: string; tag: string; }[] = JSON.parse(
      document.querySelector('[aria-label="Choice container calls"]')!.textContent!
    );
    return {
      target: popup.getRootNode() instanceof ShadowRoot ? 'shadow'
        : popup.closest<HTMLElement>('[data-choice-container]')?.dataset.choiceContainer ?? 'default',
      calls: [...new Map(calls.map(call => [JSON.stringify(call), call])).values()],
      gap: Math.round(popup.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom)
    };
  });
}

async function chooseAlpha(page: Page, component: ChoiceContainerCase['component']) {
  if (component.startsWith('tree-select')) {
    const row = page.getByRole('treeitem', { name: 'Alpha', exact: true });
    await (component === 'tree-select-checkable' ? row.getByRole('checkbox')
      : row.getByRole('button', { name: 'Alpha', exact: true })).click();
  } else {
    await page.getByRole('menuitemcheckbox', { name: 'Parent', exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Alpha', exact: true }).click();
  }
}

for (const sample of reference.cases) {
  test(`container, trigger and gap match the official source for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);

    await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
    await expect(page.locator('[getpopupcontainer]')).toHaveCount(0);
  });

  test(`getter replacement retains the source editor and popup state for ${sample.name}`,
    async ({ page }) => {
      await open(page, sample.name);
      const custom = sample.component === 'cascader-custom';
      const input = custom ? page.getByLabel('Choice popup draft', { exact: true })
        : control(page, sample.component as ChoiceContainerCase['component']);
      await input.fill('alp');
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 2));
      if (custom) await page.locator('[data-choice-count]')
        .evaluate(node => (node as HTMLElement).click());
      const original = await input.elementHandle();
      const popup = await page.locator(surface).elementHandle();
      const active = await input.getAttribute('aria-activedescendant');

      await page.getByRole('button', { name: 'Refresh choice function', exact: true })
        .evaluate(node => (node as HTMLElement).click());
      await page.evaluate(async () => {
        for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
      });

      expect({
        same: await input.evaluate((node, old) => node === old, original),
        value: await input.inputValue(),
        selection: await input.evaluate(node => [
          (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
        ]),
        focused: await input.evaluate(node =>
          (node.getRootNode() as Document | ShadowRoot).activeElement === node),
        ...custom ? { count: await page.locator('[data-choice-count]').textContent() } : {},
        activeRetained: await input.getAttribute('aria-activedescendant') === active
      }).toEqual(sample.refresh);
      expect(await page.locator(surface).evaluate((node, old) => node === old, popup)).toBe(true);
      await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
      await expect(page.getByLabel('Choice container searches', { exact: true }))
        .toHaveText(custom ? '[]' : '["alp"]');
    });

  if ('rtlRefresh' in sample) {
    test(`RTL updates retain source popup focus and editor state for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      const input = page.getByLabel('Choice popup draft', { exact: true });
      await input.fill('alp');
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 2));
      await page.locator('[data-choice-count]').evaluate(node => (node as HTMLElement).click());
      const original = await input.elementHandle();

      await check(page, 'Right to left', true);

      await expect(page.locator(surface)).toHaveAttribute('dir', 'rtl');
      expect({
        same: await input.evaluate((node, old) => node === old, original),
        value: await input.inputValue(),
        selection: await input.evaluate(node => [
          (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
        ]),
        focused: await input.evaluate(node =>
          (node.getRootNode() as Document | ShadowRoot).activeElement === node),
        count: await page.locator('[data-choice-count]').textContent()
      }).toEqual(sample.rtlRefresh);
      await expect(page.locator(surface)).toBeVisible();
    });
  }
}

for (const component of components) {
  test(`shadow ${component} preserves pointer selection and form values`, async ({ page }) => {
    await open(page, `${component}-shadow`);

    await chooseAlpha(page, component);

    await expect(control(page, component)).toBeFocused();
    if (component.startsWith('tree-select')) {
      expect(await page.locator('#choice-container-form').evaluate(node =>
        new FormData(node as HTMLFormElement).getAll('selected'))).toEqual(['alpha']);
    } else if (component === 'cascader-multiple') {
      await expect(page.getByLabel('Choice container values', { exact: true }))
        .toHaveText('[[["parent","alpha"]]]');
    } else {
      await control(page, component).press('Escape');
      await page.getByRole('button', { name: 'Submit choice form', exact: true }).click();
      await expect(page.getByLabel('Choice submitted', { exact: true }))
        .toHaveText('{"path":["parent","alpha"]}');
    }
  });

  test(`shadow ${component} keeps keyboard selection and Escape on the trigger`, async ({ page }) => {
    await open(page, `${component}-shadow`);
    const input = control(page, component);

    await input.press('ArrowDown');
    if (!component.startsWith('tree-select')) await input.press('ArrowRight');
    await input.press('Enter');

    await expect(page.getByLabel('Choice container values', { exact: true }))
      .toHaveText(component === 'tree-select' ? '["alpha"]'
        : component === 'tree-select-checkable' ? '[["alpha"]]'
          : component === 'cascader-multiple' ? '[[["parent","alpha"]]]'
            : '[["parent","alpha"]]');
    await expect(input).toBeFocused();
    if (component === 'tree-select' || component === 'cascader' || component === 'cascader-custom')
      await input.click();
    await input.press('Escape');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
  });

  test(`portal ${component} follows container and theme updates without replacing state`,
    async ({ page }) => {
      await open(page, `${component}-parent`);
      const popup = page.locator(surface);
      const original = await popup.elementHandle();
      const input = component === 'cascader-custom'
        ? page.getByLabel('Choice popup draft', { exact: true }) : control(page, component);
      await input.fill('alp');
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 2));

      await check(page, 'Alternate choice container', true);
      await expect(page.locator('#choice-child .ant-select-dropdown')).toBeVisible();
      await expect(page.locator('#choice-parent .ant-select-dropdown')).toHaveCount(0);
      await check(page, 'Override choice component theme', true);
      const color = component.startsWith('tree-select') ? '#123456' : '#234567';
      await expect(popup).toHaveCSS('--ant-color-bg-elevated', color);
      await check(page, 'Dark choice theme', true);
      await expect(popup).toHaveCSS('--choice-origin', 'dark');
      await expect(popup).toHaveCSS('--ant-color-bg-elevated', color);
      await check(page, 'Override choice component theme', false);
      await expect(popup).not.toHaveCSS('--ant-color-bg-elevated', color);

      expect(await popup.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue('alp');
      expect(await input.evaluate(node => [
        (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
      ])).toEqual([1, 2]);
      const scroller = component.startsWith('tree-select') ? popup.locator('.popup-body')
        : popup.getByRole('menu').first();
      await scroller.evaluate(node => node.dispatchEvent(new Event('scroll')));
      await expect(page.getByLabel('Choice container scrolls', { exact: true })).toHaveText('1');
    });

  test(`unmounting ${component} releases its portal while the form and containers remain`, async ({ page }) => {
    await open(page, `${component}-parent`);

    await check(page, 'Mount choice component', false);

    await expect(page.locator(surface)).toHaveCount(0);
    await expect(page.locator('#choice-container-form')).toHaveCount(1);
    await expect(page.locator('#choice-parent')).toHaveCount(1);
  });

  test(`removing the ${component} provider tree releases all popup resources`, async ({ page }) => {
    await open(page, `${component}-shadow`);
    const calls = await page.getByLabel('Choice owner calls', { exact: true }).textContent();

    await check(page, 'Mount choice tree', false);
    await page.getByLabel('Choice outside', { exact: true }).focus();
    await check(page, 'Dark choice theme', true);
    await page.evaluate(async () => {
      for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
    });

    await expect(page.locator(surface)).toHaveCount(0);
    await expect(page.locator('[data-choice-container]')).toHaveCount(0);
    await expect(page.getByLabel('Choice owner calls', { exact: true })).toHaveText(calls!);
    await expect(page.getByLabel('Choice outside', { exact: true })).toBeFocused();
  });
}

for (const component of ['tree-select', 'cascader', 'cascader-custom'] as const) {
  test(`portal ${component} works inside a native dialog and consumes Escape`, async ({ page }) => {
    await page.getByLabel('Choice reference', { exact: true }).selectOption(`${component}-parent`);
    await check(page, 'Choice in native dialog', true);
    const dialog = page.getByRole('dialog', { name: 'Choice container dialog', exact: true });
    const input = control(page, component);
    await input.click();
    await chooseAlpha(page, component);
    await input.click();

    await input.press('Escape');

    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
  });
}

for (const component of ['tree-select', 'cascader'] as const) {
  test(`shadow ${component} loads children into the same popup`, async ({ page }) => {
    await check(page, 'Lazy choice children', true);
    await open(page, `${component}-shadow`);
    const popup = page.locator(surface);
    const original = await popup.elementHandle();
    const input = control(page, component);
    if (component === 'tree-select') await input.press('ArrowRight');
    else await page.getByRole('menuitemcheckbox', { name: 'Lazy', exact: true }).click();
    await expect(page.getByLabel('Choice loads', { exact: true })).toHaveText('1/0');

    await page.getByRole('button', { name: 'Resolve choice children', exact: true })
      .evaluate(node => (node as HTMLElement).click());

    await expect(component === 'tree-select'
      ? page.getByRole('treeitem', { name: 'Alpha', exact: true })
      : page.getByRole('menuitemcheckbox', { name: 'Alpha', exact: true })).toBeVisible();
    expect(await popup.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(page.getByLabel('Choice loads', { exact: true }))
      .toHaveText(component === 'tree-select' ? '1/1' : '1/0');
  });
}

test('TreeSelect ignores pending load completion after unmounting its portal', async ({ page }) => {
  await check(page, 'Lazy choice children', true);
  await open(page, 'tree-select-shadow');
  await control(page, 'tree-select').press('ArrowRight');
  await expect(page.getByLabel('Choice loads', { exact: true })).toHaveText('1/0');

  await check(page, 'Mount choice component', false);
  await page.getByRole('button', { name: 'Resolve choice children', exact: true })
    .evaluate(node => (node as HTMLElement).click());
  await page.evaluate(async () => {
    for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
  });

  await expect(page.getByLabel('Choice loads', { exact: true })).toHaveText('1/0');
  await expect(page.locator(surface)).toHaveCount(0);
});

test('CascaderPanel remains inline and never calls the provider popup getter', async ({ page }) => {
  await page.getByLabel('Choice reference', { exact: true }).selectOption('cascader-parent');
  await check(page, 'Use CascaderPanel', true);
  await expect(page.locator('.ant-cascader-panel')).toBeVisible();

  await check(page, 'Dark choice theme', true);

  await expect(page.getByLabel('Choice container calls', { exact: true })).toHaveText('[]');
  await expect(page.locator(surface)).toHaveCount(0);
  await expect(page.locator('#choice-container-form .ant-cascader-panel')).toHaveCount(1);
});

test('Cascader preserves its measured width when an ancestor has the same variable', async ({ page }) => {
  await open(page, 'cascader-parent');
  const popup = page.locator(surface);
  const before = await popup.evaluate(node => getComputedStyle(node)
    .getPropertyValue('--cascader-anchor-width'));

  await page.locator('.ant-cascader').evaluate(node => {
    const provider = node.closest<HTMLElement>('.ant-svelte-theme')!;
    provider.style.setProperty('--cascader-anchor-width', '999px');
    provider.style.setProperty('--choice-probe', 'updated');
  });

  await expect(popup).toHaveCSS('--choice-probe', 'updated');
  await expect(popup).toHaveCSS('--cascader-anchor-width', before);
});
