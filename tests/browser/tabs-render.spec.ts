import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-render-reference.json' with { type: 'json' };
import type { Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tabs-render');
});

async function capture(page: Page) {
  return page.locator('#tabs-render-main').evaluate(root => {
    const classes = (value: string) =>
      value.split(/\s+/).filter(name => /^(?:u-|p-|o-)/.test(name));
    const cssObject = (value: string | null | undefined) => {
      const css = document.createElement('span').style;
      css.cssText = value ?? '';
      return Object.fromEntries(Array.from(css, name => [name, css.getPropertyValue(name)]));
    };
    const props = JSON.parse(root.querySelector('[data-tabs-render-props]')!.textContent!) as {
      style: string | null;
      styles: Record<string, string | undefined>;
    };
    const nav = root.querySelector<HTMLElement>('.ant-tabs-nav');
    const css = nav && getComputedStyle(nav);
    const ink = root.querySelector<HTMLElement>('.ant-tabs-ink-bar');
    const trace = document.querySelector('[aria-label="Render Tabs trace"]')!.textContent!;

    return {
      props: {
        ...props,
        style: cssObject(props.style),
        styles: Object.fromEntries(Object.entries(props.styles)
          .map(([key, value]) => [key, cssObject(value)] as const)
          .filter(([, value]) => Object.keys(value).length))
      },
      header: nav && css ? {
        orientation: root.querySelector('[role=tablist]')!.getAttribute('aria-orientation'),
        classes: classes(nav.className),
        color: css.color,
        paddingTop: css.paddingTop,
        paddingLeft: css.paddingLeft
      } : null,
      tabs: Array.from(root.querySelectorAll<HTMLElement>('[role=tab]'), tab => {
        const cell = tab.closest<HTMLElement>('.ant-tabs-tab') ?? tab;
        const css = getComputedStyle(cell);
        return {
          label: tab.textContent!.trim(),
          selected: tab.getAttribute('aria-selected') === 'true',
          disabled: tab.getAttribute('aria-disabled') === 'true'
            || tab instanceof HTMLButtonElement && tab.disabled,
          classes: classes(cell.className),
          renderKey: cell.getAttribute('data-render-key'),
          title: cell.getAttribute('title'),
          draggable: cell.getAttribute('draggable'),
          decorator: cell.hasAttribute('aria-roledescription') ? {
            role: cell.getAttribute('role'),
            tabIndex: cell.getAttribute('tabindex'),
            description: cell.getAttribute('aria-roledescription')
          } : null,
          paddingLeft: css.paddingLeft,
          marginStart: css.marginInlineStart,
          color: css.color,
          controlsActivePane: tab.getAttribute('aria-controls') ===
            root.querySelector('[role=tabpanel][aria-hidden=false]')?.id
        };
      }),
      moreVisible: Array.from(root.querySelectorAll<HTMLElement>('.ant-tabs-nav-more'))
        .some(node => node.getClientRects().length
          && getComputedStyle(node).visibility !== 'hidden'),
      refAttached: document.querySelector('[data-tabs-header-ref]')?.textContent === 'true',
      wrappers: root.querySelectorAll('.o-node-wrapper').length,
      extras: Array.from(
        root.querySelectorAll('.ant-tabs-extra-content'),
        node => node.textContent
      ),
      add: root.querySelector('.ant-tabs-nav-add')?.textContent ?? null,
      addLabel: root.querySelector('.ant-tabs-nav-add')?.getAttribute('aria-label') ?? null,
      removeCount: root.querySelectorAll('.ant-tabs-tab-remove').length,
      removeLabel: root.querySelector('.ant-tabs-tab-remove')?.getAttribute('aria-label') ?? null,
      ink: ink ? {
        animated: ink.classList.contains('ant-tabs-ink-bar-animated'),
        height: getComputedStyle(ink).height,
        ...(ink.style.width ? { width: ink.style.width } : {})
      } : null,
      bodyAnimated: root.querySelector('.ant-tabs-body')!.classList
        .contains('ant-tabs-body-animated'),
      panes: Array.from(root.querySelectorAll<HTMLElement>('[role=tabpanel]'))
        .filter(node => node.getClientRects().length)
        .map(node => ({
          name: node.querySelector('input')?.name,
          classes: classes(node.className),
          paddingTop: getComputedStyle(node).paddingTop,
          background: getComputedStyle(node).backgroundColor
        })),
      trace: JSON.parse(trace) as string[]
    };
  });
}

for (const sample of reference.cases) {
  test(`custom tab bar matches the official source for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true }).selectOption(sample.name);
    await page.mouse.move(1100, 500);

    await expect.poll(() => capture(page)).toEqual(sample.initial);
    if ('popup' in sample) {
      await page.locator('#tabs-render-main .ant-tabs-nav-more').click();
      const popup = page.locator('.ant-tabs-dropdown:visible');

      await expect(popup).toBeVisible();
      await expect.poll(() => popup.evaluate(node => ({
        classes: Array.from(node.classList).filter(name => /^(?:u-|p-|o-)/.test(name)),
        paddingTop: getComputedStyle(node).paddingTop,
        color: getComputedStyle(node).color,
        rtl: node.classList.contains('ant-tabs-dropdown-rtl'),
        direction: getComputedStyle(node).direction,
        icon: document.querySelector('#tabs-render-main .ant-tabs-nav-more')!.textContent
      }))).toEqual('nativePopup' in sample ? sample.nativePopup : sample.popup);
    } else if (sample.initial.tabs.length) {
      await page.locator('#tabs-render-main').getByRole('tab', { name: 'Beta', exact: true })
        .click();
    }

    await page.mouse.move(1100, 500);
    await expect.poll(() => capture(page)).toEqual(sample.after);
  });
}

async function toggle(page: Page, label: string) {
  await page.getByLabel(label, { exact: true }).evaluate(element => {
    if (!(element instanceof HTMLInputElement)) throw new Error('Expected a checkbox');
    element.click();
  });
}

test('the standard bar ref retains its node and clears the previous owner on replacement and unmount',
  async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true })
      .selectOption('forwarded-header-ref');
    const nav = page.locator('#tabs-render-main .ant-tabs-nav');
    const original = await nav.elementHandle();
    const refs = page.getByLabel('Render Tabs header refs', { exact: true });
    await expect(refs).toHaveText('["old:set"]');

    await page.locator('#tabs-render-main').getByRole('tab', { name: 'Beta', exact: true }).click();

    await expect(refs).toHaveText('["old:set"]');
    await toggle(page, 'Update tab bar props');

    await expect(refs).toHaveText('["old:set","old:clear","new:set"]');
    expect(await nav.evaluate((element, previous) => element === previous, original)).toBe(true);
    await toggle(page, 'Mount render Tabs');

    await expect(refs).toHaveText('["old:set","old:clear","new:set","new:clear"]');
    await expect(nav).toHaveCount(0);
  });

test('tab bar updates and keyed sorting keep panel state, native nodes and attachment ownership',
  async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true }).selectOption('node-attributes');
    const root = page.locator('#tabs-render-main');
    const alpha = root.getByRole('tab', { name: 'Alpha', exact: true });
    const draft = page.getByRole('textbox', { name: 'alpha render draft', exact: true });
    const originalRoot = await root.elementHandle();
    const originalTab = await alpha.elementHandle();
    const originalDraft = await draft.elementHandle();
    await root.getByRole('button', { name: 'Increment alpha render', exact: true }).click();
    await draft.fill('Retained render draft');
    await draft.evaluate(element => {
      if (!(element instanceof HTMLInputElement)) throw new Error('Expected a native input');
      element.setSelectionRange(2, 9);
    });
    const initialLifecycle = JSON.parse((await page
      .getByLabel('Render Tabs lifecycle', { exact: true }).textContent())!) as string[];

    await toggle(page, 'Update tab bar props');
    await expect(root.locator('.ant-tabs-nav')).toHaveCSS('padding-top', '15px');
    await toggle(page, 'Compact render theme');
    await toggle(page, 'Reverse render items');

    await expect(root.getByRole('tab')).toHaveText(['Locked', 'Beta', 'Alpha']);
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Retained render draft');
    await expect(page.getByLabel('alpha render count', { exact: true })).toHaveText('1');
    expect(await draft.evaluate(element => {
      if (!(element instanceof HTMLInputElement)) throw new Error('Expected a native input');
      return [element.selectionStart, element.selectionEnd];
    })).toEqual([2, 9]);
    expect(await root.evaluate((element, previous) => element === previous, originalRoot))
      .toBe(true);
    expect(await alpha.evaluate((element, previous) => element === previous, originalTab))
      .toBe(true);
    expect(await draft.evaluate((element, previous) => element === previous, originalDraft))
      .toBe(true);
    expect(await page.locator('#tabs-render-form').evaluate(element =>
      new FormData(element as HTMLFormElement).get('alpha'))).toBe('Retained render draft');
    const attached = JSON.parse((await page.getByLabel('Render Tabs attachments', { exact: true })
      .textContent())!) as string[];
    expect(attached.toSorted()).toEqual(['attach:alpha', 'attach:beta', 'attach:locked']);
    await expect(page.getByLabel('Render Tabs trace', { exact: true })).toHaveText('[]');

    await toggle(page, 'Mount render Tabs');

    await expect(root).toHaveCount(0);
    await expect.poll(async () => JSON.parse((await page
      .getByLabel('Render Tabs attachments', { exact: true }).textContent())!).toSorted())
      .toEqual([
        'attach:alpha', 'attach:beta', 'attach:locked',
        'detach:alpha', 'detach:beta', 'detach:locked'
      ]);
    await expect(page.getByLabel('Render Tabs lifecycle', { exact: true }))
      .toHaveText(JSON.stringify([...initialLifecycle, 'destroy:alpha']));
  });

test('replacing the renderer retains panel instances and the public root ref', async ({ page }) => {
  await page.getByLabel('Tabs render reference', { exact: true }).selectOption('node-attributes');
  const draft = page.getByRole('textbox', { name: 'alpha render draft', exact: true });
  const original = await draft.elementHandle();
  await page.getByRole('button', { name: 'Increment alpha render', exact: true }).click();
  await draft.fill('Renderer replacement draft');
  const initialLifecycle = await page.getByLabel('Render Tabs lifecycle', { exact: true })
    .textContent();

  await toggle(page, 'Use custom tab bar');

  await expect(page.locator('[data-render-key]')).toHaveCount(0);
  await expect(draft).toBeFocused();
  await toggle(page, 'Use custom tab bar');

  await expect(page.locator('[data-render-key]')).toHaveCount(3);
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Renderer replacement draft');
  expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
  await expect(page.getByLabel('alpha render count', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Render Tabs native root', { exact: true }))
    .toHaveText('tabs-render-main');
  await expect(page.getByLabel('Render Tabs lifecycle', { exact: true }))
    .toHaveText(initialLifecycle!);
});

for (const key of ['alpha', 'locked']) test(
  `sortable wrapper ${key} retains focus and its own keys through keyed moves`,
  async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true }).selectOption('node-attributes');
    const wrapper = page.locator(`#tabs-render-main [data-render-key="${key}"]`);
    const original = await wrapper.elementHandle();
    await page.locator('#tabs-render-main').getByRole('tab', { name: 'Alpha', exact: true }).focus();
    await wrapper.focus();

    await expect(page.locator('#tabs-render-main [data-render-key="alpha"]'))
      .not.toHaveClass(/ant-tabs-tab-focus/);

    await page.keyboard.press('ArrowRight');

    await expect(wrapper).toBeFocused();
    await toggle(page, 'Reverse render items');

    await expect(wrapper).toBeFocused();
    expect(await wrapper.evaluate((element, previous) => element === previous, original))
      .toBe(true);
    await expect(page.getByLabel('Render Tabs trace', { exact: true })).toHaveText('[]');
  });

test('custom keyboard callbacks preserve the public MouseEvent, modifiers and cancellation',
  async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true }).selectOption('manual-bar');
    await toggle(page, 'Keyboard custom activation');
    await toggle(page, 'Cancel custom activation');
    const beta = page.locator('#tabs-render-main').getByRole('tab', { name: 'Beta', exact: true });
    await beta.focus();

    await beta.press('Control+F2');

    await expect(beta).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByLabel('Render Tabs trace', { exact: true }))
      .toHaveText('["click:beta"]');
    await expect(page.getByLabel('Render Tabs click events', { exact: true }))
      .toHaveText(JSON.stringify([
        {
          mouse: true,
          type: 'click',
          target: 'Beta',
          currentTarget: 'Beta',
          ctrlKey: true,
          controlState: true
        }
      ]));
    await expect(page.getByLabel('Render Tabs keyboard events', { exact: true }))
      .toHaveText('[{"prevented":true,"stopped":true}]');

    await toggle(page, 'Cancel custom activation');
    await beta.press('F2');

    await expect(beta).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Render Tabs trace', { exact: true }))
      .toHaveText('["click:beta","click:beta","change:beta"]');
    await expect(page.getByLabel('Render Tabs keyboard events', { exact: true }))
      .toHaveText('[{"prevented":true,"stopped":true},{"prevented":false,"stopped":false}]');
  });

test('default bar overrides drive native direction and orientation without changing root layout',
  async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true }).selectOption('bar-rtl');
    const root = page.locator('#tabs-render-main');
    await root.getByRole('tab', { name: 'Alpha', exact: true }).focus();

    await page.keyboard.press('ArrowLeft');

    await expect(root.getByRole('tab', { name: 'Beta', exact: true })).toBeFocused();
    await expect(root).toHaveAttribute('dir', 'ltr');
    await expect(root.getByRole('tab', { name: 'Alpha', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    await page.getByLabel('Tabs render reference', { exact: true })
      .selectOption('bar-physical-position');
    await root.getByRole('tab', { name: 'Alpha', exact: true }).focus();
    await page.keyboard.press('ArrowDown');

    await expect(root.getByRole('tab', { name: 'Beta', exact: true })).toBeFocused();
    await expect(root.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await expect(root).toHaveClass(/ant-tabs-top/);
    await expect(page.getByLabel('Render Tabs trace', { exact: true })).toHaveText('[]');
  });

test('editable overrides own add and remove requests while Tabs retains items and selection',
  async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true }).selectOption('add-editable');
    const root = page.locator('#tabs-render-main');
    await root.getByRole('button', { name: 'Add tab', exact: true }).click();
    await root.getByRole('tab', { name: 'Beta', exact: true }).focus();

    await page.keyboard.press('Delete');

    await expect(page.getByLabel('Render Tabs trace', { exact: true }))
      .toHaveText('["edit:add:click","edit:remove:beta"]');
    await expect(root.getByRole('tab')).toHaveCount(3);
    await expect(root.getByRole('tab', { name: 'Alpha', exact: true })).toBeFocused();
    await expect(root.getByRole('tab', { name: 'Alpha', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
  });

test('updating an open custom bar retains More and scroll and uses the latest scroll callback',
  async ({ page }) => {
    await page.getByLabel('Tabs render reference', { exact: true }).selectOption('more-popup');
    await toggle(page, 'Observe custom scroll');
    const root = page.locator('#tabs-render-main');
    await root.getByRole('tab', { name: 'Tab 10', exact: true }).focus();
    const more = root.getByRole('button', { name: 'CUSTOM MORE', exact: true });
    await more.focus();
    await more.press('ArrowDown');
    const popup = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
    await expect(popup).toBeVisible();
    // ResizeObserver завершает перенос Add и пересчёт допустимого scroll до исходного замера.
    await page.evaluate(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
    const original = await popup.elementHandle();
    const scroll = await root.locator('.ant-tabs-nav-wrap').evaluate(element => element.scrollLeft);

    await toggle(page, 'Update tab bar props');

    await expect(more).toBeFocused();
    await expect(popup).toBeVisible();
    expect(await popup.evaluate((element, previous) => element === previous, original)).toBe(true);
    await expect.poll(() => root.locator('.ant-tabs-nav-wrap')
      .evaluate(element => element.scrollLeft)).toBe(scroll);
    await root.getByRole('tab', { name: 'Alpha', exact: true }).focus();

    await expect(page.getByLabel('Render Tabs scrolls', { exact: true })).toContainText('new:left');
    await expect(page.getByLabel('Render Tabs trace', { exact: true })).toHaveText('[]');
    await toggle(page, 'Mount render Tabs');

    await expect(page.locator('.ant-tabs-dropdown')).toHaveCount(0);
  });
