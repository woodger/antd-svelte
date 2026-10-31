import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';

type ResizeEvent = { event: string; sizes?: number[]; collapsed?: boolean[]; index?: number; };
const root = (page: Page) => page.locator('.fixture-splitter');
const panels = (page: Page) => root(page).locator(':scope > .ant-splitter-panel');
const separator = (page: Page, index = 0) => root(page).getByRole('separator').nth(index);
const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const events = async (page: Page): Promise<ResizeEvent[]> =>
  JSON.parse((await control(page, 'Splitter events').textContent())!);

async function expectSizes(page: Page, values: number[]) {
  await expect(panels(page)).toHaveCount(values.length);

  for (const [index, size] of values.entries())
    await expect(panels(page).nth(index)).toHaveCSS('flex-basis', `${size}px`);
}

async function startMouse(page: Page, index = 0, vertical = false) {
  const bar = separator(page, index);
  await bar.scrollIntoViewIfNeeded();
  const box = (await bar.boundingBox())!;
  // Кнопки сворачивания перекрывают середину; drag проверяется на свободном участке.
  const point = {
    x: box.x + box.width * (vertical ? 0.25 : 0.5),
    y: box.y + box.height * (vertical ? 0.5 : 0.25)
  };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();

  return point;
}

async function drag(page: Page, offset: number, index = 0, vertical = false) {
  const point = await startMouse(page, index, vertical);
  await page.mouse.move(point.x + (vertical ? 0 : offset), point.y + (vertical ? offset : 0));
  await page.mouse.up();
}

async function pseudoColor(element: Locator) {
  return element.evaluate(node => getComputedStyle(node, '::before').backgroundColor);
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-01T12:00:00Z'));
  await page.goto('/?fixture=splitter');
  await expectSizes(page, [300, 300]);
});

test(
  'Splitter resizes from the initial pointer position and clears the viewport mask',
  async ({ page }) => {
    await expect(separator(page)).toHaveAttribute('aria-orientation', 'vertical');
    await expect(separator(page)).toHaveAttribute('aria-valuenow', '50');
    await expect(separator(page)).toHaveAttribute('aria-valuemin', '0');
    await expect(separator(page)).toHaveAttribute('aria-valuemax', '100');
    await expect(control(page, 'Splitter ref')).toHaveText('DIV');
    const point = await startMouse(page);

    await expect(root(page).locator('.ant-splitter-mask')).toHaveCSS('position', 'fixed');
    await expect(separator(page)).toHaveClass(/context-dragger-active.*local-dragger-active/);
    await expect(separator(page)).toHaveCSS('outline-offset', '2px');
    await page.mouse.move(point.x + 100, point.y);

    await expectSizes(page, [400, 200]);
    await page.mouse.move(point.x + 50, point.y);

    await expectSizes(page, [350, 250]);
    await page.mouse.up();

    await expect(root(page).locator('.ant-splitter-mask')).toHaveCount(0);
    await expect(separator(page)).not.toHaveClass(/ant-splitter-bar-dragger-active/);
    expect(await events(page)).toEqual([
      { event: 'start', sizes: [300, 300] },
      { event: 'resize', sizes: [400, 200] },
      { event: 'resize', sizes: [350, 250] },
      { event: 'end', sizes: [350, 250] }
    ]);
  }
);

test(
  'Splitter clamps pixel and percentage limits and normalizes after a container resize',
  async ({ page }) => {
    await select(page, 'Splitter limits').selectOption('limited');

    await expect(separator(page)).toHaveAttribute('aria-valuemin', '20');
    await expect(separator(page)).toHaveAttribute('aria-valuemax', '70');
    await drag(page, 250);

    await expectSizes(page, [420, 180]);
    await drag(page, -500);

    await expectSizes(page, [120, 480]);
    await page.getByRole('button', { name: 'Resize Splitter root', exact: true }).click();

    await expect(root(page)).toHaveCSS('width', '480px');
    await expectSizes(page, [120, 360]);
  }
);

test('Splitter reads defaults once and adopts controlled drag proposals', async ({ page }) => {
  await control(page, 'Change Splitter defaults').check();

  await expectSizes(page, [300, 300]);
  await select(page, 'Splitter state').selectOption('controlled');
  await drag(page, 80);

  await expectSizes(page, [380, 220]);
  expect((await events(page)).at(-1)).toEqual({
    event: 'end', sizes: [380, expect.closeTo(220, 10)]
  });
});

test(
  'Splitter keeps rejected controlled geometry and retains the proposal after control is released',
  async ({ page }) => {
    await select(page, 'Splitter state').selectOption('rejected');
    await drag(page, 90);

    await expectSizes(page, [300, 300]);
    expect(await events(page)).toEqual([
      { event: 'start', sizes: [300, 300] },
      { event: 'resize', sizes: [390, 210] },
      { event: 'end', sizes: [300, 300] }
    ]);
    await select(page, 'Splitter state').selectOption('local');

    await expectSizes(page, [390, 210]);
  }
);

test(
  'Splitter treats a single controlled panel as control of the whole group',
  async ({ page }) => {
    await select(page, 'Splitter preset').selectOption('three');
    await select(page, 'Splitter state').selectOption('first');
    await control(page, 'Change Splitter defaults').check();

    await expectSizes(page, [100, 250, 250]);
    await drag(page, 50);

    await expectSizes(page, [150, 225, 225]);
    expect((await events(page)).at(-2)).toEqual({ event: 'resize', sizes: [150, 200, 250] });
    expect((await events(page)).at(-1)).toEqual({ event: 'end', sizes: [150, 225, 225] });
  }
);

test('Splitter lazy previews within limits and commits once on release', async ({ page }) => {
  await control(page, 'Lazy Splitter').check();
  await select(page, 'Splitter limits').selectOption('limited');
  const point = await startMouse(page);
  await page.mouse.move(point.x + 250, point.y);
  const preview = root(page).locator('.ant-splitter-bar-preview');

  await expectSizes(page, [300, 300]);
  await expect(preview).toHaveClass(/ant-splitter-bar-preview-active/);
  await expect(preview).toHaveCSS('--ant-splitter-bar-preview-offset', '120px');
  expect(await events(page)).toEqual([{ event: 'start', sizes: [300, 300] }]);
  await page.mouse.up();

  await expectSizes(page, [420, 180]);
  await expect(preview).not.toHaveClass(/ant-splitter-bar-preview-active/);
  expect(await events(page)).toEqual([
    { event: 'start', sizes: [300, 300] },
    { event: 'end', sizes: [420, 180] }
  ]);
});

test(
  'Splitter lazy reports a rejected proposal on release without changing controlled panels',
  async ({ page }) => {
    await control(page, 'Lazy Splitter').check();
    await select(page, 'Splitter state').selectOption('rejected');
    await drag(page, 70);

    await expectSizes(page, [300, 300]);
    expect((await events(page)).at(-1)).toEqual({ event: 'end', sizes: [370, 230] });
    await select(page, 'Splitter state').selectOption('controlled');
    await drag(page, -40);

    await expectSizes(page, [260, 340]);
  }
);

test(
  'Splitter mirrors normal horizontal offsets in RTL and retains pinned lazy constraint order',
  async ({ page }) => {
    await control(page, 'Right to left').check();

    await expect(root(page)).toHaveClass(/ant-splitter-rtl/);
    await expect(root(page)).toHaveCSS('direction', 'rtl');
    const first = (await panels(page).nth(0).boundingBox())!;
    const second = (await panels(page).nth(1).boundingBox())!;
    expect(first.x).toBeGreaterThan(second.x);
    await drag(page, 60);

    await expectSizes(page, [240, 360]);
    await select(page, 'Splitter preset').selectOption('half');
    await select(page, 'Splitter limits').selectOption('limited');
    await control(page, 'Lazy Splitter').check();
    const point = await startMouse(page);
    await page.mouse.move(point.x + 250, point.y);

    await expect(root(page).locator('.ant-splitter-bar-preview'))
      .toHaveCSS('--ant-splitter-bar-preview-offset', '120px');
    await page.mouse.up();

    await expectSizes(page, [180, 420]);
  }
);

test('Splitter vertical drag uses heights independently of inherited RTL', async ({ page }) => {
  await select(page, 'Splitter orientation').selectOption('vertical');
  await control(page, 'Right to left').check();

  await expect(root(page)).toHaveClass(/ant-splitter-vertical/);
  await expect(separator(page)).toHaveAttribute('aria-orientation', 'horizontal');
  await drag(page, 80, 0, true);

  await expectSizes(page, [380, 220]);
  await expect(panels(page).nth(0)).toHaveCSS('height', '380px');
  await expect(panels(page).nth(0)).toHaveCSS('width', '600px');
});

test(
  'Splitter collapses and restores cached sizes with native Enter and Space buttons',
  async ({ page }) => {
    await select(page, 'Splitter preset').selectOption('uneven');
    const draft = control(page, 'Splitter first draft');
    await draft.fill('Retained draft');
    const start = root(page).getByRole('button', { name: 'Toggle start panel', exact: true });
    await expect(start).toHaveAttribute('type', 'button');
    await start.focus();
    await page.keyboard.press('Enter');

    await expectSizes(page, [0, 600]);
    await expect(panels(page).nth(0)).toHaveClass(/ant-splitter-panel-hidden/);
    await expect(draft).toHaveCount(1);
    expect(await events(page)).toEqual([
      { event: 'resize', sizes: [0, 600] },
      { event: 'end', sizes: [0, 600] },
      { event: 'collapse', sizes: [0, 600], collapsed: [true, false] }
    ]);
    const end = root(page).getByRole('button', { name: 'Toggle end panel', exact: true });
    await end.focus();
    await page.keyboard.press('Space');

    await expectSizes(page, [200, 400]);
    await expect(draft).toHaveValue('Retained draft');
    expect((await events(page)).map(event => event.event))
      .toEqual(['resize', 'end', 'collapse', 'resize', 'end', 'collapse']);
  }
);

test('Splitter rechecks limits before expanding a collapsed panel', async ({ page }) => {
  await root(page).getByRole('button', { name: 'Toggle start panel', exact: true }).click();
  await select(page, 'Splitter limits').selectOption('changed');
  await root(page).getByRole('button', { name: 'Toggle end panel', exact: true }).click();

  await expectSizes(page, [200, 400]);
  expect((await events(page)).at(-1)?.collapsed).toEqual([false, false]);
});

test(
  'Splitter destroyOnHidden removes content while a panel override retains its draft',
  async ({ page }) => {
    await control(page, 'Destroy Splitter hidden content').check();
    await control(page, 'Retain Splitter first content').check();
    const first = control(page, 'Splitter first draft');
    await first.fill('Keep');
    await root(page).getByRole('button', { name: 'Toggle start panel', exact: true }).click();

    await expect(first).toHaveCount(1);
    await control(page, 'Retain Splitter first content').uncheck();

    await expect(first).toHaveCount(0);
    await root(page).getByRole('button', { name: 'Toggle end panel', exact: true }).click();

    await expect(first).toHaveValue('');
  }
);

test(
  'Splitter uses physical collapse directions in RTL and does not translate source button labels',
  async ({ page }) => {
    await control(page, 'Right to left').check();
    await control(page, 'English locale').check();
    await root(page).getByRole('button', { name: 'Toggle start panel', exact: true }).click();

    await expectSizes(page, [600, 0]);
    await control(page, 'English locale').uncheck();

    await expect(root(page).getByRole('button', { name: 'Toggle end panel', exact: true }))
      .toBeVisible();
  }
);

test('Splitter preserves source directional and hover collapse visibility', async ({ page }) => {
  await select(page, 'Splitter collapse visibility').selectOption('directional');

  await expect(root(page).getByRole('button', { name: 'Toggle start panel', exact: true }))
    .toHaveCount(0);
  await expect(root(page).getByRole('button', { name: 'Toggle end panel', exact: true }))
    .toHaveClass(/hover-only/);
  await select(page, 'Splitter collapse visibility').selectOption('hidden');

  await expect(root(page).locator('.ant-splitter-bar-collapse-bar')).toHaveCount(2);
  await expect(root(page).locator('.ant-splitter-bar-collapse-bar').first())
    .toHaveClass(/always-hidden/);
  await expect(root(page).locator('.ant-splitter-bar-collapse-bar').first())
    .toHaveCSS('display', 'none');
  await select(page, 'Splitter collapse visibility').selectOption('off');

  await expect(root(page).locator('.ant-splitter-bar-collapse-bar')).toHaveCount(0);
});

test(
  'Splitter disables drag independently of collapse and still reports double click',
  async ({ page }) => {
    await control(page, 'Resizable Splitter').uncheck();

    await expect(separator(page)).toHaveAttribute('aria-disabled', 'true');
    await drag(page, 60);

    await expectSizes(page, [300, 300]);
    expect(await events(page)).toEqual([]);
    await separator(page).dispatchEvent('dblclick');

    expect(await events(page)).toEqual([{ event: 'double', index: 0 }]);
    await root(page).getByRole('button', { name: 'Toggle start panel', exact: true }).click();

    await expectSizes(page, [0, 600]);
  }
);

test(
  'Splitter searches left through coincident zero panels on the first negative offset',
  async ({ page }) => {
    await select(page, 'Splitter preset').selectOption('overlap');
    await separator(page, 1).dispatchEvent('mousedown', { clientX: 300, clientY: 500 });
    await page.evaluate(() => window.dispatchEvent(new MouseEvent('mousemove', {
      clientX: 260, clientY: 500
    })));

    await expectSizes(page, [260, 40, 300]);
    await expect(separator(page, 0)).toHaveClass(/ant-splitter-bar-dragger-active/);
    await page.evaluate(() => window.dispatchEvent(new MouseEvent('mouseup')));

    expect((await events(page)).at(-1)).toEqual({ event: 'end', sizes: [260, 40, 300] });
  }
);

test(
  'Splitter preserves semantic and geometry priorities and replaces nested config',
  async ({ page }) => {
    await expect(root(page)).toHaveClass(/context-horizontal local-horizontal splitter-context/);
    await expect(root(page)).toHaveCSS('outline-offset', '4px');
    await expect(panels(page).nth(0)).toHaveClass(/context-panel local-panel splitter-item-0/);
    await control(page, 'Styled Splitter').check();

    await expect(root(page)).toHaveCSS('outline-offset', '8px');
    await expect(panels(page).nth(0)).toHaveCSS('outline-offset', '3px');
    await expect(panels(page).nth(0)).toHaveCSS('flex-grow', '0');
    await expectSizes(page, [300, 300]);
    const point = await startMouse(page);

    await expect(separator(page)).toHaveCSS('outline-offset', '4px');
    await page.mouse.move(point.x + 20, point.y);
    await page.mouse.up();
    await control(page, 'Styled Splitter').uncheck();
    await control(page, 'Replace Splitter config').check();

    await expect(root(page)).toHaveClass(/nested-splitter-context/);
    await expect(root(page)).not.toHaveClass(/(?:^| )splitter-context(?: |$)/);
    await expect(root(page)).not.toHaveClass(/context-horizontal/);
    await expect(root(page)).toHaveCSS('outline-offset', '0px');
    await expect(panels(page).nth(0)).not.toHaveClass(/context-panel/);
  }
);

test(
  'Splitter keeps explicit empty icons and gives the new icon object precedence over legacy',
  async ({ page }) => {
    const start = root(page).getByRole('button', { name: 'Toggle start panel', exact: true });
    await expect(start.locator('svg')).toHaveAttribute('viewBox', '64 64 896 896');
    await select(page, 'Splitter icons').selectOption('custom');

    await expect(separator(page).locator('[data-icon="dragger"]')).toHaveText('Drag');
    await expect(start.locator('[data-icon="collapse"]')).toHaveText('Collapse');
    await expect(root(page).getByRole('button', { name: 'Toggle end panel', exact: true }))
      .toHaveText('');
    await select(page, 'Splitter icons').selectOption('empty');

    await expect(separator(page)).toHaveClass(/ant-splitter-bar-dragger-customize/);
    await expect(separator(page).locator('.ant-splitter-bar-dragger-icon')).toHaveText('');
    await expect(start).toHaveText('');
    await expect(start.locator('svg')).toHaveCount(0);
    await select(page, 'Splitter icons').selectOption('legacy');

    await expect(start.locator('[data-icon="legacy"]')).toHaveText('Legacy');
    await select(page, 'Splitter icons').selectOption('empty-new');

    await expect(start.locator('[data-icon="legacy"]')).toHaveCount(0);
    await expect(start.locator('svg')).toHaveCount(1);
  }
);

test(
  'Splitter turns collapse motion off during drag and honors reduced motion',
  async ({ page }) => {
    await control(page, 'Animated Splitter collapse').check();

    await expect(panels(page).nth(0)).toHaveCSS('transition-property', 'flex-basis');
    const point = await startMouse(page);

    await expect(panels(page).nth(0)).not.toHaveClass(/ant-splitter-panel-transition/);
    await page.mouse.move(point.x + 30, point.y);
    await page.mouse.up();

    await expect(panels(page).nth(0)).toHaveClass(/ant-splitter-panel-transition/);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await expect(panels(page).nth(0)).toHaveCSS('transition-property', 'none');
  }
);

test(
  'Splitter inherits dark tokens without disabling native content or making the separator focusable',
  async ({ page }) => {
    const light = await pseudoColor(separator(page));
    await control(page, 'Dark Splitter').check();
    await control(page, 'Disable all components').check();
    await page.mouse.move(0, 0);

    await expect(root(page)).toHaveCSS('color-scheme', 'dark');
    expect(await pseudoColor(separator(page))).not.toBe(light);
    await expect(control(page, 'Splitter first draft')).toBeEnabled();
    expect(await separator(page).evaluate(node => (node as HTMLElement).tabIndex)).toBe(-1);
    await control(page, 'Splitter first draft').focus();
    await page.keyboard.press('ArrowRight');

    await expectSizes(page, [300, 300]);
    await page.getByRole('button', { name: 'Splitter content action', exact: true }).click();

    expect(await events(page)).toEqual([{ event: 'action' }]);
  }
);

test(
  'Splitter retains the last measured size while hidden and releases ref and listeners on unmount',
  async ({ page }) => {
    await control(page, 'Hide Splitter root').check();

    await expect(root(page)).toBeHidden();
    await expectSizes(page, [300, 300]);
    await control(page, 'Hide Splitter root').uncheck();
    const point = await startMouse(page);
    // Удаление выполняется без mouseup: поздние window-события не должны завершить старый drag.
    await control(page, 'Mount Splitter').evaluate((element: HTMLInputElement) => element.click());

    await expect(root(page)).toHaveCount(0);
    await expect(control(page, 'Splitter ref')).toHaveText('none');
    await page.mouse.move(point.x + 100, point.y);
    await page.mouse.up();

    expect(await events(page)).toEqual([{ event: 'start', sizes: [300, 300] }]);
    await control(page, 'Mount Splitter').check();

    await expectSizes(page, [300, 300]);
    await expect(control(page, 'Splitter ref')).toHaveText('DIV');
  }
);

test.describe('Splitter touch', () => {
  test.use({ hasTouch: true });

  test(
    'Splitter tracks one touch on the vertical axis and ignores multi-touch movement',
    async ({ page }) => {
      await select(page, 'Splitter orientation').selectOption('vertical');
      await separator(page).evaluate(node => {
        const touch = new Touch({ identifier: 1, target: node, pageX: 100, pageY: 300 });
        node.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], bubbles: true }));
      });
      await page.evaluate(() => {
        const touches = [1, 2].map(identifier => new Touch({
          identifier, target: document.body, pageX: 100, pageY: 400
        }));
        window.dispatchEvent(new TouchEvent('touchmove', { touches }));
      });

      await expectSizes(page, [300, 300]);
      await page.evaluate(() => {
        const touch = new Touch({ identifier: 1, target: document.body, pageX: 100, pageY: 360 });
        window.dispatchEvent(new TouchEvent('touchmove', { touches: [touch] }));
        window.dispatchEvent(new TouchEvent('touchend', { touches: [] }));
      });

      await expectSizes(page, [360, 240]);
      expect(await events(page)).toEqual([
        { event: 'start', sizes: [300, 300] },
        { event: 'resize', sizes: [360, 240] },
        { event: 'end', sizes: [360, 240] }
      ]);
    }
  );
});
