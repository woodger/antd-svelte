import { test, expect } from './test';
import type { Page } from '@playwright/test';
import registry from 'antd-svelte/porting/registry.json' with { type: 'json' };
import actionReference from './fixtures/ant-design-typography-actions-reference.json' with { type: 'json' };

const root = (page: Page) => page.locator('#typography-under-test');
const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const events = (page: Page) => control(page, 'Typography events');

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=typography');
  await expect(root(page)).toBeVisible();
});

test('Typography renders native variants and preserves heading levels and link security defaults', async ({ page }) => {
  await expect(root(page)).toHaveJSProperty('tagName', 'DIV');
  await select(page, 'Typography variant').selectOption('title');
  await expect(root(page)).toHaveJSProperty('tagName', 'H2');
  await select(page, 'Typography level').selectOption('5');
  await expect(root(page)).toHaveJSProperty('tagName', 'H5');
  await select(page, 'Typography variant').selectOption('text');
  await expect(root(page)).toHaveJSProperty('tagName', 'SPAN');
  await select(page, 'Typography variant').selectOption('link');
  await expect(root(page)).toHaveAttribute('rel', 'noopener noreferrer');
  await select(page, 'Typography variant').selectOption('container');
  await expect(root(page)).toHaveJSProperty('tagName', 'ARTICLE');
});

test('Typography edits scalar text, trims it and returns focus after Enter', async ({ page }) => {
  await control(page, 'Typography source').fill('Original');
  await control(page, 'Typography editable').check();
  await button(page, 'Редактировать').click();
  const editor = page.locator('.ant-typography-edit-content textarea');
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Original');
  await editor.fill('  Changed  ');
  await editor.press('Enter');

  await expect(root(page)).toHaveText('Changed');
  await expect(button(page, 'Редактировать')).toBeFocused();
  await expect(events(page)).toHaveText('start|click|save:Changed|end');
});

test('Typography measures and expands scalar ellipsis with actions', async ({ page }) => {
  await select(page, 'Typography ellipsis').selectOption('js');
  await select(page, 'Typography expandable').selectOption('collapsible');

  await expect(button(page, 'Раскрыть')).toBeVisible();
  await expect(root(page)).toHaveAttribute('aria-label');
  await expect(root(page)).toContainText('...');
  await button(page, 'Раскрыть').click();
  await expect(button(page, 'Свернуть')).toBeVisible();
  await button(page, 'Свернуть').click();
  await expect(button(page, 'Раскрыть')).toBeVisible();
});

test('Typography tracks plain snippet text through edit and JS ellipsis', async ({ page }) => {
  await select(page, 'Typography content').selectOption('snippet');
  await select(page, 'Typography ellipsis').selectOption('js');
  await select(page, 'Typography expandable').selectOption('collapsible');
  await expect(button(page, 'Раскрыть')).toBeVisible();
  await control(page, 'Typography source').fill('Short snippet');
  await expect(root(page)).toHaveText('Short snippet');
  await control(page, 'Typography editable').check();
  await button(page, 'Редактировать').click();
  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveValue('Short snippet');
});

test('Typography wraps content and operations in the original decoration order', async ({ page }) => {
  await control(page, 'Typography decorations').check();
  await control(page, 'Typography copyable').check();

  await expect(root(page).locator('i > kbd > mark > code > del > u > strong')).toHaveCount(1);
  await expect(root(page).locator('strong > .ant-typography-actions')).toHaveCount(1);
});

test('Typography retains zero content and the standalone copy spacing distinction', async ({ page }) => {
  await select(page, 'Typography content').selectOption('zero');
  await control(page, 'Typography copyable').check();

  await expect(root(page)).toHaveText('0');
  await expect(button(page, 'Копировать')).not.toHaveClass(/copy-icon-only/);
});

test('Typography honors explicit edit text and custom confirm icon classes', async ({ page }) => {
  await control(page, 'Typography editable').check();
  await control(page, 'Typography explicit edit text').check();
  await select(page, 'Typography enter icon').selectOption('custom');
  await button(page, 'Редактировать').click();

  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveValue('Explicit editable text');
  await expect(page.locator('.ant-typography-edit-content-confirm')).toHaveText('OK');
});

test('Typography Escape cancels the draft without a save or end callback', async ({ page }) => {
  await control(page, 'Typography source').fill('Original');
  await control(page, 'Typography editable').check();
  await button(page, 'Редактировать').click();
  await page.locator('.ant-typography-edit-content textarea').fill('Draft');
  await page.locator('.ant-typography-edit-content textarea').press('Escape');

  await expect(root(page)).toHaveText('Original');
  await expect(events(page)).toHaveText('start|click|cancel');
  await expect(button(page, 'Редактировать')).toBeFocused();
});

test('Typography blur saves trimmed text without invoking onEnd', async ({ page }) => {
  await control(page, 'Typography editable').check();
  await button(page, 'Редактировать').click();
  await page.locator('.ant-typography-edit-content textarea').fill(' Blur value ');
  await control(page, 'Typography copy text').focus();

  await expect(root(page)).toHaveText('Blur value');
  await expect(events(page)).toHaveText('start|click|save:Blur value');
});

test('Typography ignores composing and modified key pairs before a real Enter', async ({ page }) => {
  await control(page, 'Typography editable').check();
  await button(page, 'Редактировать').click();
  const editor = page.locator('.ant-typography-edit-content textarea');
  await editor.fill('IME value');
  await editor.dispatchEvent('compositionstart');
  await editor.press('Enter');
  await editor.dispatchEvent('compositionend');
  await editor.press('Shift+Enter');

  await expect(editor).toBeFocused();
  await expect(events(page)).toHaveText('start|click');
  await editor.press('Enter');
  await expect(root(page)).toHaveText('IME value');
});

test('Typography text trigger invokes the root callback and supports controlled rejection', async ({ page }) => {
  await control(page, 'Typography editable').check();
  await control(page, 'Typography controlled edit').check();
  await select(page, 'Typography triggers').selectOption('text');
  await control(page, 'Accept Typography changes').uncheck();
  await root(page).click();

  await expect(events(page)).toHaveText('start|click');
  await expect(page.locator('.ant-typography-edit-content')).toHaveCount(0);
  await expect(button(page, 'Редактировать')).toHaveCount(0);
  await control(page, 'Accept Typography changes').check();
  await root(page).click();
  await expect(page.locator('.ant-typography-edit-content textarea')).toBeFocused();
});

test('Typography controlled editing can reject save and later save again on blur', async ({ page }) => {
  await control(page, 'Typography editable').check();
  await control(page, 'Typography controlled edit').check();
  await control(page, 'Accept Typography changes').uncheck();
  await button(page, 'Start Typography owner edit').click();
  const editor = page.locator('.ant-typography-edit-content textarea');
  await editor.fill('Rejected');
  await editor.press('Enter');

  await expect(editor).toBeVisible();
  await expect(events(page)).toContainText('save:Rejected|end');
  await control(page, 'Typography copy text').focus();
  await expect(events(page)).toContainText('save:Rejected|end|save:Rejected');
});

test('Typography copies scalar content and keeps the click inside the action', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await control(page, 'Typography source').fill('Clipboard content');
  await control(page, 'Typography copyable').check();
  await button(page, 'Копировать').click();

  await expect(button(page, 'Скопировано')).toHaveClass(/copy-success/);
  await expect(events(page)).toHaveText('copy');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Clipboard content');
});

test('Typography copies the full reactive snippet rather than its truncated visible prefix', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await select(page, 'Typography content').selectOption('snippet');
  await control(page, 'Typography copyable').check();
  await select(page, 'Typography ellipsis').selectOption('js');
  await expect(root(page)).toContainText('...');
  const source = await control(page, 'Typography source').inputValue();
  await button(page, 'Копировать').click();

  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source);
});

test('Typography awaits async copy text and displays the loading icon', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await control(page, 'Typography copyable').check();
  await control(page, 'Typography async copy').check();
  await button(page, 'Копировать').click();
  await expect(root(page).locator('.anticon-loading')).toBeVisible();
  await button(page, 'Resolve Typography copy').click();

  await expect(root(page).locator('.anticon-loading')).toHaveCount(0);
  await expect(button(page, 'Скопировано')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Async clipboard text');
});

test('Typography completes requested async copy after unmount without restoring its controls', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await control(page, 'Typography copyable').check();
  await control(page, 'Typography async copy').check();
  await button(page, 'Копировать').click();
  await control(page, 'Mount Typography').uncheck();

  await button(page, 'Resolve Typography copy').click();

  await expect(events(page)).toHaveText('copy');
  await expect(root(page)).toHaveCount(0);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Async clipboard text');
});

test('Typography writes HTML and plain clipboard formats for an explicit value', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await control(page, 'Typography copyable').check();
  await control(page, 'Typography copy text').fill('<b>HTML copy</b>');
  await select(page, 'Typography copy format').selectOption('text/html');
  await button(page, 'Копировать').click();

  await expect(button(page, 'Скопировано')).toBeVisible();
  const formats = await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    return { plain: await (await items[0].getType('text/plain')).text(),
      html: await (await items[0].getType('text/html')).text() };
  });
  expect(formats.plain).toBe('<b>HTML copy</b>');
  expect(formats.html).toContain('<b>HTML copy</b>');
});

test('Typography uses the document copy fallback when the async API rejects', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true,
      value: async () => { throw new Error('Denied async copy'); } });
  });
  await control(page, 'Typography source').fill('Fallback content');
  await control(page, 'Typography copyable').check();
  await button(page, 'Копировать').click();

  await expect(button(page, 'Скопировано')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Fallback content');
});

test('Typography switches custom copy icons and cancels the reset timer on unmount', async ({ page }) => {
  const instant = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: instant });
  await page.clock.pauseAt(instant);
  await control(page, 'Typography copyable').check();
  await control(page, 'Typography custom icons').check();
  await expect(button(page, 'Копировать')).toHaveText('COPY');
  await button(page, 'Копировать').click();
  await expect(button(page, 'Скопировано')).toHaveText('DONE');
  await page.clock.runFor(2999);
  await expect(button(page, 'Скопировано')).toBeVisible();
  await page.clock.runFor(1);
  await expect(button(page, 'Копировать')).toHaveText('COPY');
  await control(page, 'Mount Typography').uncheck();
  await page.clock.runFor(4000);
  await expect(control(page, 'Typography ref')).toHaveText('none');
});

test('Typography positions actions at the start and keeps disabled actions interactive', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await control(page, 'Typography source').fill('Text');
  await control(page, 'Typography copyable').check();
  await control(page, 'Typography disabled').check();
  await select(page, 'Typography actions').selectOption('start');

  await expect(root(page).locator(':scope > .ant-typography-actions')).toHaveClass(/actions-start/);
  await button(page, 'Копировать').click();
  await expect(button(page, 'Скопировано')).toBeVisible();
});

test('Typography disabled links retain working copy actions without navigating', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await select(page, 'Typography variant').selectOption('link');
  await control(page, 'Typography source').fill('Disabled link');
  await control(page, 'Typography disabled').check();
  await control(page, 'Typography copyable').check();
  await button(page, 'Копировать').click();

  await expect(button(page, 'Скопировано')).toBeVisible();
  await expect(page).toHaveURL(/fixture=typography$/);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Disabled link');
});

test('Typography chooses native CSS ellipsis without adding a layout probe until hover', async ({ page }) => {
  await select(page, 'Typography ellipsis').selectOption('css');

  await expect(root(page)).toHaveClass(/ellipsis-multiple-line/);
  await expect(root(page)).toHaveCSS('-webkit-line-clamp', '2');
  await expect(root(page)).not.toHaveAttribute('aria-label');
  await expect(root(page).locator('[aria-hidden="true"]')).toHaveCount(0);
});

test('Typography exposes a native ellipsis tooltip on hover and hides it over actions', async ({ page }) => {
  await select(page, 'Typography ellipsis').selectOption('js-tooltip');
  await control(page, 'Typography copyable').check();
  await expect(root(page)).toContainText('...');
  await root(page).hover({ position: { x: 10, y: 10 } });
  const visibleTooltip = page.getByRole('tooltip');
  await expect(visibleTooltip).toBeVisible();
  await button(page, 'Копировать').hover();
  await expect(visibleTooltip.filter({ hasText: 'Копировать' })).toBeVisible();
  await expect(page.getByRole('tooltip').filter({ hasText: 'Bamboo' })).toBeHidden();
});

test('Typography honors the source Text locale alias above component locale strings', async ({ page }) => {
  await control(page, 'Typography locale').check();
  await control(page, 'Typography Text locale alias').check();
  await control(page, 'Typography copyable').check();
  await control(page, 'Typography editable').check();

  await expect(button(page, 'Source copy')).toBeVisible();
  await expect(button(page, 'Change text')).toBeVisible();
});

test('Typography keeps zero tooltip titles and hides an explicit null title in JS mode', async ({ page }) => {
  await select(page, 'Typography ellipsis').selectOption('js-tooltip');
  await select(page, 'Typography tooltip title').selectOption('zero');
  await expect(root(page)).toContainText('...');
  await root(page).hover({ position: { x: 10, y: 10 } });
  await expect(page.getByRole('tooltip')).toHaveText('0');

  await select(page, 'Typography tooltip title').selectOption('none');

  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('Typography merges semantic classes and preserves root style priority while editing', async ({ page }) => {
  await control(page, 'Typography semantic').check();
  await control(page, 'Typography editable').check();

  await expect(root(page)).toHaveClass(/provider-div-ltr local-root/);
  await expect(root(page)).toHaveCSS('color', 'rgb(0, 90, 0)');
  await expect(button(page, 'Редактировать')).toHaveClass(/provider-action local-action/);
  await button(page, 'Редактировать').click();
  await expect(page.locator('.ant-typography-edit-content')).toHaveClass(/local-root/);
  await expect(page.locator('.ant-typography-edit-content')).not.toHaveClass(/root-typography/);
  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveClass(/provider-textarea local-textarea/);
  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveCSS('font-size', '20px');
});

test('Typography shows compact heading tokens and inherits them while editing', async ({ page }) => {
  await select(page, 'Typography variant').selectOption('title');
  await select(page, 'Typography level').selectOption('1');
  await control(page, 'Typography compact').check();
  await control(page, 'Typography editable').check();

  await expect(root(page)).toHaveCSS('font-size', '32px');
  await expect(root(page)).toHaveCSS('line-height', '40px');
  await button(page, 'Редактировать').click();
  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveCSS('font-size', '32px');
  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveCSS('line-height', '40px');
});

test('Typography local direction overrides the provider for rendered text and editing', async ({ page }) => {
  await control(page, 'Typography local RTL').check();
  await control(page, 'Typography editable').check();

  await expect(root(page)).toHaveCSS('direction', 'rtl');
  await button(page, 'Редактировать').click();
  await expect(page.locator('.ant-typography-edit-content textarea')).toHaveCSS('direction', 'rtl');
});

test('Typography recomputes ellipsis when its available width changes', async ({ page }) => {
  await select(page, 'Typography ellipsis').selectOption('js');
  await select(page, 'Typography expandable').selectOption('once');
  await expect(button(page, 'Раскрыть')).toBeVisible();
  await control(page, 'Typography width').fill('1200');

  await expect(button(page, 'Раскрыть')).toHaveCount(0);
  await expect(events(page)).toContainText('ellipsis:true|ellipsis:false');
});

test('Typography keeps controlled expansion unchanged when the owner rejects it', async ({ page }) => {
  await select(page, 'Typography ellipsis').selectOption('js');
  await select(page, 'Typography expandable').selectOption('collapsible');
  await control(page, 'Typography controlled expanded').check();
  await control(page, 'Accept Typography changes').uncheck();
  await button(page, 'Раскрыть').click();

  await expect(button(page, 'Раскрыть')).toBeVisible();
  await expect(events(page)).toContainText('expanded:true');
  await button(page, 'Expand Typography owner').click();
  await expect(button(page, 'Свернуть')).toBeVisible();
});

test('Typography preserves source action widths and the exact two-line cut point', async ({ page }) => {
  expect(actionReference.reference).toMatchObject({
    version: registry.upstream.version,
    revision: registry.upstream.revision,
    archiveSha256: registry.upstream.archiveSha256
  });

  await control(page, 'Typography copyable').check();
  await control(page, 'Typography editable').check();
  await select(page, 'Typography expandable').selectOption('collapsible');
  await select(page, 'Typography ellipsis').selectOption('js');

  await expect(root(page)).toHaveText(
    'Bamboo is Little Light Bamboo is Little Light Bamboo is Little Light Bamb...Раскрыть'
  );
  const width = await root(page).locator('.ant-typography-actions').evaluate(
    element => element.getBoundingClientRect().width
  );

  // Upstream snapshot использует шрифты текущего браузера, изолируя CSS библиотеки.
  const sourceWidth = await page.evaluate(
    snapshot => {
      const host = document.createElement('div');
      host.inert = true;
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'position:fixed;left:-9999px;top:0;width:300px;visibility:hidden;pointer-events:none';
      document.body.append(host);

      try {
        const shadow = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = snapshot.css.join('\n');
        const content = document.createElement('div');
        content.innerHTML = snapshot.html;
        shadow.append(style, content);

        return shadow.querySelector('.ant-typography-actions')!.getBoundingClientRect().width;
      } finally {
        host.remove();
      }
    },
    actionReference.snapshot
  );
  expect(width).toBeCloseTo(sourceWidth, 1);

  await select(page, 'Typography actions').selectOption('start');
  await expect(root(page)).toHaveText(
    'РаскрытьBamboo is Little Light Bamboo is Little Light Bamboo is Little Ligh...'
  );
});

test('Typography preserves unitless line height through nested decorations', async ({ page }) => {
  await control(page, 'Typography source').fill('Typography content');
  await control(page, 'Typography decorations').check();
  await control(page, 'Typography editable').check();
  await control(page, 'Typography copyable').check();

  await expect(root(page).locator('code')).toHaveCSS('line-height', '16.83px');
  expect((await root(page).boundingBox())?.height).toBeCloseTo(22.78125, 1);
});

test('Typography clears native refs and does not save a removed editor', async ({ page }) => {
  await control(page, 'Typography editable').check();
  await button(page, 'Редактировать').click();
  await expect(control(page, 'Typography ref')).toHaveText('none');
  await page.locator('.ant-typography-edit-content textarea').fill('Unsaved draft');

  // Программный unmount сохраняет фокус в editor до удаления DOM.
  await control(page, 'Mount Typography').evaluate((element: HTMLInputElement) => element.click());

  await expect(page.locator('.ant-typography-edit-content')).toHaveCount(0);
  await expect(events(page)).toHaveText('start|click');
  await control(page, 'Mount Typography').check();
  await expect(control(page, 'Typography ref')).toHaveText('DIV');
});

test('Typography forwards edit maximum, row limits and a hidden confirm icon', async ({ page }) => {
  await control(page, 'Typography source').fill('Short');
  await control(page, 'Typography edit maximum').fill('6');
  await control(page, 'Typography edit min rows').fill('3');
  await control(page, 'Typography edit max rows').fill('4');
  await select(page, 'Typography enter icon').selectOption('none');
  await control(page, 'Typography editable').check();
  await button(page, 'Редактировать').click();
  const editor = page.locator('.ant-typography-edit-content textarea');

  await expect(editor).toHaveAttribute('maxlength', '6');
  await expect(page.locator('.ant-typography-edit-content-confirm')).toHaveCount(0);
  await expect.poll(async () => (await editor.boundingBox())?.height).toBe(76);
  await editor.fill('');
  await editor.pressSequentially('12345678');
  await expect(editor).toHaveValue('123456');
});

test('Typography keeps default expansion initial and uses custom symbols for both states', async ({ page }) => {
  await control(page, 'Mount Typography').uncheck();
  await select(page, 'Typography ellipsis').selectOption('js');
  await select(page, 'Typography expandable').selectOption('collapsible');
  await control(page, 'Typography default expanded').check();
  await control(page, 'Typography custom symbol').check();
  await control(page, 'Mount Typography').check();

  await expect(button(page, 'Свернуть')).toHaveText('Close text');
  await control(page, 'Typography default expanded').uncheck();
  await expect(button(page, 'Свернуть')).toBeVisible();
  await button(page, 'Свернуть').click();
  await expect(button(page, 'Раскрыть')).toHaveText('Open text');
});

test('Typography releases controlled expansion to the source empty state', async ({ page }) => {
  await select(page, 'Typography ellipsis').selectOption('js');
  await select(page, 'Typography expandable').selectOption('collapsible');
  await control(page, 'Typography controlled expanded').check();
  await button(page, 'Expand Typography owner').click();
  await expect(button(page, 'Свернуть')).toBeVisible();

  await button(page, 'Release Typography owner expanded').click();

  await expect(button(page, 'Раскрыть')).toBeVisible();
});

test('Typography Text strips paragraph-only ellipsis options and keeps one native line', async ({ page }) => {
  await select(page, 'Typography variant').selectOption('text');
  await select(page, 'Typography ellipsis').selectOption('css');
  await select(page, 'Typography expandable').selectOption('collapsible');
  await control(page, 'Typography rows').fill('4');

  await expect(root(page)).toHaveClass(/ellipsis-single-line/);
  await expect(button(page, 'Раскрыть')).toHaveCount(0);
  await expect(root(page)).toHaveCSS('white-space', 'nowrap');
});

test('Typography retains suffix when content fits and when the prefix is fully truncated', async ({ page }) => {
  await control(page, 'Typography source').fill('Prefix');
  await control(page, 'Typography suffix').fill('--important suffix');
  await control(page, 'Typography suffix enabled').check();
  await select(page, 'Typography ellipsis').selectOption('js');
  await expect(root(page)).toHaveText('Prefix--important suffix');

  await control(page, 'Typography source').fill('Long prefix '.repeat(20));
  await control(page, 'Typography rows').fill('1');
  await control(page, 'Typography width').fill('100');

  await expect(root(page)).toHaveText('...--important suffix');
});

test('Typography keeps compact editor geometry, dark colors and RTL on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await control(page, 'Typography width').fill('280');
  await control(page, 'Typography compact').check();
  await control(page, 'Typography dark').check();
  await control(page, 'Typography local RTL').check();
  await control(page, 'Typography editable').check();
  await expect(root(page)).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
  await expect(root(page)).toHaveCSS('line-height', '20px');
  await button(page, 'Редактировать').click();
  const editor = page.locator('.ant-typography-edit-content textarea');

  await expect(editor).toHaveCSS('padding', '3px 7px');
  await expect(editor).toHaveCSS('direction', 'rtl');
  await editor.press('Escape');
  await expect(button(page, 'Редактировать')).toBeFocused();
});
