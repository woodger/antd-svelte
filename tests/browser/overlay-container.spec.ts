import type { Page } from '@playwright/test';
import { expect, test } from './test';
import reference from './fixtures/ant-design-overlay-container-reference.json' with { type: 'json' };
import type { OverlayContainerCase } from './fixtures/overlay-container-presets';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=overlay-container');
});

function selector(component: OverlayContainerCase['component']) {
  return component === 'dropdown' ? '.ant-dropdown'
    : component === 'popover' || component === 'popconfirm' ? '.ant-popover' : '.ant-tooltip';
}

async function open(page: Page, sample: OverlayContainerCase) {
  await page.getByLabel('Overlay reference', { exact: true }).selectOption(sample.name);
  await expect(page.getByLabel('Overlay container calls', { exact: true })).toHaveText('[]');
  await page.evaluate(async () => {
    for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
  });
  const source = reference.cases.find(item => item.name === sample.name)!;
  await expect(page.getByLabel('Overlay container calls', { exact: true }))
    .toHaveText(JSON.stringify(source.beforeOpen));
  if (sample.component === 'typography') await page.locator('[data-overlay-trigger=typography]').hover();
  await page.getByRole('button', { name: 'Open container overlay', exact: true })
    .evaluate(button => (button as HTMLElement).click());
  await expect(page.locator(`${selector(sample.component)}:popover-open`))
    .toHaveCount(source.snapshot.targets.length);
  await expect(page.locator(`${selector(sample.component)}:popover-open`).first()).toBeVisible();
}

async function snapshot(page: Page, component: OverlayContainerCase['component']) {
  return page.evaluate(selector => {
    const shadow = document.getElementById('overlay-shadow')!.shadowRoot!;
    const nodes = [...document.querySelectorAll(selector), ...shadow.querySelectorAll(selector)]
      .filter(node => node.getClientRects().length && getComputedStyle(node).display !== 'none');
    const calls: { getter: string; trigger: string; tag: string; }[] = JSON.parse(
      document.querySelector('[aria-label="Overlay container calls"]')!.textContent!
    );
    return {
      targets: nodes.map(node => node.getRootNode() instanceof ShadowRoot ? 'shadow'
        : node.closest<HTMLElement>('[data-overlay-container]')?.dataset.overlayContainer ?? 'default')
        .sort(),
      calls: [...new Map(calls.map(call => [JSON.stringify(call), call])).values()]
        .sort((a, b) => (a.getter + a.trigger).localeCompare(b.getter + b.trigger))
    };
  }, selector(component));
}

async function check(page: Page, label: string, value: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, value) => {
    const input = node as HTMLInputElement;
    input.checked = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

for (const sample of reference.cases) {
  test(`container precedence matches the official source for ${sample.name}`, async ({ page }) => {
    await open(page, sample as OverlayContainerCase);

    await expect.poll(() => snapshot(page, sample.component as OverlayContainerCase['component']))
      .toEqual(sample.snapshot);
    await expect(page.locator('[getpopupcontainer],[gettooltipcontainer]')).toHaveCount(0);
  });

  if (sample.refresh) {
    test(`callback replacement keeps the source draft, selection and state for ${sample.name}`,
      async ({ page }) => {
        await open(page, sample as OverlayContainerCase);
        const input = page.getByLabel('Overlay draft', { exact: true });
        await input.fill('Retained overlay draft');
        await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 8));
        const original = await input.elementHandle();
        await page.locator('[data-overlay-count]').evaluate(node => (node as HTMLElement).click());

        await page.getByRole('button', { name: 'Refresh overlay function', exact: true })
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
          count: await page.locator('[data-overlay-count]').textContent()
        }).toEqual(sample.refresh);
        await expect.poll(() => snapshot(page, sample.component as OverlayContainerCase['component']))
          .toEqual(sample.snapshot);
      });
  }
}

for (const component of ['tooltip', 'popover', 'popconfirm', 'dropdown', 'slider-range'] as const) {
  test(`custom ${component} container follows parent changes and releases portal DOM`, async ({ page }) => {
    const sample = reference.cases.find(item => item.name === `${component}-parent`)!;
    await open(page, sample as OverlayContainerCase);

    await check(page, 'Alternate overlay container', true);

    await expect(page.locator(`#overlay-child ${selector(component)}:popover-open`).first())
      .toBeVisible();
    await expect(page.locator(`#overlay-parent ${selector(component)}`)).toHaveCount(0);
    await page.getByLabel('Overlay outside', { exact: true }).focus();
    await check(page, 'Mount overlay component', false);

    await expect(page.locator(selector(component))).toHaveCount(0);
    await expect(page.getByLabel('Overlay outside', { exact: true })).toBeFocused();
    const calls = await page.getByLabel('Overlay container calls', { exact: true }).textContent();
    await page.evaluate(async () => {
      for (let frame = 0; frame < 5; frame++) await new Promise(requestAnimationFrame);
    });
    await expect(page.getByLabel('Overlay container calls', { exact: true })).toHaveText(calls!);
  });
}

for (const component of ['tooltip', 'popover', 'dropdown'] as const) {
  test(`portal ${component} keeps global and component theme variables in their own layers`,
    async ({ page }) => {
      const sample = reference.cases.find(item => item.name === `${component}-parent`)!;
      await open(page, sample as OverlayContainerCase);
      const popup = page.locator(`${selector(component)}:popover-open`);
      await expect(popup).toHaveCSS('--overlay-origin', 'light');

      await check(page, 'Override overlay component theme', true);

      const variable = component === 'tooltip' ? '--ant-color-bg-spotlight' : '--ant-color-bg-elevated';
      const color = component === 'tooltip' ? '#123456' : component === 'popover' ? '#234567' : '#345678';
      await expect(popup).toHaveCSS(variable, color);
      await check(page, 'Dark overlay theme', true);
      await expect(popup).toHaveCSS('--overlay-origin', 'dark');
      await expect(popup).toHaveCSS(variable, color);
      await check(page, 'Override overlay component theme', false);
      await expect(popup).not.toHaveCSS(variable, color);
      await expect(popup).toBeVisible();
    });
}

test('shadow Dropdown keeps native keyboard selection and returns focus on Escape', async ({ page }) => {
  const sample = reference.cases.find(item => item.name === 'dropdown-shadow')!;
  await open(page, sample as OverlayContainerCase);
  const menu = page.getByRole('menu');
  await menu.getByRole('menuitem', { name: 'Alpha command', exact: true }).focus();

  await page.keyboard.press('ArrowDown');

  await expect(menu.getByRole('menuitem', { name: 'Beta command', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(page.getByRole('button', { name: 'Overlay trigger', exact: true })).toBeFocused();
});

test('shadow Popover keeps input focus and dismisses outside with its native contract', async ({ page }) => {
  const sample = reference.cases.find(item => item.name === 'popover-shadow')!;
  await open(page, sample as OverlayContainerCase);
  const input = page.getByLabel('Overlay draft', { exact: true });
  await input.fill('Shadow input');
  await expect(input).toBeFocused();
  await expect(page.locator('.ant-popover:popover-open')).toBeVisible();

  await input.press('Escape');

  await expect(page.locator('.ant-popover:popover-open')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Overlay trigger', exact: true })).toBeFocused();
});

for (const name of ['popover-parent', 'dropdown-shadow', 'slider-range-parent']) {
  test(`removing the provider tree releases every ${name} portal and callback`, async ({ page }) => {
    const sample = reference.cases.find(item => item.name === name)!;
    await open(page, sample as OverlayContainerCase);
    await page.getByLabel('Overlay outside', { exact: true }).focus();
    const calls = await page.getByLabel('Overlay owner calls', { exact: true }).textContent();

    await check(page, 'Mount overlay tree', false);
    await check(page, 'Dark overlay theme', true);
    await page.evaluate(async () => {
      for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
    });

    await expect(page.locator('.ant-tooltip,.ant-popover,.ant-dropdown')).toHaveCount(0);
    await expect(page.locator('[data-overlay-container]')).toHaveCount(0);
    await expect(page.getByLabel('Overlay owner calls', { exact: true })).toHaveText(calls!);
    await expect(page.getByLabel('Overlay outside', { exact: true })).toBeFocused();
  });
}

for (const component of ['tooltip', 'popover', 'dropdown'] as const) {
  test(`inherited popup coordinates do not overwrite the ${component} controller`, async ({ page }) => {
    const sample = reference.cases.find(item => item.name === `${component}-parent`)!;
    await open(page, sample as OverlayContainerCase);
    const popup = page.locator(`${selector(component)}:popover-open`);
    const variables = [
      '--arrow-x', '--arrow-y', '--ant-tooltip-valid-offset-x',
      '--ant-tooltip-arrow-offset-x', '--ant-tooltip-arrow-background-color'
    ];
    const before = await popup.evaluate((node, names) => names.map(name =>
      getComputedStyle(node).getPropertyValue(name)), variables);

    await page.locator('[data-overlay-trigger]').evaluate(node => {
      const origin = node.closest<HTMLElement>('.ant-svelte-theme')!;
      origin.style.setProperty('--arrow-x', '123px');
      origin.style.setProperty('--arrow-y', '456px');
      origin.style.setProperty('--ant-tooltip-valid-offset-x', '789px');
      origin.style.setProperty('--ant-tooltip-arrow-offset-x', '987px');
      origin.style.setProperty('--ant-tooltip-arrow-background-color', '#010203');
      origin.style.setProperty('--overlay-layout-probe', 'updated');
    });

    await expect(popup).toHaveCSS('--overlay-layout-probe', 'updated');
    expect(await popup.evaluate((node, names) => names.map(name =>
      getComputedStyle(node).getPropertyValue(name)), variables)).toEqual(before);
  });
}
