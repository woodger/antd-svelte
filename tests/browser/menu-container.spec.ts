import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-menu-container-reference.json' with { type: 'json' };

const surface = '.ant-menu-submenu-popup';
const menu = (page: Page) => page.getByRole('menu', { name: 'Container menu', exact: true });
const title = (page: Page) => menu(page).locator(':scope > .ant-menu-submenu > button');
const draft = (page: Page) => page.getByRole('textbox', { name: 'Menu draft', exact: true });
const parentPopup = (page: Page) => page.locator(`${surface}:has(> ul[id$="-p-popup"])`);
test.use({ viewport: { width: 1600, height: 1200 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=menu-container');
  await page.mouse.move(1500, 1100);
});

async function frames(page: Page) {
  await page.evaluate(async () => {
    for (let n = 0; n < 10; n++) await new Promise(requestAnimationFrame);
  });
}
async function check(page: Page, label: string, checked: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, checked) => {
    const input = node as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}
function sourceSnapshot(snapshot: typeof reference.cases[number]['snapshot']) {
  // Overflow More ещё не перенесён; сырой UMD-снимок сохраняет его для следующего этапа.
  return {
    calls: snapshot.calls.filter(call => call.key !== 'rc-menu-more').map(call => ({
      ...call,
      // Native button заголовка сохраняет согласованную адаптацию доступности Menu.
      tag: call.tag === 'div' ? 'button' : call.tag
    })),
    popups: snapshot.popups.filter(popup => popup.key !== 'rc-menu-more')
  };
}
async function snapshot(page: Page) {
  return page.evaluate(() => {
    const shadow = document.getElementById('menu-shadow')!.shadowRoot!;
    const calls: Record<string, unknown>[] = JSON.parse(
      document.querySelector('[aria-label="Menu container calls"]')!.textContent!
    );
    const popups = [
      ...document.querySelectorAll('.ant-menu-submenu-popup'),
      ...shadow.querySelectorAll('.ant-menu-submenu-popup')
    ];
    const sort = (a: unknown, b: unknown) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en');
    return {
      calls: [...new Map(calls.map(call => [JSON.stringify(call), call])).values()].sort(sort),
      popups: popups.map(node => {
        const ul = node.querySelector(':scope > ul');
        const input = node.querySelector<HTMLInputElement>('[aria-label="Menu draft"]');
        return {
          key: ul?.id.match(/-(p|n)-popup$/)?.[1] ?? null,
          target: node.getRootNode() instanceof ShadowRoot ? 'shadow'
            : node.closest<HTMLElement>('[data-menu-container]')?.dataset.menuContainer ?? 'default',
          visible: node.getClientRects().length > 0 && getComputedStyle(node).display !== 'none',
          draft: input?.value ?? null,
          count: node.querySelector('[data-menu-count]')?.textContent ?? null
        };
      }).sort(sort)
    };
  });
}
async function open(page: Page, name: string) {
  const sample = reference.cases.find(item => item.name === name)!;
  await page.getByLabel('Menu reference', { exact: true }).selectOption(name);
  await expect.poll(() => snapshot(page)).toEqual(sourceSnapshot(sample.beforeOpen));
  if (!sample.initial) await title(page).click();
  await expect(draft(page)).toBeVisible();
  await frames(page);
  return sample;
}
async function edit(page: Page) {
  await draft(page).fill('Owned draft');
  await draft(page).evaluate(node => {
    (node as HTMLInputElement).setSelectionRange(1, 5);
    node.parentElement!.querySelector<HTMLElement>('[data-menu-count]')!.click();
  });
}

for (const sample of reference.cases) {
  test(`menu containers match the source for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);

    await expect.poll(() => snapshot(page)).toEqual(sourceSnapshot(sample.snapshot));
    await expect(menu(page)).not.toHaveAttribute('getpopupcontainer');
  });

  test(`menu getter refresh preserves source state for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);
    await edit(page);
    const originalMenu = await menu(page).elementHandle();
    const originalInput = await draft(page).elementHandle();
    const originalPopup = await parentPopup(page).count() ? await parentPopup(page).elementHandle()
      : undefined;

    await page.getByRole('button', { name: 'Refresh menu function', exact: true })
      .evaluate(node => (node as HTMLElement).click());
    await frames(page);

    const current = await draft(page).evaluate((input, old) => {
      const shadow = document.getElementById('menu-shadow')!.shadowRoot!;
      const popup = document.querySelector('.ant-menu-submenu-popup > ul[id$="-p-popup"]')
        ?.parentElement ?? shadow.querySelector('.ant-menu-submenu-popup > ul[id$="-p-popup"]')
          ?.parentElement;
      return {
        sameMenu: document.querySelector('#menu-host .ant-menu-root') === old.menu,
        sameInput: input === old.input,
        samePopup: popup === old.popup,
        draft: (input as HTMLInputElement).value,
        selection: [
          (input as HTMLInputElement).selectionStart,
          (input as HTMLInputElement).selectionEnd
        ],
        focused: input === (input.getRootNode() as Document | ShadowRoot).activeElement,
        count: input.parentElement!.querySelector('[data-menu-count]')!.textContent,
        parentActive: document.querySelector('#menu-host .ant-menu-root > .ant-menu-submenu')!
          .classList.contains('ant-menu-submenu-active')
      };
    }, { menu: originalMenu, input: originalInput, popup: originalPopup });

    expect(current).toEqual(sample.refresh);
    await expect(page.getByLabel('Menu container ref', { exact: true })).toHaveText('UL');
  });

  test(`nested menu containers match the source for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);
    await edit(page);

    await page.getByRole('menuitem', { name: 'Nested', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'Leaf', exact: true })).toBeVisible();

    await expect.poll(() => snapshot(page)).toEqual(sourceSnapshot(sample.nested));
  });

  if (sample.moved) {
    const moved = sample.moved;
    test(`changing a menu target recreates source contents for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      await edit(page);
      await page.getByRole('menuitem', { name: 'Nested', exact: true }).click();
      await expect(page.getByRole('menuitem', { name: 'Leaf', exact: true })).toBeVisible();
      const previous = await parentPopup(page).elementHandle();

      await check(page, 'Alternate menu container', true);

      await expect.poll(() => snapshot(page)).toEqual(sourceSnapshot(moved.snapshot));
      expect(await parentPopup(page).evaluate((node, old) => node === old, previous))
        .toBe(moved.samePopup);
    });
  }
}

const nested = (page: Page) => page.getByRole('menuitem', { name: 'Nested', exact: true });
const leaf = (page: Page) => page.getByRole('menuitem', { name: 'Leaf', exact: true });
const alpha = (page: Page) => draft(page).locator('xpath=ancestor::li[1]');
const popups = (page: Page) => page.locator(`${surface}:popover-open`);

for (const name of ['vertical-local', 'vertical-local-shadow', 'horizontal-shadow', 'vertical-rtl']) {
  test(`portaled menu keyboard follows logical levels once for ${name}`, async ({ page }) => {
    const sample = await open(page, name);
    await page.getByRole('button', { name: 'Focus container alpha', exact: true })
      .evaluate(node => (node as HTMLElement).click());
    await expect(alpha(page)).toBeFocused();
    const children = sample.rtl ? 'ArrowLeft' : 'ArrowRight';

    await alpha(page).press('End');
    await expect(nested(page)).toBeFocused();
    await nested(page).press(children);
    await expect(leaf(page)).toBeFocused();
    await leaf(page).press('Escape');
    await expect(nested(page)).toBeFocused();
    await expect(leaf(page)).toHaveCount(0);
    await nested(page).press('Home');
    await expect(alpha(page)).toBeFocused();
    await alpha(page).press('Enter');

    await expect(page.getByLabel('Menu container clicked', { exact: true }))
      .toHaveText('[{"key":"a","keyPath":["a","p"]}]');
    await expect(page.getByLabel('Menu container selected', { exact: true })).toHaveText('[["a"]]');
    await expect(page.getByLabel('Menu container keys', { exact: true }))
      .toHaveText(JSON.stringify(['End', children, 'Escape', 'Home', 'Enter']));
    await expect(page.getByLabel('Menu container key targets', { exact: true }))
      .toHaveText('[true,true,true,true,true]');
    await expect(popups(page)).toHaveCount(0);
  });

  test(`portaled menu hover keeps its ancestors open for ${name}`, async ({ page }) => {
    await page.getByLabel('Menu reference', { exact: true }).selectOption(name);
    await check(page, 'Hover container menu', true);

    await title(page).hover();
    await expect(draft(page)).toBeVisible();
    await nested(page).hover();
    await expect(leaf(page)).toBeVisible();
    await leaf(page).hover();
    await frames(page);

    await expect(popups(page)).toHaveCount(2);
    await expect(title(page).locator('..')).toHaveClass(/ant-menu-submenu-active/);
    await expect(nested(page).locator('..')).toHaveClass(/ant-menu-submenu-active/);
    await page.mouse.move(1500, 1100);

    await expect(popups(page)).toHaveCount(0);
    await expect(title(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test(`portaled menu theme updates preserve the focused draft for ${name}`, async ({ page }) => {
    await open(page, name);
    await edit(page);
    const originalInput = await draft(page).elementHandle();
    const originalPopup = await parentPopup(page).elementHandle();
    const before = await parentPopup(page).boundingBox();

    await check(page, 'Dark container menu', true);

    await expect.poll(() => draft(page).evaluate(node => getComputedStyle(node)
      .getPropertyValue('--menu-origin').trim())).toBe('dark');
    await expect(draft(page)).toHaveValue('Owned draft');
    await expect(draft(page)).toBeFocused();
    expect(await draft(page).evaluate((node, old) => ({
      same: node === old,
      selection: [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd]
    }), originalInput)).toEqual({ same: true, selection: [1, 5] });
    expect(await parentPopup(page).evaluate((node, old) => node === old, originalPopup)).toBe(true);
    expect(await parentPopup(page).boundingBox()).toEqual(before);
  });

  for (const label of ['Mount container menu', 'Mount menu tree']) {
    test(`portaled menu releases nodes and getters after ${label} for ${name}`, async ({ page }) => {
      await open(page, name);
      await nested(page).click();
      await expect(leaf(page)).toBeVisible();

      await check(page, label, false);
      await expect(page.locator(surface)).toHaveCount(0);
      const calls = await page.getByLabel('Menu owner calls', { exact: true }).innerText();
      await page.getByRole('button', { name: 'Refresh menu function', exact: true }).click();
      await check(page, 'Dark container menu', true);
      await frames(page);

      await expect(page.getByLabel('Menu owner calls', { exact: true })).toHaveText(calls);
      await expect(menu(page)).toHaveCount(0);
      if (label === 'Mount container menu') {
        await expect(page.getByLabel('Menu container ref', { exact: true })).toHaveText('none');
      }
    });
  }
}

for (const name of ['vertical-local', 'vertical-local-shadow', 'horizontal-shadow']) {
  test(`portaled menu native links dispatch a single click for ${name}`, async ({ page }) => {
    await open(page, name);
    await check(page, 'Link container leaf', true);
    await nested(page).click();
    const link = page.getByRole('link', { name: 'Leaf', exact: true });

    await link.focus();
    await link.press('Enter');

    await expect(page).toHaveURL(/#menu-container-destination$/);
    await expect(page.getByLabel('Menu container clicked', { exact: true }))
      .toHaveText('[{"key":"l","keyPath":["l","n","p"]}]');
    await expect(page.getByLabel('Menu container DOM events', { exact: true }))
      .toHaveText('[{"target":"A","type":"click"}]');
    await expect(page.getByLabel('Menu container selected', { exact: true })).toHaveText('[["l"]]');
    await expect(popups(page)).toHaveCount(0);
  });
}

for (const name of ['inline-force', 'inline-force-zero']) {
  test(`hidden inline menu copies preserve visible refs and consumer state for ${name}`, async ({ page }) => {
    await open(page, name);
    await expect(page.locator(surface)).toHaveCount(3);
    await expect(popups(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Focus container alpha', exact: true })
      .evaluate(node => (node as HTMLElement).click());
    await expect(alpha(page)).toBeFocused();
    await edit(page);
    const original = await draft(page).elementHandle();

    await check(page, 'Alternate menu container', true);

    await expect(page.locator('#menu-child > .ant-menu-submenu-popup')).toHaveCount(3);
    expect(await draft(page).evaluate((node, old) => node === old, original)).toBe(true);
    await expect(draft(page)).toHaveValue('Owned draft');
    await expect(draft(page)).toBeFocused();
    expect(await parentPopup(page).locator('[aria-label="Menu draft"]').inputValue()).toBe('Seed');
    await check(page, 'Mount container menu', false);

    await expect(page.locator(surface)).toHaveCount(0);
    await expect(page.getByLabel('Menu container ref', { exact: true })).toHaveText('none');
  });
}

test('menu force render retains hidden popup copies after being switched off', async ({ page }) => {
  await page.getByLabel('Menu reference', { exact: true }).selectOption('inline-local');
  await expect(page.locator(surface)).toHaveCount(0);

  await check(page, 'Force container menu', true);

  await expect(page.locator(surface)).toHaveCount(3);
  await expect(popups(page)).toHaveCount(0);
  await check(page, 'Force container menu', false);

  await expect(page.locator(surface)).toHaveCount(3);
  await expect(popups(page)).toHaveCount(0);
  await expect(title(page)).toHaveAttribute('aria-expanded', 'false');
});
