import type { Page } from '@playwright/test';
import { expect, test } from './test';
import reference from './fixtures/ant-design-popup-container-reference.json' with { type: 'json' };
import type { PopupContainerCase } from './fixtures/popup-container-presets';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=popup-container');
});

function selector(component: PopupContainerCase['component']) {
  return component === 'tabs' ? '.ant-tabs-dropdown'
    : component === 'color-picker' ? '.ant-color-picker.ant-popover' : '.ant-tour';
}

async function open(page: Page, sample: PopupContainerCase) {
  await page.getByLabel('Container reference', { exact: true }).selectOption(sample.name);
  if (sample.component === 'tabs') await page.locator('.ant-tabs-nav-more').click();
  else if (sample.component === 'color-picker') {
    const trigger = page.getByRole('button', { name: 'Container color picker', exact: true });
    await expect(trigger).toBeVisible();
    await page.evaluate(async () => {
      for (let frame = 0; frame < 2; frame++) await new Promise(requestAnimationFrame);
    });
    const source = reference.cases.find(item => item.name === sample.name)!;
    await expect(page.getByLabel('Container calls', { exact: true }))
      .toHaveText(JSON.stringify(source.beforeOpen));
    await trigger.click();
  }
  await expect(page.locator(selector(sample.component))).toBeVisible();
}

async function snapshot(page: Page, component: PopupContainerCase['component']) {
  return page.evaluate(selector => {
    const shadow = document.getElementById('provider-shadow')!.shadowRoot!;
    const popup = document.querySelector(selector) ?? shadow.querySelector(selector);
    if (!popup) return null;
    const root = popup.getRootNode();
    const calls: { getter: string; trigger: string; }[] = JSON.parse(
      document.querySelector('[aria-label="Container calls"]')!.textContent!
    );

    return {
      target: root instanceof ShadowRoot ? (root.host as HTMLElement).dataset.containerTarget
        : popup.closest<HTMLElement>('[data-container-target]')?.dataset.containerTarget ?? 'body',
      shadow: root instanceof ShadowRoot,
      calls: [...new Map(calls.map(item => [JSON.stringify(item), item])).values()]
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
  test(`popup container matches the official source for ${sample.name}`, async ({ page }) => {
    await open(page, sample as PopupContainerCase);

    await expect.poll(() => snapshot(page, sample.component as PopupContainerCase['component']))
      .toEqual(sample.snapshot);
    await expect(page.locator('[getpopupcontainer]')).toHaveCount(0);
  });

  if (sample.refresh) {
    test(`same-container callback refresh preserves source content state for ${sample.name}`,
      async ({ page }) => {
        await open(page, sample as PopupContainerCase);
        const draft = page.getByLabel('Container draft', { exact: true });
        await draft.fill('Retained container draft');
        await draft.evaluate(input => (input as HTMLInputElement).setSelectionRange(2, 8));
        const original = await draft.elementHandle();
        await page.locator('[data-provider-count]').evaluate(button => (button as HTMLElement).click());

        await page.getByRole('button', { name: 'Refresh container function', exact: true })
          .evaluate(button => (button as HTMLElement).click());
        await page.evaluate(async () => {
          for (let frame = 0; frame < 7; frame++) await new Promise(requestAnimationFrame);
        });

        const actual = {
          same: await draft.evaluate((node, old) => node === old, original),
          value: await draft.inputValue(),
          selection: await draft.evaluate(node => [
            (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
          ]),
          focused: await draft.evaluate(node =>
            (node.getRootNode() as Document | ShadowRoot).activeElement === node),
          count: await page.locator('[data-provider-count]').textContent()
        };
        expect(actual).toEqual(sample.refresh);
        await expect.poll(() => snapshot(page, sample.component as PopupContainerCase['component']))
          .toEqual(sample.snapshot);
      });
  }
}

for (const name of ['tabs-parent', 'tabs-child', 'color-parent', 'color-child']) {
  test(`live theme inheritance reaches the custom container for ${name}`, async ({ page }) => {
    const sample = reference.cases.find(item => item.name === name)! as PopupContainerCase;
    await open(page, sample);
    const popup = page.locator(selector(sample.component));
    const before = await popup.evaluate(node => getComputedStyle(node)
      .getPropertyValue('--ant-color-bg-container'));

    await check(page, 'Dark container theme', true);

    await expect.poll(() => popup.evaluate(node => getComputedStyle(node)
      .getPropertyValue('--ant-color-bg-container'))).not.toBe(before);
    await expect(popup).toBeVisible();
    await expect.poll(() => snapshot(page, sample.component)).toEqual(
      reference.cases.find(item => item.name === name)!.snapshot
    );
  });
}

for (const name of ['tabs-parent', 'color-parent']) {
  test(`provider container changes move the ${name} popup and clean up on unmount`, async ({ page }) => {
    const sample = reference.cases.find(item => item.name === name)! as PopupContainerCase;
    await open(page, sample);

    await check(page, 'Alternate parent container', true);

    await expect(page.locator(`#provider-child ${selector(sample.component)}`)).toBeVisible();
    await expect(page.locator(`#provider-parent ${selector(sample.component)}`)).toHaveCount(0);
    await page.getByLabel('Container outside', { exact: true }).focus();
    await check(page, 'Mount container component', false);

    await expect(page.locator(selector(sample.component))).toHaveCount(0);
    await expect(page.getByLabel('Container outside', { exact: true })).toBeFocused();
    const calls = await page.getByLabel('Container calls', { exact: true }).textContent();
    await page.evaluate(async () => {
      for (let frame = 0; frame < 5; frame++) await new Promise(requestAnimationFrame);
    });
    await expect(page.getByLabel('Container calls', { exact: true })).toHaveText(calls!);
  });
}

for (const name of ['tabs-shadow', 'color-shadow']) {
  test(`shadow popup keeps inside pointer events and dismisses on Escape for ${name}`,
    async ({ page }) => {
      const sample = reference.cases.find(item => item.name === name)! as PopupContainerCase;
      await open(page, sample);
      const draft = page.getByLabel('Container draft', { exact: true });
      await draft.fill('Shadow draft');
      await expect(draft).toBeFocused();
      await expect(page.locator(selector(sample.component))).toBeVisible();

      await draft.press('Escape');

      await expect(page.locator(selector(sample.component))).toBeHidden();
      const trigger = sample.component === 'tabs' ? page.locator('.ant-tabs-nav-more')
        : page.getByRole('button', { name: 'Container color picker', exact: true });
      await expect(trigger).toBeFocused();
    });
}

test('More keyboard selection scrolls and activates options inside a shadow popup', async ({ page }) => {
  const sample = reference.cases.find(item => item.name === 'tabs-shadow-menu')! as PopupContainerCase;
  await open(page, sample);
  const popup = page.locator('.ant-tabs-dropdown');
  const first = popup.getByRole('option').first();
  await first.focus();

  await first.press('ArrowDown');
  const second = popup.getByRole('option').nth(1);
  await expect(second).toBeFocused();
  const label = await second.textContent();
  await second.press('Enter');

  await expect(page.getByRole('tab', { name: label!, exact: true })).toHaveAttribute(
    'aria-selected', 'true'
  );
  await expect(page.locator('.ant-tabs-dropdown')).toBeHidden();
});
