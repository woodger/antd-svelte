import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-avatar-source-reference.json' with { type: 'json' };

const avatar = (page: Page) => page.locator('#source-avatar');
const viewer = (page: Page) => page.getByRole('dialog', { name: 'Source photo', exact: true });
const imageTrigger = (page: Page) => page.getByRole('button', { name: 'Source photo', exact: true });
test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=avatar-source'); });

async function frames(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let n = 0; n < 8; n++) await new Promise(requestAnimationFrame);
  });
}

test('Avatar preserves the accessibility and focus of a named or unnamed source', async ({ page }) => {
  await open(page, 'stateful-element');
  const input = page.getByRole('textbox', { name: 'Source draft', exact: true });

  await expect(page.getByRole('group', { name: 'Outer avatar', exact: true })).toBeVisible();
  await input.focus();
  await expect(input).toBeFocused();

  await check(page, 'Name source avatar', false);

  await expect(avatar(page)).not.toHaveAttribute('aria-hidden', 'true');
  await expect(avatar(page)).not.toHaveAttribute('role', 'img');
  await expect(input).toBeFocused();
  await expect(input).toBeVisible();

  await check(page, 'Decorative source avatar', true);
  const hiddenInput = avatar(page).locator('input');
  await hiddenInput.evaluate(node => node.blur());
  await hiddenInput.focus();

  await expect(avatar(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(avatar(page)).toHaveJSProperty('inert', true);
  await expect(hiddenInput).not.toBeFocused();
  await expect(input).toHaveCount(0);

  await check(page, 'Decorative source avatar', false);
  await input.focus();

  await expect(input).toBeFocused();
});

test('Avatar leaves attributes and late errors with their source owner', async ({ page }) => {
  await open(page, 'raw-image-attrs');
  const image = avatar(page).locator('img');
  const original = await image.elementHandle();
  const attributes = await image.evaluate(node => ({
    draggable: node.getAttribute('draggable'),
    crossorigin: node.getAttribute('crossorigin'),
    srcset: node.getAttribute('srcset')
  }));

  await check(page, 'Change avatar source attributes', true);

  expect(await image.evaluate((node, previous) => node === previous, original)).toBe(true);
  expect(await image.evaluate(node => ({
    draggable: node.getAttribute('draggable'),
    crossorigin: node.getAttribute('crossorigin'),
    srcset: node.getAttribute('srcset')
  }))).toEqual(attributes);

  await page.getByLabel('Avatar source mode', { exact: true }).selectOption('string');
  const owned = await image.elementHandle();
  await image.evaluate(node => node.dispatchEvent(new Event('error')));

  await expect(page.getByLabel('Avatar source errors', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Own source errors', { exact: true })).toHaveText('0');

  await page.getByLabel('Avatar source mode', { exact: true }).selectOption('case');
  await owned!.evaluate(node => node.dispatchEvent(new Event('error')));

  await expect(page.getByLabel('Avatar source errors', { exact: true })).toHaveText('1');
  await expect(image).toHaveAttribute('data-source-image', '');
});

test('Avatar retains its root while source mode changes remount caller state', async ({ page }) => {
  await open(page, 'stateful-element');
  const input = page.getByRole('textbox', { name: 'Source draft', exact: true });
  const root = await avatar(page).elementHandle();
  await input.fill('Edited draft');
  await page.locator('[data-source-count]').click();

  await page.getByLabel('Avatar source mode', { exact: true }).selectOption('string');

  await expect(input).toHaveCount(0);
  await expect(avatar(page).locator('img')).toHaveCount(1);
  await expect(avatar(page)).toHaveAttribute('role', 'img');

  await page.getByLabel('Avatar source mode', { exact: true }).selectOption('none');

  await expect(avatar(page).locator('.ant-avatar-string')).toHaveText('Fallback');

  await page.getByLabel('Avatar source mode', { exact: true }).selectOption('case');

  expect(await avatar(page).evaluate((node, previous) => node === previous, root)).toBe(true);
  await expect(input).toHaveValue('Seed');
  await expect(page.locator('[data-source-count]')).toHaveText('0');
  await expect(avatar(page)).toHaveAttribute('role', 'group');
});

for (const focusTrap of [true, false]) {
  test(`Avatar overflow lets preview consume Escape first with focusTrap=${focusTrap}`, async ({ page }) => {
    await check(page, 'Trap source preview focus', focusTrap);
    await open(page, 'group-hidden');
    await imageTrigger(page).focus();
    await page.keyboard.press('Enter');

    await expect(viewer(page)).toBeVisible();
    await expect(page.locator('.ant-avatar-group-popover')).toBeVisible();
    await expect(viewer(page)).toHaveJSProperty('open', true);
    await page.keyboard.press('Escape');

    await expect(viewer(page)).toHaveCount(0);
    await expect(page.locator('.ant-avatar-group-popover')).toBeVisible();
    await expect(imageTrigger(page)).toBeFocused();
    await expect(page.getByLabel('Avatar source previews', { exact: true }))
      .toHaveText('[true,false]');

    await page.keyboard.press('Escape');

    await expect(page.locator('.ant-avatar-group-popover')).not.toBeVisible();
    await expect(page.locator('.ant-avatar-group-more')).toBeFocused();
  });

  test(`Avatar source preview closes by pointer with focusTrap=${focusTrap}`, async ({ page }) => {
    await check(page, 'Trap source preview focus', focusTrap);
    await open(page, 'group-hidden');
    await imageTrigger(page).click();

    await expect(viewer(page)).toBeVisible();
    await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(viewer(page)).toHaveCount(0);
    await expect(page.locator('.ant-avatar-group-popover')).toBeVisible();
    await expect(imageTrigger(page)).toBeFocused();
  });

  test(`Avatar source unmount releases the viewer with focusTrap=${focusTrap}`, async ({ page }) => {
    await check(page, 'Trap source preview focus', focusTrap);
    await open(page, 'group-hidden');
    await imageTrigger(page).click();
    await expect(viewer(page)).toBeVisible();

    await check(page, 'Mount source avatar', false);

    await expect(viewer(page)).toHaveCount(0);
    await expect(page.locator('.ant-avatar-group-popover')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');

    await page.getByLabel('Avatar source reference', { exact: true }).focus();

    await expect(page.getByLabel('Avatar source reference', { exact: true })).toBeFocused();
  });
}

async function check(page: Page, label: string, checked: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, checked) => {
    (node as HTMLInputElement).checked = checked;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

async function open(page: Page, name: string) {
  const sample = reference.cases.find(sample => sample.name === name)!;
  await page.getByLabel('Avatar source reference', { exact: true }).selectOption(name);
  if (sample.group === 'hidden') await page.locator('.ant-avatar-group-more').click();
  await expect(avatar(page)).toBeVisible();
  await frames(page);
  return sample;
}

async function snapshot(page: Page) {
  return avatar(page).evaluate(node => {
    const img = node.querySelector('img');
    const style = getComputedStyle(node);
    return {
      image: node.classList.contains('ant-avatar-image'),
      icon: node.classList.contains('ant-avatar-icon'),
      fallback: Boolean(node.querySelector('.ant-avatar-string')),
      width: parseFloat(style.width),
      height: parseFloat(style.height),
      font: parseFloat(style.fontSize),
      img: img ? {
        alt: img.getAttribute('alt'),
        draggable: img.getAttribute('draggable'),
        crossorigin: img.getAttribute('crossorigin'),
        srcset: img.getAttribute('srcset'),
        own: img.hasAttribute('data-source-image'),
        width: img.getBoundingClientRect().width,
        height: img.getBoundingClientRect().height,
        display: getComputedStyle(img).display
      } : null,
      avatarErrors: Number(document.querySelector('[aria-label="Avatar source errors"]')!.textContent),
      ownErrors: Number(document.querySelector('[aria-label="Own source errors"]')!.textContent),
      count: node.querySelector('[data-source-count]')?.textContent ?? null
    };
  });
}

async function previewSnapshot(page: Page) {
  return {
    open: await viewer(page).isVisible(),
    parent: await page.locator('.ant-avatar-group-popover').isVisible(),
    events: JSON.parse(await page.getByLabel('Avatar source previews', { exact: true }).innerText())
  };
}

for (const sample of reference.cases) {
  test(`Avatar source rendering matches upstream for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);

    await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
    await expect(avatar(page).locator('.ant-avatar-icon-content')).toHaveCount(0);
  });

  if (sample.afterError) {
    const expected = sample.afterError;
    test(`Avatar delegates source errors upstream for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);

      await avatar(page).locator('img').evaluate(node => node.dispatchEvent(new Event('error')));

      await expect.poll(() => snapshot(page)).toEqual(expected);
      await expect(avatar(page)).toHaveClass(/ant-avatar-image/);
      await expect(avatar(page).locator('.ant-avatar-string')).toHaveCount(0);
    });
  }
  if (sample.refresh) {
    const expected = sample.refresh;
    test(`Avatar retains source component state upstream for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      const input = page.getByRole('textbox', { name: 'Source draft', exact: true });
      await input.fill('Owned draft');
      await input.evaluate(node => {
        (node as HTMLInputElement).setSelectionRange(1, 5);
        node.parentElement!.querySelector<HTMLElement>('[data-source-count]')!.click();
      });
      const previous = await input.elementHandle();
      const root = await avatar(page).elementHandle();

      await page.getByRole('button', { name: 'Refresh avatar source', exact: true })
        .evaluate(node => (node as HTMLElement).click());
      await check(page, 'Larger source avatar', true);
      await check(page, 'Dark source avatar', true);
      await frames(page);

      expect(await input.evaluate((node, old) => ({
        sameInput: node === old.input,
        sameAvatar: node.closest('.ant-avatar') === old.root,
        value: (node as HTMLInputElement).value,
        selection: [
          (node as HTMLInputElement).selectionStart,
          (node as HTMLInputElement).selectionEnd
        ],
        focused: node === document.activeElement,
        count: node.parentElement!.querySelector('[data-source-count]')!.textContent
      }), { input: previous, root })).toEqual(expected);
    });
  }
  if (sample.previewLifecycle) {
    const expected = sample.previewLifecycle;
    test(`Avatar source preview and parent lifetime match upstream for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      await imageTrigger(page).click();
      await expect(viewer(page)).toBeVisible();
      await frames(page);

      expect(await previewSnapshot(page)).toEqual(expected.opened);
      await viewer(page).getByRole('button', { name: 'Закрыть', exact: true }).click();
      await expect(viewer(page)).toHaveCount(0);
      await frames(page);

      expect(await previewSnapshot(page)).toEqual(expected.closed);
      await expect(imageTrigger(page)).toBeFocused();
    });
  }
}
