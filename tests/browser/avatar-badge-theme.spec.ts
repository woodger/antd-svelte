import { test, expect } from './test';
import reference from './fixtures/ant-design-avatar-badge-metrics.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=avatar-badge-theme');
  await expect(page.getByRole('heading', { name: 'Source Avatar and Badge tokens', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Avatar and Badge styles match the official UMD for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption(sample.name);
    const selectors = {
      avatar: '#themed-avatar', small: '#themed-small-avatar', large: '#themed-large-avatar',
      square: '#themed-square-avatar', icon: '#themed-icon-avatar', numeric: '#themed-numeric-avatar',
      group: '#themed-avatar-group > .ant-avatar', badge: '#themed-badge .ant-badge-count',
      smallBadge: '#themed-small-badge .ant-badge-count', dot: '#themed-dot-badge .ant-badge-dot',
      status: '#themed-status-badge .ant-badge-status-dot', multi: '#themed-multi-badge .ant-badge-count'
    };
    for (const name of Object.keys(selectors) as (keyof typeof selectors)[]) {
      const expected = sample.metrics[name];
      await expect.poll(async () => page.locator(selectors[name]).first().evaluate((element, keys) => {
        const style = getComputedStyle(element);
        return Object.fromEntries(keys.map(key => [key, style[key as keyof CSSStyleDeclaration]]));
      }, Object.keys(expected)), { message: name }).toEqual(expected);
    }
    const expected = sample.metrics.groupLayout;
    const layout = await page.locator('#themed-avatar-group').evaluate(element => {
      const avatars = [...element.querySelectorAll(':scope > .ant-avatar')];
      const boxes = avatars.map(avatar => avatar.getBoundingClientRect());
      return { width: element.getBoundingClientRect().width,
        offsets: boxes.map(box => box.x - boxes[0].x) };
    });

    expect(layout.width).toBeCloseTo(expected.width, 2);
    expect(layout.offsets).toEqual(expected.offsets);
  });
}

test('overflow panels reset Avatar aliases while hidden avatars retain their own tokens', async ({ page }) => {
  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('avatar-aliases');
  const group = page.locator('#themed-overflow-group');
  await group.getByRole('button').click();

  const popup = group.getByRole('dialog');
  const expected = reference.cases.find(sample => sample.name === 'avatar-aliases')!.metrics.popover;
  await expect(popup).toHaveCSS('font-size', expected.fontSize);
  await expect(popup).toHaveCSS('color', expected.color);
  await expect(popup.locator('.ant-popover-container'))
    .toHaveCSS('background-color', expected.backgroundColor);
  await expect(popup.locator('.ant-avatar').first()).toHaveCSS('font-size', '24px');
  await expect(popup.locator('.ant-avatar').first()).toHaveCSS('border-width', '2px');
});

test('group tokens reach overflow avatars and the hidden list without losing keyboard focus', async ({ page }) => {
  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('own-avatar');
  const group = page.locator('#themed-overflow-group');
  const trigger = group.getByRole('button');

  await expect(trigger.locator('.ant-avatar')).toHaveCSS('width', '48px');
  await expect(trigger.locator('.ant-avatar')).toHaveCSS('border-color', 'rgb(18, 52, 86)');
  await trigger.focus();
  await page.keyboard.press('Enter');

  const popup = group.getByRole('dialog');
  await expect(popup).toBeVisible();
  await expect(popup.locator('.ant-avatar')).toHaveCount(2);
  await expect(popup.locator('.ant-avatar').first()).toHaveCSS('width', '48px');
  await expect(popup.locator('.ant-avatar-group-list')).toHaveCSS('row-gap', '9px');
  await page.keyboard.press('Escape');

  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Badge aliases reset at a child Avatar and do not leak to adjacent components', async ({ page }) => {
  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('own-badge');

  await expect(page.locator('#badge-avatar-composition .ant-badge-count'))
    .toHaveCSS('box-shadow', 'rgb(254, 220, 186) 0px 0px 0px 1px');
  await expect(page.locator('#badge-child-avatar')).toHaveCSS('width', '32px');
  expect(await page.locator('#badge-child-avatar').evaluate(element =>
    getComputedStyle(element).getPropertyValue('--ant-color-border-bg').trim()
  )).toBe('#ffffff');
  await expect(page.locator('#outside-themed-badge .ant-badge-count')).toHaveCSS('height', '20px');
});

test('numeric Avatar size and plain styles keep their original priority', async ({ page }) => {
  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('own-avatar');

  await expect(page.locator('#themed-numeric-avatar')).toHaveCSS('font-size', '18px');
  await expect(page.locator('#avatar-style-priority')).toHaveCSS('width', '53px');
  await expect(page.locator('#avatar-style-priority')).toHaveCSS('font-size', '18px');
  await expect(page.locator('#badge-style-priority .ant-badge-count')).toHaveCSS('height', '31px');
});

test('theme updates refit text while preserving Avatar node identity and its accessible name', async ({ page }) => {
  const avatar = page.locator('#avatar-fitting-text');
  const previous = await avatar.elementHandle();
  const scale = await avatar.locator('.ant-avatar-string').evaluate(element =>
    getComputedStyle(element).transform
  );

  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('own-avatar');

  await expect(avatar).toHaveCSS('width', '48px');
  await expect(avatar).toHaveAccessibleName('Long avatar text');
  expect(await avatar.evaluate((element, old) => element === old, previous)).toBe(true);
  await expect.poll(() => avatar.locator('.ant-avatar-string').evaluate(element =>
    getComputedStyle(element).transform
  )).not.toBe(scale);
});

test('nested providers can reset component defaults and keep the outer theme intact', async ({ page }) => {
  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('own-avatar');
  await expect(page.locator('#nested-themed-avatar')).toHaveCSS('width', '48px');
  await page.getByLabel('Inherit child Avatar Badge tokens', { exact: true }).uncheck();

  await expect(page.locator('#nested-themed-avatar')).toHaveCSS('width', '32px');
  await expect(page.locator('#themed-avatar')).toHaveCSS('width', '48px');
});

test('custom prefixes and hashing settings reach both roots and group members', async ({ page }) => {
  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('custom-prefix');
  await page.getByLabel('Hash themed avatars and badges', { exact: true }).uncheck();

  for (const id of ['themed-avatar', 'themed-avatar-group', 'themed-badge']) {
    await expect(page.locator('#' + id)).toHaveClass(/avatar-badge-source-scope/);
    await expect(page.locator('#' + id)).not.toHaveClass(/css-dev-only/);
  }
  await expect(page.locator('#themed-avatar-group > .ant-avatar').first()).toHaveCSS('width', '47px');
  await expect(page.locator('#themed-avatar')).toHaveCSS('--display-2-avatar-container-size', '47px');
});

test('removing source settings and unmounting removes variables and the provider scope', async ({ page }) => {
  await page.getByLabel('Avatar Badge token preset', { exact: true }).selectOption('own-avatar');
  const scope = page.locator('head style[data-ant-svelte-theme="avatar-badge-source-scope"]');
  await expect(scope).toHaveCount(1);

  await page.getByLabel('Apply source Avatar Badge tokens', { exact: true }).uncheck();

  await expect(page.locator('#themed-avatar')).toHaveCSS('width', '32px');
  await expect(page.locator('#themed-avatar')).not.toHaveAttribute('style');
  await expect(scope).toHaveCount(0);
  await page.getByLabel('Apply source Avatar Badge tokens', { exact: true }).check();
  await expect(page.locator('#themed-avatar')).toHaveCSS('width', '48px');
  await page.getByLabel('Mount themed avatars and badges', { exact: true }).uncheck();

  await expect(scope).toHaveCount(0);
});
