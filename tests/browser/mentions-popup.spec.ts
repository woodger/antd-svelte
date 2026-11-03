import type { Page } from '@playwright/test';
import { expect, test } from './test';
import reference from './fixtures/ant-design-mentions-popup-reference.json' with { type: 'json' };

const surface = '.ant-mentions-dropdown';
const input = (page: Page) => page.getByRole('combobox', { name: 'Mention entry', exact: true });
test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=mentions-popup'); });

async function check(page: Page, label: string, value: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, value) => {
    const control = node as HTMLInputElement;
    control.checked = value;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function open(page: Page, name: string) {
  await page.getByLabel('Mention popup reference', { exact: true }).selectOption(name);
  const sample = reference.cases.find(item => item.name === name)!;
  await page.evaluate(async () => {
    for (let n = 0; n < 3; n++) await new Promise(requestAnimationFrame);
  });
  await expect(page.getByLabel('Mention popup calls', { exact: true }))
    .toHaveText(JSON.stringify(sample.beforeOpen));
  const prefix = sample.prefix ?? '@';
  await input(page).pressSequentially(prefix === '@@' ? '@@a' : prefix);
  await expect(page.locator(surface)).toBeVisible();
  return sample;
}

async function snapshot(page: Page, context: boolean) {
  return page.evaluate(context => {
    const shadow = document.getElementById('mention-shadow')!.shadowRoot!;
    const popup = document.querySelector('.ant-mentions-dropdown')
      ?? shadow.querySelector('.ant-mentions-dropdown');
    if (!popup) return null;
    const calls: unknown[] = JSON.parse(
      document.querySelector('[aria-label="Mention popup calls"]')!.textContent!
    );
    const field = popup.querySelector('[aria-label="Popup field"]');
    return {
      target: popup.getRootNode() instanceof ShadowRoot ? 'shadow'
        : popup.closest<HTMLElement>('[data-mention-container]')?.dataset.mentionContainer
          ?? 'default',
      calls: [...new Map(calls.map(call => [JSON.stringify(call), call])).values()],
      menu: Boolean(popup.querySelector('[role=listbox]')),
      ...context ? { context: {
        rootError: document.querySelector('.ant-mentions')!
          .classList.contains('ant-mentions-status-error'),
        fieldError: !!field?.classList.contains('ant-input-status-error'),
        fieldSmall: !!field?.classList.contains('ant-input-sm'),
        fieldCompact: !!field?.className.includes('compact')
      } } : {}
    };
  }, context);
}

for (const sample of reference.cases) {
  test(
    `popup container and rendering match the official source for ${sample.name}`,
    async ({ page }) => {
      await open(page, sample.name);

      await expect.poll(() => snapshot(page, Boolean(sample.context)))
        .toEqual(sample.snapshot);
      await expect(page.locator('[getpopupcontainer],[popuprender]')).toHaveCount(0);
    }
  );

  test(
    `getter refresh keeps the source textarea and popup state for ${sample.name}`,
    async ({ page }) => {
      await open(page, sample.name);
      await input(page).evaluate(node => {
        const control = node as HTMLTextAreaElement;
        control.setSelectionRange(0, control.value.length);
      });
      const original = await input(page).elementHandle();
      const popup = await page.locator(surface).elementHandle();
      if (sample.custom) await page.locator('[data-mention-count]')
        .evaluate(node => (node as HTMLElement).click());

      await page.getByRole('button', { name: 'Refresh mention function', exact: true })
        .evaluate(node => (node as HTMLElement).click());
      await page.evaluate(async () => {
        for (let n = 0; n < 5; n++) await new Promise(requestAnimationFrame);
      });

      expect({
        same: await input(page).evaluate((node, old) => node === old, original),
        value: await input(page).inputValue(),
        selection: await input(page).evaluate(node => [
          (node as HTMLTextAreaElement).selectionStart,
          (node as HTMLTextAreaElement).selectionEnd
        ]),
        focused: await input(page).evaluate(node => document.activeElement === node),
        ...sample.custom ? { count: await page.locator('[data-mention-count]').textContent() } : {}
      }).toEqual(sample.refresh);
      expect(await page.locator(surface).evaluate((node, old) => node === old, popup)).toBe(true);
      await expect(page.locator(surface)).toBeVisible();
    }
  );

  if (sample.reopened) {
    const reopened = sample.reopened;
    test(`closing resets source popupRender state for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      await page.locator('[data-mention-count]').evaluate(node => (node as HTMLElement).click());
      await expect(page.locator('[data-mention-count]')).toHaveText('1');

      await input(page).press('Escape');

      await expect(page.locator('[data-mention-count]')).toHaveCount(0);
      await input(page).fill('');
      await input(page).pressSequentially('@');
      await expect(page.locator(surface)).toBeVisible();
      await expect(page.locator('[data-mention-count]')).toHaveText(reopened.count);
      await expect(page.locator(surface)).toHaveCount(1);
    });
  }

  if ('moved' in sample) {
    test(`moving the container recreates the source popup for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      const original = await page.locator(surface).elementHandle();
      await page.locator('[data-mention-count]').evaluate(node => (node as HTMLElement).click());

      await check(page, 'Alternate mention container', true);

      await expect(page.locator('#mention-child .ant-mentions-dropdown')).toBeVisible();
      expect({
        same: await page.locator(surface).evaluate((node, old) => node === old, original),
        count: await page.locator('[data-mention-count]').textContent(),
        target: await page.locator(surface).evaluate(node =>
          node.closest<HTMLElement>('[data-mention-container]')!.dataset.mentionContainer)
      }).toEqual(sample.moved);
      await expect(page.locator(surface)).toHaveCount(1);
      await expect(input(page)).toBeFocused();
    });
  }
}

for (const name of [
  'native-local', 'native-shadow', 'custom-local', 'custom-shadow', 'custom-replace'
]) {
  test(`pointer and keyboard choices keep native text and caret for ${name}`, async ({ page }) => {
    const sample = await open(page, name);
    if ('replace' in sample && sample.replace) await input(page).press('Enter');
    else await page.getByRole('option', { name: 'Alpha', exact: true }).click();

    await expect(input(page)).toHaveValue('@alpha ');
    await expect(input(page)).toBeFocused();
    expect(
      await input(page).evaluate(node => (node as HTMLTextAreaElement).selectionStart)
    ).toBe(7);
    expect(await input(page).evaluate(node =>
      new FormData((node as HTMLTextAreaElement).form!).get('note'))).toBe('@alpha ');
    await expect(page.getByLabel('Mention popup selected', { exact: true }))
      .toHaveText('["alpha"]');
    await expect(page.locator(`${surface}:popover-open`)).toHaveCount(0);
  });
}

test(
  'loading and empty custom menus preserve the original search and native selection',
  async ({ page }) => {
    await open(page, 'custom-shadow');
    await check(page, 'Loading mention popup', true);
    await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    await input(page).press('Enter');
    await expect(input(page)).toHaveValue('@');

    await check(page, 'Empty mention popup', true);
    await check(page, 'Loading mention popup', false);

    await expect(page.getByRole('listbox')).not.toHaveAttribute('aria-busy');
    await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(0);
    await expect(page.getByText('Mention header', { exact: true })).toBeVisible();
    await check(page, 'Empty mention popup', false);
    await input(page).press('ArrowDown');
    await input(page).press('Enter');
    await expect(input(page)).toHaveValue('@beta ');
  }
);

for (const name of ['custom-local', 'custom-shadow']) {
  test(`custom ${name} keeps menu focus and closes for a footer field`, async ({ page }) => {
    await open(page, name);
    await page.getByRole('option', { name: 'Alpha', exact: true }).focus();
    await expect(page.locator(surface)).toBeVisible();
    await expect(page.getByLabel('Mention popup blurred', { exact: true })).toHaveText('0');

    await page.getByRole('textbox', { name: 'Popup field', exact: true }).focus();

    await expect(page.getByRole('textbox', { name: 'Popup field', exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Mention popup blurred', { exact: true })).toHaveText('1');
  });

  test(`${name} preserves theme variables and releases portals on unmount`, async ({ page }) => {
    await open(page, name);
    const original = await page.locator(surface).elementHandle();
    await check(page, 'Dark mention theme', true);
    await expect(page.locator(surface)).toHaveCSS('--mention-origin', 'dark');
    expect(await page.locator(surface).evaluate((node, old) => node === old, original)).toBe(true);
    const calls = await page.getByLabel('Mention owner calls', { exact: true }).textContent();

    await check(page, 'Mount mention tree', false);
    await page.getByLabel('Mention outside', { exact: true }).focus();
    await check(page, 'Dark mention theme', false);
    await page.evaluate(async () => {
      for (let n = 0; n < 5; n++) await new Promise(requestAnimationFrame);
    });

    await expect(page.locator(surface)).toHaveCount(0);
    await expect(page.locator('[data-mention-container]')).toHaveCount(0);
    await expect(page.getByLabel('Mention owner calls', { exact: true })).toHaveText(calls!);
    await expect(page.getByLabel('Mention outside', { exact: true })).toBeFocused();
  });
}

test(
  'native dialog keeps mention selection and handles Escape before dialog cancellation',
  async ({ page }) => {
    await page.getByLabel('Mention popup reference', { exact: true }).selectOption('custom-local');
    await check(page, 'Mention in native dialog', true);
    await input(page).pressSequentially('@');
    await page.getByRole('option', { name: 'Alpha', exact: true }).click();
    await expect(input(page)).toHaveValue('@alpha ');
    await input(page).pressSequentially('@');

    await input(page).press('Escape');

    await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
    expect(await page.getByRole('dialog').evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(input(page)).toBeFocused();
  }
);
