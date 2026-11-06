import { test, expect } from './test';
import reference from './fixtures/ant-design-message-theme-reference.json' with { type: 'json' };
import wrapObservation from './fixtures/ant-design-message-wrap-observation.json' with { type: 'json' };
import { snapshotMessageTheme } from './message-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=message-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Message ${scope} theme matches source card for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Message theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Message theme scope', { exact: true }).selectOption(scope);
        await expect(page.locator('.ant-message-notice')).toBeVisible();

        // Прежний native перенос сохраняется; остальные CSS-метрики берутся из raw UMD.
        await expect.poll(() => page.evaluate(snapshotMessageTheme)).toEqual({
          ...expected,
          title: { ...expected.title, 'overflow-wrap': 'anywhere' }
        });
      });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Message ${mode} theme matches source card for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Message theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Message theme mode', { exact: true }).selectOption(mode);
        await expect(page.locator('.ant-message-notice')).toBeVisible();

        await expect.poll(() => page.evaluate(snapshotMessageTheme)).toEqual({
          ...expected,
          title: { ...expected.title, 'overflow-wrap': 'anywhere' }
        });
      });
  }
}

test('Message token updates preserve notice identity, viewport styles and outside input focus',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Message outside draft', exact: true });
    await input.fill('Retained draft');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const surface = page.locator('.ant-message');
    const notice = page.locator('.ant-message-notice');
    const originalSurface = await surface.elementHandle();
    const originalNotice = await notice.elementHandle();
    const originalInput = await input.elementHandle();
    const viewportStyle = await surface.evaluate(node => [node.style.width, node.style.left]);
    expect(viewportStyle.every(Boolean)).toBe(true);

    await surface.evaluate(node => {
      node.dataset.lostViewport = 'false';
      const observer = new MutationObserver(() => {
        if (!node.style.width || !node.style.left) node.dataset.lostViewport = 'true';
      });
      observer.observe(node, { attributes: true, attributeFilter: ['style'] });
    });

    await page.getByRole('button', { name: 'Update Message tokens', exact: true })
      .dispatchEvent('click');

    await expect(notice).toHaveCSS('padding', '11px 29px');
    await expect(notice).toHaveCSS('background-color', 'rgb(255, 240, 246)');
    await expect(notice).toHaveText('Message text');
    expect(await surface.evaluate((node, old) => node === old, originalSurface)).toBe(true);
    expect(await notice.evaluate((node, old) => node === old, originalNotice)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await surface.evaluate(node => [node.style.width, node.style.left]))
      .toEqual(viewportStyle);
    await expect(surface).toHaveAttribute('data-lost-viewport', 'false');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Retained draft');
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await page.getByRole('form', { name: 'Message theme form' }).evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Retained draft');
    await expect(page.getByLabel('Message theme events', { exact: true })).toHaveText('[]');

    await page.getByRole('button', { name: 'Dismiss themed message', exact: true }).click();

    await expect(notice).toHaveCount(0);
    await expect(page.getByLabel('Message theme events', { exact: true }))
      .toHaveText('["close","done:true"]');
  });

test('Message inheritance reset isolates tokens without replacing or dismissing the notice',
  async ({ page }) => {
    await page.getByLabel('Message theme scope', { exact: true }).selectOption('nested');
    const input = page.getByRole('textbox', { name: 'Message outside draft', exact: true });
    await input.fill('Nested draft');
    const notice = page.locator('.ant-message-notice');
    const original = await notice.elementHandle();
    const expected = reference.cases.find(sample => sample.name === 'default')!.scopes.nested;

    await page.getByLabel('Inherit Message theme', { exact: true }).dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotMessageTheme)).toEqual({
      ...expected,
      title: { ...expected.title, 'overflow-wrap': 'anywhere' }
    });
    expect(await notice.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toHaveValue('Nested draft');
    await expect(input).toBeFocused();
    await expect(page.getByLabel('Message theme events', { exact: true })).toHaveText('[]');
  });

test('Message updates do not restart a running duration timer', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));
  await page.reload();
  await page.getByRole('button', { name: 'Open timed themed message', exact: true })
    .dispatchEvent('click');
  const timed = page.locator('.timed-theme-message');
  await expect(timed).toBeVisible();

  await page.clock.runFor(600);
  await page.getByRole('button', { name: 'Update Message tokens', exact: true })
    .dispatchEvent('click');

  await expect(timed).toHaveCSS('padding', '11px 29px');
  await expect(timed).toBeVisible();
  await expect(page.getByLabel('Message theme events', { exact: true })).toHaveText('[]');

  await page.clock.runFor(400);

  await expect(timed).toHaveCount(0);
  await expect(page.locator('.ant-message-notice')).toHaveCount(1);
  await expect(page.getByLabel('Message theme events', { exact: true }))
    .toHaveText('["timed-close"]');
});

test('Message returns to legacy styling and reads the current theme when reopening an empty holder',
  async ({ page }) => {
    const notice = page.locator('.ant-message-notice');
    const original = await notice.elementHandle();
    const input = page.getByRole('textbox', { name: 'Message outside draft', exact: true });
    await input.fill('Legacy draft');

    await page.getByLabel('Apply source Message theme', { exact: true }).uncheck();

    await expect(notice).toHaveCSS('padding', '9px 12px');
    await expect(notice).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    expect(await notice.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await page.locator('.ant-message').evaluate(node =>
      (node as HTMLElement).style.getPropertyValue('--ant-message-content-bg'))).toBe('');

    await page.getByRole('button', { name: 'Dismiss themed message', exact: true }).click();
    await expect(notice).toHaveCount(0);
    await page.getByRole('button', { name: 'Update Message tokens', exact: true }).click();
    await page.getByLabel('Apply source Message theme', { exact: true }).check();
    await page.getByRole('button', { name: 'Open another themed message', exact: true }).click();

    await expect(notice).toHaveText('Reopened message');
    await expect(notice).toHaveCSS('padding', '11px 29px');
    await expect(input).toHaveValue('Legacy draft');

    await page.getByLabel('Mount themed Message', { exact: true }).uncheck();

    await expect(page.locator('.ant-message')).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
  });

test('Message keeps long words within the card instead of copying the observed source overflow',
  async ({ page }) => {
    await page.getByLabel('Message theme preset', { exact: true }).selectOption('default');
    await page.getByRole('button', { name: 'Show long themed message', exact: true }).click();
    const source = wrapObservation.cases.find(sample => sample.name === 'long-word')!;
    expect(source.metrics.overflow.noticeScrollWidth)
      .toBeGreaterThan(source.metrics.overflow.noticeWidth);
    const geometry = await page.locator('.ant-message-notice').evaluate(node => ({
      width: node.clientWidth,
      scrollWidth: node.scrollWidth,
      titleWidth: node.querySelector<HTMLElement>('.ant-message-notice-title')!.clientWidth
    }));

    expect(geometry.width).toBe(source.metrics.overflow.noticeWidth);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width);
    expect(geometry.titleWidth).toBeLessThanOrEqual(geometry.width);
  });
