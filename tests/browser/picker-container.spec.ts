import type { Page } from '@playwright/test';
import { expect, test } from './test';
import reference from './fixtures/ant-design-picker-container-reference.json' with { type: 'json' };

const surface = '.ant-picker-dropdown';
const entries = (page: Page) => page.getByRole('combobox', { name: 'Picker entry', exact: true });
test.use({ viewport: { width: 2000, height: 1600 } });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=picker-container'); });

async function frames(page: Page) {
  await page.evaluate(async () => {
    for (let n = 0; n < 7; n++) await new Promise(requestAnimationFrame);
  });
}
async function check(page: Page, label: string, checked: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, checked) => {
    const control = node as HTMLInputElement;
    control.checked = checked;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}
async function calls(page: Page) {
  const value = await page.getByLabel('Picker container calls', { exact: true }).textContent();
  const calls: unknown[] = JSON.parse(value!);
  return [...new Map(calls.map(call => [JSON.stringify(call), call])).values()];
}
async function open(page: Page, name: string) {
  const sample = reference.cases.find(item => item.name === name)!;
  await page.getByLabel('Picker reference', { exact: true }).selectOption(name);
  await expect.poll(() => calls(page)).toEqual(sample.beforeOpen);
  if (!sample.initial) await entries(page).first().click();
  await expect(page.locator(surface)).toBeVisible();
  await frames(page);
  return sample;
}
async function snapshot(page: Page) {
  return page.locator(surface).evaluate(popup => {
    const position = Array.from(popup.classList)
      .find(name => name.startsWith('ant-picker-dropdown-placement-'))!
      .replace('ant-picker-dropdown-placement-', '');
    const rawCalls: unknown[] = JSON.parse(
      document.querySelector('[aria-label="Picker container calls"]')!.textContent!
    );
    return {
      target: popup.getRootNode() instanceof ShadowRoot ? 'shadow'
        : popup.closest<HTMLElement>('[data-picker-container]')?.dataset.pickerContainer ?? 'default',
      calls: [...new Map(rawCalls.map(call => [JSON.stringify(call), call])).values()],
      placement: position,
      minWidth: Math.round(parseFloat(getComputedStyle(popup).minWidth))
    };
  });
}

for (const sample of reference.cases) {
  test(`container and geometry match the official picker for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);

    const { gap, ...source } = sample.snapshot;
    await expect.poll(() => snapshot(page)).toEqual(source);
    // Source округляет координаты вниз; высоты React и native panel различаются.
    const geometry = await page.locator(surface).evaluate((popup, placement) => {
      const bounds = document.querySelector('.ant-picker')!.getBoundingClientRect();
      const floating = popup.getBoundingClientRect();
      const top = placement.startsWith('top')
        ? bounds.top - floating.height - 4 : bounds.bottom + 4;
      const left = placement.endsWith('Right')
        ? bounds.right - floating.width : bounds.left;
      return {
        actual: [floating.left, floating.top],
        expected: [Math.floor(left), Math.floor(top)]
      };
    }, sample.snapshot.placement);

    expect(geometry.actual).toEqual(geometry.expected);
    expect(gap).toBeGreaterThanOrEqual(4);
    expect(gap).toBeLessThanOrEqual(5);
    await expect(page.locator('[getpopupcontainer]')).toHaveCount(0);
  });

  test(
    `same-container getter refresh preserves picker state for ${sample.name}`,
    async ({ page }) => {
      await open(page, sample.name);
      const input = entries(page).first();
      await input.focus();
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 7));
      const original = await input.elementHandle();
      const popup = await page.locator(surface).elementHandle();
      await page.locator('[data-picker-count]').evaluate(node => (node as HTMLElement).click());

      await page.getByRole('button', { name: 'Refresh picker function', exact: true })
        .evaluate(node => (node as HTMLElement).click());
      await frames(page);

      expect({
        same: await input.evaluate((node, old) => node === old, original),
        samePopup: await page.locator(surface).evaluate((node, old) => node === old, popup),
        value: await input.inputValue(),
        selection: await input.evaluate(node => [
          (node as HTMLInputElement).selectionStart,
          (node as HTMLInputElement).selectionEnd
        ]),
        focused: await input.evaluate(node => node === document.activeElement),
        count: await page.locator('[data-picker-count]').textContent()
      }).toEqual(sample.refresh);
      await expect(page.locator(surface)).toBeVisible();
      await expect(page.getByLabel('Picker container refs', { exact: true })).toContainText('"root":true');
    }
  );

  if (sample.moved) {
    const moved = sample.moved;
    test(`moving the container recreates the source panel for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      await entries(page).first().focus();
      const original = await page.locator(surface).elementHandle();
      await page.locator('[data-picker-count]').evaluate(node => (node as HTMLElement).click());

      await check(page, 'Alternate picker container', true);

      await expect(page.locator('#picker-child .ant-picker-dropdown')).toBeVisible();
      expect({
        same: await page.locator(surface).evaluate((node, old) => node === old, original),
        count: await page.locator('[data-picker-count]').textContent(),
        target: await page.locator(surface).evaluate(node =>
          node.closest<HTMLElement>('[data-picker-container]')!.dataset.pickerContainer)
      }).toEqual(moved);
      await expect(page.locator(surface)).toHaveCount(1);
      await expect(entries(page).first()).toBeFocused();
    });
  }
}

test('picker portals copy resolved aliases and release removed variables', async ({ page }) => {
  await page.getByLabel('Picker reference', { exact: true }).selectOption('date-local-shadow');
  const names = ['--portal-alpha', '--portal-beta', '--portal-gamma', '--portal-delta'];
  await page.locator('#picker-shadow').evaluate(node => {
    const style = node.ownerDocument.createElement('style');
    style.textContent = '.ant-picker-dropdown{--portal-alpha:var(--portal-beta);'
      + '--portal-beta:red;--portal-gamma:red;--portal-delta:var(--portal-gamma)}';
    node.shadowRoot!.append(style);
  });
  const origin = page.locator('#picker-container-form');
  await origin.evaluate((node, names) => {
    ['red', 'green', 'green', 'red'].forEach((value, index) => {
      (node as HTMLElement).style.setProperty(names[index], value);
    });
  }, names);
  await open(page, 'date-local-shadow');

  const variables = () => page.locator(surface).evaluate((node, names) => {
    const style = getComputedStyle(node);
    return names.map(name => style.getPropertyValue(name));
  }, names);
  await expect.poll(variables).toEqual(['red', 'green', 'green', 'red']);

  await origin.evaluate(node => {
    const style = (node as HTMLElement).style;
    style.setProperty('--portal-beta', 'blue');
    style.setProperty('--portal-gamma', 'blue');
  });

  await expect.poll(variables).toEqual(['red', 'blue', 'blue', 'red']);

  await origin.evaluate((node, names) => {
    for (const name of names) (node as HTMLElement).style.removeProperty(name);
  }, names);

  await expect.poll(variables).toEqual(['red', 'red', 'red', 'red']);
});

for (const component of ['date', 'date-range', 'time', 'time-range']) {
  test(
    `${component} keeps the native conditional lifetime when closing a portal`,
    async ({ page }) => {
      await open(page, `${component}-local-shadow`);
      await page.locator('[data-picker-count]').evaluate(node => (node as HTMLElement).click());
      await expect(page.locator('[data-picker-count]')).toHaveText('1');

      await entries(page).first().press('Escape');

      await expect(page.locator(surface)).toHaveCount(0);
      await entries(page).first().click();
      await expect(page.locator(surface)).toBeVisible();
      // Native panel удаляется при закрытии; retained state rc-trigger остаётся отдельным пробелом.
      await expect(page.locator('[data-picker-count]')).toHaveText('0');
      await expect(page.locator(surface)).toHaveCount(1);
    }
  );

  test(
    `${component} commits native input and FormData through its shadow portal`,
    async ({ page }) => {
      await open(page, `${component}-local-shadow`);
      const time = component.startsWith('time');
      const range = component.endsWith('range');
      const start = time ? '11:22:33.124' : '2026-05-13';
      const end = time ? '16:22:33.126' : '2026-05-16';

      await entries(page).first().fill(start);
      await entries(page).first().press('Enter');
      if (range) {
        await entries(page).nth(1).fill(end);
        await entries(page).nth(1).press('Enter');
      }

      await expect(page.locator(surface)).toHaveCount(0);
      await expect(entries(page).first()).toHaveValue(start);
      if (range) await expect(entries(page).nth(1)).toHaveValue(end);
      expect(await page.locator('#picker-container-form').evaluate(node =>
        new FormData(node as HTMLFormElement).getAll('selected'))).toEqual(range ? [start, end] : [start]);
      await expect(page.getByLabel('Picker container values', { exact: true }))
        .toContainText(time ? '.124' : '2026-05-13');
      await expect(entries(page).nth(range ? 1 : 0)).toBeFocused();
    }
  );

  test(`${component} preserves shadow footer focus, theme and owned state`, async ({ page }) => {
    await open(page, `${component}-local-shadow`);
    const field = page.getByRole('textbox', { name: 'Picker footer draft', exact: true });
    await field.focus();
    await field.fill('Owned draft');
    await field.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 7));
    const original = await field.elementHandle();
    const popup = await page.locator(surface).elementHandle();

    await check(page, 'Dark picker theme', true);
    await page.getByRole('button', { name: 'Refresh picker function', exact: true })
      .evaluate(node => (node as HTMLElement).click());
    await frames(page);

    await expect(field).toHaveValue('Owned draft');
    expect(await field.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await field.evaluate(node =>
      node === (node.getRootNode() as Document | ShadowRoot).activeElement)).toBe(true);
    expect(await field.evaluate(node => [
      (node as HTMLInputElement).selectionStart,
      (node as HTMLInputElement).selectionEnd
    ])).toEqual([1, 7]);
    expect(await page.locator(surface).evaluate((node, old) => node === old, popup)).toBe(true);
    await expect(page.locator(surface)).toHaveCSS('--picker-origin', 'dark');
    const variables = [
      '--ant-color-text', '--ant-color-bg-elevated', '--ant-color-primary', '--ant-font-size'
    ];
    const tokens = await entries(page).first().evaluate((node, names) => {
      const style = getComputedStyle(node);
      return names.map(name => style.getPropertyValue(name));
    }, variables);
    expect(tokens.every(value => value !== '')).toBe(true);
    expect(await page.locator(surface).evaluate((node, names) => {
      const style = getComputedStyle(node);
      return names.map(name => style.getPropertyValue(name));
    }, variables)).toEqual(tokens);
    await expect(page.locator(surface)).toBeVisible();
  });

  test(`${component} releases refs, portals and callbacks on unmount`, async ({ page }) => {
    await open(page, `${component}-local-shadow`);
    const calls = await page.getByLabel('Picker owner calls', { exact: true }).textContent();

    await check(page, 'Mount picker component', false);
    await frames(page);

    await expect(page.locator(surface)).toHaveCount(0);
    await expect(page.getByLabel('Picker container refs', { exact: true }))
      .toHaveText('{"root":false,"start":false,"end":false}');
    await expect(page.getByLabel('Picker owner calls', { exact: true })).toHaveText(calls!);

    await check(page, 'Mount picker component', true);
    await entries(page).first().click();
    await expect(page.locator(surface)).toBeVisible();
    const remounted = await page.getByLabel('Picker owner calls', { exact: true }).textContent();
    await check(page, 'Mount picker tree', false);
    await page.getByLabel('Picker outside', { exact: true }).focus();
    await check(page, 'Dark picker theme', true);
    await frames(page);

    await expect(page.locator(surface)).toHaveCount(0);
    await expect(page.locator('[data-picker-container]')).toHaveCount(0);
    await expect(page.getByLabel('Picker owner calls', { exact: true })).toHaveText(remounted!);
    await expect(page.getByLabel('Picker outside', { exact: true })).toBeFocused();
  });
}
