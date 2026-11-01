import { test, expect } from './test';
import type { Page } from '@playwright/test';

const popup = (page: Page) => page.locator('.ant-tour');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const events = (page: Page) => control(page, 'Tour events');

async function ownerClick(page: Page, name: string) {
  await control(page, name).evaluate((element: HTMLInputElement) => element.click());
}

async function ownerButton(page: Page, name: string) {
  await button(page, name).evaluate((element: HTMLButtonElement) => element.click());
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tour');
  await expect(page.locator('#tour-fixture')).toBeVisible();
});

test('Tour opens a body portal with a target hole, steps and finish callbacks', async ({ page }) => {
  await expect(popup(page)).toHaveCount(0);
  await button(page, 'Open Tour owner').click();
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
  await expect(page.locator('.ant-tour-mask mask rect')).toHaveCount(2);
  await button(page, 'Далее').click();
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
  await button(page, 'Далее').click();
  await expect(button(page, 'Завершить')).toBeVisible();
  await button(page, 'Завершить').click();

  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).toContainText('close:2|finish|next:false:BUTTON');
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(0);
});

test('Tour permits target pointer interaction and leaves panel inputs editable', async ({ page }) => {
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toBeVisible();
  await button(page, 'Tour first target').click();
  await expect(control(page, 'Tour target hits')).toHaveText('1');
  await control(page, 'Tour editable').fill('Native draft');
  await control(page, 'Tour editable').press('ArrowRight');

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
  await expect(control(page, 'Tour editable')).toHaveValue('Native draft');
  await control(page, 'Tour editable').press('Escape');
  await expect(popup(page)).toHaveCount(0);
});

test('Tour centers without a target and uses keyboard step navigation', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tour target', exact: true }).selectOption('center');
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toBeVisible();
  await expect(popup(page).locator('.ant-tour-arrow')).toHaveCount(0);
  await page.keyboard.press('ArrowRight');
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
  await page.keyboard.press('ArrowLeft');
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
});

test('Tour remains interactive inside the native Modal and Escape leaves the modal open', async ({ page }) => {
  await button(page, 'Open Tour modal').click();
  await button(page, 'Start modal Tour').click();
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Modal tour title');
  await expect(button(page, 'Завершить')).toBeEnabled();
  await button(page, 'Завершить').focus();
  await page.keyboard.press('Escape');

  await expect(popup(page)).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Tour modal', exact: true })).toBeVisible();
});

test('Tour preserves controlled current rejection and external replacement', async ({ page }) => {
  await control(page, 'Tour controlled current').check();
  await control(page, 'Accept Tour changes').uncheck();
  await button(page, 'Open Tour owner').click();
  await button(page, 'Далее').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
  await expect(events(page)).toContainText('change:1|next:false:BUTTON');
  await ownerButton(page, 'Set Tour owner current');
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 3');
});

test('Tour remains interactive inside a native Drawer without closing its parent', async ({ page }) => {
  await button(page, 'Open Tour drawer').click();
  await button(page, 'Start drawer Tour').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Drawer tour title');
  await button(page, 'Завершить').click();

  await expect(popup(page)).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Tour drawer', exact: true })).toBeVisible();
});

test('Tour closes every open instance on Escape and releases their independent locks', async ({ page }) => {
  await control(page, 'Tour duplicate').check();
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toHaveCount(2);
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(4);

  await page.keyboard.press('Escape');

  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).toContainText('duplicate-close');
  await expect(events(page)).toContainText('close:0');
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(0);
});

test('Tour preserves controlled close rejection and finish callback order', async ({ page }) => {
  await control(page, 'Tour count').fill('1');
  await control(page, 'Accept Tour changes').uncheck();
  await button(page, 'Open Tour owner').click();
  await button(page, 'Завершить').click();

  await expect(popup(page)).toBeVisible();
  await expect(events(page)).toContainText('close:0|finish|next:false:BUTTON');
  await button(page, 'Закрыть').click();
  await expect(popup(page)).toBeVisible();
  await expect(events(page)).toContainText('next:false:BUTTON|close:0');
});

test('Tour defaults open when controlled open is released and defaultOpen stays initial', async ({ page }) => {
  await button(page, 'Release Tour owner open').click();
  await expect(popup(page)).toBeVisible();
  await button(page, 'Закрыть').click();
  await expect(popup(page)).toHaveCount(0);

  await control(page, 'Tour default open').check();

  await expect(popup(page)).toHaveCount(0);
});

test('Tour resets an uncontrolled step to zero when it reopens', async ({ page }) => {
  await button(page, 'Open Tour owner').click();
  await button(page, 'Далее').click();
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
  await button(page, 'Закрыть').click();
  await button(page, 'Open Tour owner').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
});

test('Tour keeps initial defaultCurrent and closes when the active index leaves the collection', async ({ page }) => {
  await control(page, 'Mount Tour').uncheck();
  await control(page, 'Tour default current').fill('2');
  await control(page, 'Tour default open').check();
  await control(page, 'Tour controlled open').uncheck();
  await control(page, 'Mount Tour').check();
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 3');

  await control(page, 'Tour count').fill('1');

  await expect(popup(page)).toHaveCount(0);
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(0);
});

test('Tour masks outside clicks without dismissing and disables the highlighted interaction', async ({ page }) => {
  await control(page, 'Tour disabled interaction').check();
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toBeVisible();
  const target = await button(page, 'Tour first target').boundingBox();
  await page.mouse.click(target!.x + target!.width / 2, target!.y + target!.height / 2);

  await expect(control(page, 'Tour target hits')).toHaveText('0');
  await expect(popup(page)).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(popup(page)).toBeVisible();
});

test('Tour without a mask keeps the outside page interactive and still locks body scroll', async ({ page }) => {
  await control(page, 'Tour mask').uncheck();
  await button(page, 'Open Tour owner').click();

  await expect(page.locator('.ant-tour-mask svg')).toHaveCount(0);
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(2);
  await control(page, 'Tour custom locale').check();
  await expect(button(page, 'Continue')).toBeVisible();
});

test('Tour lets false closable disable Escape while arrow navigation remains available', async ({ page }) => {
  await control(page, 'Tour closable').uncheck();
  await button(page, 'Open Tour owner').click();
  await expect(button(page, 'Закрыть')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(popup(page)).toBeVisible();
  await page.keyboard.press('ArrowRight');

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
});

test('Tour disables keyboard shortcuts without disabling native buttons', async ({ page }) => {
  await control(page, 'Tour keyboard').uncheck();
  await button(page, 'Open Tour owner').click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
  await button(page, 'Далее').click();
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
});

test('Tour protects an IME Escape and the two hundred millisecond composition tail', async ({ page }) => {
  const time = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toBeVisible();
  await page.locator('body').dispatchEvent('keydown', { key: 'Escape', isComposing: true });
  await expect(popup(page)).toBeVisible();
  await page.locator('body').dispatchEvent('compositionend');
  await page.keyboard.press('Escape');
  await page.clock.runFor(199);
  await page.keyboard.press('Escape');
  await expect(popup(page)).toBeVisible();

  await page.clock.runFor(1);
  await page.keyboard.press('Escape');

  await expect(popup(page)).toHaveCount(0);
});

test('Tour step close and finish callbacks override the root panel actions', async ({ page }) => {
  await control(page, 'Tour count').fill('1');
  await control(page, 'Tour step callbacks').check();
  await button(page, 'Open Tour owner').click();
  await button(page, 'Закрыть').click();
  await expect(popup(page)).toBeVisible();
  await expect(events(page)).toContainText('step-close');
  await button(page, 'Завершить').click();
  await expect(events(page)).toContainText('step-finish|next:false:BUTTON');

  await page.keyboard.press('Escape');

  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).toContainText('close:0');
});

test('Tour renders cover, zero title and a custom close icon', async ({ page }) => {
  await control(page, 'Tour cover').check();
  await control(page, 'Tour zero title').check();
  await control(page, 'Tour custom close icon').check();
  await button(page, 'Open Tour owner').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('0');
  await expect(page.getByRole('img', { name: 'Tour cover' })).toBeVisible();
  await expect(button(page, 'Закрыть')).toHaveText('Exit');
});

test('Tour passes original actions into custom renderers and preserves native button events', async ({ page }) => {
  await control(page, 'Tour custom renderers').check();
  await control(page, 'Tour custom locale').check();
  await control(page, 'Tour source locale alias').check();
  await button(page, 'Open Tour owner').click();

  await expect(popup(page).locator('.custom-indicators')).toHaveText('1/3');
  await expect(button(page, 'Forward custom')).toHaveClass(/custom-next/);
  await button(page, 'Forward custom').click({ modifiers: ['Control'] });
  await expect(events(page)).toContainText('change:1|next:true:BUTTON');
  await expect(popup(page).locator('.custom-indicators')).toHaveText('2/3');
  await button(page, 'Skip 2').click();
  await expect(popup(page)).toHaveCount(0);
});

test('Tour keeps source locale aliases above component locale fields', async ({ page }) => {
  await control(page, 'Tour custom locale').check();
  await control(page, 'Tour source locale alias').check();
  await button(page, 'Open Tour owner').click();

  await expect(button(page, 'Source next')).toBeVisible();
  await button(page, 'Source next').click();
  await expect(button(page, 'Back')).toBeVisible();
  await button(page, 'Source next').click();
  await expect(button(page, 'Done')).toBeVisible();
});

test('Tour keeps a stable description snippet and its native draft across steps', async ({ page }) => {
  await button(page, 'Open Tour owner').click();
  await control(page, 'Tour editable').fill('Draft across steps');
  await button(page, 'Далее').click();

  await expect(control(page, 'Tour editable')).toHaveValue('Draft across steps');
});

test('Tour uses a custom step panel and its supplied navigation callback', async ({ page }) => {
  await control(page, 'Tour custom panel').check();
  await button(page, 'Open Tour owner').click();
  await expect(popup(page).locator('.custom-panel')).toContainText('Custom panel 1');
  await button(page, 'Custom next').click();

  await expect(popup(page).locator('.custom-panel')).toContainText('Custom panel 2');
});

test('Tour selects the rc-tour fallback when a step explicitly clears renderPanel', async ({ page }) => {
  await control(page, 'Tour fallback panel').check();
  await button(page, 'Open Tour owner').click();
  await button(page, 'Next').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
  await expect(popup(page).locator('.ant-tour-sliders .active')).toHaveCount(1);
  await button(page, 'Prev').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
  await button(page, 'Close').click();
  await expect(popup(page)).toHaveCount(0);
});

test('Tour merges config root classes and applies style priority to mask', async ({ page }) => {
  await control(page, 'Tour semantic').check();
  await control(page, 'Tour primary').check();
  await button(page, 'Open Tour owner').click();

  await expect(popup(page)).toHaveClass(/provider-tour provider-primary local-root tour-local-class/);
  await expect(page.locator('.ant-tour-mask')).toHaveCSS('color', 'rgb(90, 0, 0)');
  await expect(popup(page).locator('.ant-tour-title')).toHaveClass(/provider-title local-title/);
  await expect(popup(page).locator('.ant-tour-title')).toHaveCSS('font-size', '20px');
  await expect(popup(page)).not.toHaveCSS('color', 'rgb(90, 0, 0)');
});

test('Tour step semantic objects replace panel slots without replacing mask config', async ({ page }) => {
  await control(page, 'Tour semantic').check();
  await control(page, 'Tour step semantic').check();
  await button(page, 'Open Tour owner').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveClass('ant-tour-title step-title');
  await expect(popup(page).locator('.ant-tour-title')).toHaveCSS('color', 'rgb(80, 0, 80)');
  await expect(page.locator('.ant-tour-mask')).toHaveClass(/provider-mask local-mask/);
});

test('Tour uses inline coordinates and leaves body scroll unlocked', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tour container', exact: true }).selectOption('inline');
  await button(page, 'Open Tour owner').click();

  await expect(page.locator('#tour-fixture .ant-tour')).toBeVisible();
  await expect(page.locator('.ant-tour-mask')).toHaveCSS('position', 'absolute');
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(0);
  await expect(page.locator('.ant-tour-mask mask rect:last-child')).toHaveAttribute('x', '394');
  await button(page, 'Закрыть').click();
});

test('Tour mounts custom portals and removes their layers and body locks on unmount', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tour container', exact: true }).selectOption('custom');
  await button(page, 'Open Tour owner').click();
  await expect(page.locator('.portal-container .ant-tour')).toBeVisible();
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(0);

  await ownerClick(page, 'Mount Tour');

  await expect(page.locator('.ant-tour-mask')).toHaveCount(0);
  await expect(page.locator('.ant-tour-target-placeholder')).toHaveCount(0);
  await expect(popup(page)).toHaveCount(0);
});

test('Tour reflects theme changes in body portals and keeps compact source button height', async ({ page }) => {
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  await ownerClick(page, 'Tour dark');
  await expect(popup(page)).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
  await ownerClick(page, 'Tour compact');

  await expect(popup(page)).toHaveCSS('font-size', '12px');
  await expect(popup(page)).toHaveCSS('line-height', '20px');
  await expect(button(page, 'Далее')).toHaveCSS('height', '21px');
});

test('Tour updates gap axes and radius without losing the current native input draft', async ({ page }) => {
  await button(page, 'Open Tour owner').click();
  await control(page, 'Tour editable').fill('Keep draft');
  await control(page, 'Tour gap X').fill('12');
  await control(page, 'Tour gap Y').fill('2');
  await control(page, 'Tour radius').fill('8');

  await expect(page.locator('.ant-tour-mask mask rect:last-child')).toHaveAttribute('rx', '8');
  await expect(control(page, 'Tour editable')).toHaveValue('Keep draft');
  const target = await button(page, 'Tour first target').boundingBox();
  await expect(page.locator('.ant-tour-mask mask rect:last-child')).toHaveAttribute('x', String(target!.x - 12));
  await expect(page.locator('.ant-tour-mask mask rect:last-child')).toHaveAttribute('y', String(target!.y - 2));
});

test('Tour releases keyboard handlers and pending align work after unmount', async ({ page }) => {
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toBeVisible();
  await ownerClick(page, 'Mount Tour');
  await expect(popup(page)).toHaveCount(0);
  const value = await events(page).textContent();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 900, height: 650 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

  await expect(events(page)).toHaveText(value!);
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(0);
  await expect(page.locator('.ant-tour-target-placeholder')).toHaveCount(0);
});

test('Tour changes portal container while open and retains working panel controls', async ({ page }) => {
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toBeVisible();
  await page.getByRole('combobox', { name: 'Tour container', exact: true }).selectOption('inline');
  await expect(page.locator('#tour-fixture .ant-tour')).toBeVisible();
  await expect(page.locator('[data-ant-tour-lock]')).toHaveCount(0);
  await button(page, 'Далее').click();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
  await page.getByRole('combobox', { name: 'Tour container', exact: true }).selectOption('custom');
  await expect(page.locator('.portal-container .ant-tour')).toBeVisible();
  await button(page, 'Закрыть').click();
  await expect(popup(page)).toHaveCount(0);
});

test('Tour keeps the source portal container direction in RTL config', async ({ page }) => {
  await control(page, 'Right to left').check();
  await button(page, 'Open Tour owner').click();

  await expect(popup(page)).toHaveClass(/ant-tour-rtl/);
  await expect(popup(page)).toHaveCSS('direction', 'ltr');
  await page.keyboard.press('ArrowRight');
  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 2');
});

for (const [root, step, expected] of [
  ['false', 'default', '{"block":"center","inline":"center"}'],
  ['end', 'false', 'false']
]) {
  test(`Tour preserves source scroll options with root=${root} and step=${step}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tour root scroll', exact: true }).selectOption(root);
    await page.getByRole('combobox', { name: 'Tour step scroll', exact: true }).selectOption(step);
    const target = button(page, 'Tour first target');
    await target.evaluate(element => {
      element.style.top = '1800px';
      element.scrollIntoView = function (options) {
        this.dataset.scroll = JSON.stringify(options);
        HTMLElement.prototype.scrollIntoView.call(this, options);
      };
    });

    await button(page, 'Open Tour owner').click();

    await expect(target).toHaveAttribute('data-scroll', expected);
    await expect(popup(page)).toBeVisible();
    const bounds = (await target.boundingBox())!;
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  });
}

test('Tour defaultOpen leaves an offscreen target unscrolled without raw open', async ({ page }) => {
  await control(page, 'Mount Tour').uncheck();
  await control(page, 'Tour controlled open').uncheck();
  await control(page, 'Tour default open').check();
  await button(page, 'Tour first target').evaluate(element => {
    element.style.top = '1800px';
    element.scrollIntoView = function () {
      this.dataset.scrolled = 'true';
    };
  });

  await control(page, 'Mount Tour').check();

  await expect(popup(page).locator('.ant-tour-title')).toHaveText('Tour step 1');
  const target = button(page, 'Tour first target');
  expect((await target.boundingBox())!.y).toBeGreaterThan(page.viewportSize()!.height);
  await expect(target).not.toHaveAttribute('data-scrolled');
});

test('Tour remeasures its target hole and flips a popup at the viewport edge', async ({ page }) => {
  await button(page, 'Tour first target').evaluate(element => {
    const parentTop = element.parentElement!.getBoundingClientRect().top;
    element.style.top = `${window.innerHeight - parentTop - 50}px`;
  });

  await button(page, 'Open Tour owner').click();

  await expect(popup(page)).toHaveClass(/ant-tour-placement-top/);
  await button(page, 'Tour first target').evaluate(element => {
    element.style.left = '500px';
    window.dispatchEvent(new Event('resize'));
  });

  const target = (await button(page, 'Tour first target').boundingBox())!;
  await expect(page.locator('.ant-tour-mask mask rect:last-child'))
    .toHaveAttribute('x', String(target.x - 6));
  await expect(popup(page)).toHaveClass(/ant-tour-placement-top/);
});

test('Tour realigns on custom ancestor scrolling and removes its watcher on unmount', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tour container', exact: true }).selectOption('custom');
  const container = page.locator('.portal-container');
  await container.evaluate(element => {
    element.style.cssText = 'width:600px;height:400px;overflow:auto';
    const spacer = document.createElement('div');
    spacer.style.height = '1400px';
    element.append(spacer);
  });
  await button(page, 'Open Tour owner').click();
  await expect(popup(page)).toBeVisible();
  await ownerButton(page, 'Clear Tour events');

  await container.evaluate(element => { element.scrollTop = 100; });

  await expect(events(page)).toContainText('align:bc/tc');
  await expect(popup(page)).toHaveClass(/ant-tour-placement-top/);
  await ownerClick(page, 'Mount Tour');
  await ownerButton(page, 'Clear Tour events');
  await container.evaluate(element => {
    element.scrollTop = 200;
    element.dispatchEvent(new Event('scroll'));
  });
  await page.evaluate(() => new Promise<void>(resolve => queueMicrotask(resolve)));

  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).toBeEmpty();
});

for (const placement of ['top', 'bottom', 'left', 'right', 'topLeft', 'topRight',
  'bottomLeft', 'bottomRight', 'leftTop', 'leftBottom', 'rightTop', 'rightBottom']) {
  test(`Tour aligns ${placement} around the expanded target without viewport overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 2000, height: 1500 });
    await button(page, 'Tour first target').evaluate((element: HTMLElement) => {
      element.style.left = '850px';
      element.style.width = '120px';
      element.style.height = '40px';
    });
    await page.getByRole('combobox', { name: 'Tour placement', exact: true }).selectOption(placement);
    await button(page, 'Open Tour owner').click();
    await expect(popup(page)).toHaveClass(new RegExp(`ant-tour-placement-${placement}(?: |$)`));
    const panel = (await popup(page).boundingBox())!;
    const target = (await button(page, 'Tour first target').boundingBox())!;
    const gap = 18;
    // rc-trigger округляет inset вниз; bottom/right дают обратное округление координаты края.
    if (placement.startsWith('top')) {
      expect(panel.y + panel.height).toBeCloseTo(Math.ceil(target.y - gap), 3);
    }
    if (placement.startsWith('bottom')) {
      expect(panel.y).toBeCloseTo(Math.floor(target.y + target.height + gap), 3);
    }
    if (placement.startsWith('left')) {
      expect(panel.x + panel.width).toBeCloseTo(Math.ceil(target.x - gap), 3);
    }
    if (placement.startsWith('right')) {
      expect(panel.x).toBeCloseTo(Math.floor(target.x + target.width + gap), 3);
    }
  });
}
