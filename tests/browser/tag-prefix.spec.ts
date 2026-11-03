import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tag-prefix-reference.json' with { type: 'json' };
import { snapshotTagPrefix } from './tag-prefix-metrics';
import type { TagPrefixCase } from './fixtures/tag-prefix-presets';

async function select(page: Page, name: string) {
  await page.goto('/?fixture=tag-prefix');
  await page.getByRole('combobox', { name: 'Tag prefix reference', exact: true })
    .selectOption(name);
  await expect(page.locator('[data-tag-prefix-root]')).toBeVisible();
}

for (const sample of reference.cases as TagPrefixCase[]) {
  test(`Tag prefixes match source classes and styles for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    const host = page.locator('#tag-prefix-surface');
    const snapshot = (changed = false) => host.evaluate(snapshotTagPrefix, {
      ...sample, ...(changed ? sample.patch : {})
    });

    await expect.poll(() => snapshot()).toEqual(sample.snapshot);
    if (sample.patch) {
      const root = await host.locator('[data-tag-prefix-root]').elementHandle();
      await page.getByRole('button', { name: 'Change Tag prefix props' }).dispatchEvent('click');

      await expect.poll(() => snapshot(true)).toEqual(sample.changed);
      expect(await host.locator('[data-tag-prefix-root]')
        .evaluate((node, old) => node === old, root)).toBe(true);

      await page.getByRole('button', { name: 'Change Tag prefix props' }).dispatchEvent('click');

      await expect.poll(() => snapshot()).toEqual(sample.restored);
    }
  });
}

for (const name of [
  'reactive-tag-prefix',
  'reactive-checkable-prefix',
  'reactive-group-prefix',
  'reactive-link-prefix'
]) {
  test(`Tag prefix changes preserve native focus and DOM for ${name}`, async ({ page }) => {
    await select(page, name);
    const host = page.locator('#tag-prefix-surface');
    const root = host.locator('[data-tag-prefix-root]');
    const target = name === 'reactive-checkable-prefix'
      ? root : root.locator('[data-ant-tag-close], button').first();
    await target.focus();
    const previous = await target.elementHandle();

    await page.getByRole('button', { name: 'Change Tag prefix props' }).dispatchEvent('click');

    await expect(target).toBeFocused();
    expect(await target.evaluate((node, old) => node === old, previous)).toBe(true);
    await expect(page.getByRole('status', { name: 'Tag prefix events' })).toHaveText('[]');
    await expect(page.getByRole('status', { name: 'Tag prefix close' })).toHaveText('false');
    await expect(page.locator('head [data-ant-svelte-theme="tag-prefix:next-tag"]')).toHaveCount(1);

    await page.getByRole('button', { name: 'Toggle prefix component' }).click();

    await expect(page.locator('head [data-ant-svelte-theme="tag-prefix:next-tag"]')).toHaveCount(0);
    await expect(root).toHaveCount(0);
  });
}

test('custom Tag close preserves its target and releases scoped CSS', async ({ page }) => {
  await select(page, 'tag-link');
  const close = page.locator('[data-ant-tag-close]');
  const style = page.locator('head [data-ant-svelte-theme="tag-prefix:tenant-tag"]');
  const neighbor = page.locator('[data-tag-prefix-neighbor]');
  const before = await neighbor.evaluate(node => ({
    color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor
  }));

  await expect(close).toHaveAttribute('type', 'button');
  const box = await close.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(20);
  expect(box!.height).toBeGreaterThanOrEqual(20);
  await expect(style).toHaveCount(1);

  await close.click();

  await expect(page.locator('[data-tag-prefix-root]')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Tag prefix ref' })).toHaveText('empty');
  await expect(style).toHaveCount(0);
  await expect(page).not.toHaveURL(/#tag-prefix-destination$/);
  await expect(page.locator('head [data-ant-svelte-theme="tag-prefix:sibling-tag"]'))
    .toHaveCount(1);
  expect(await neighbor.evaluate(node => ({
    color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor
  }))).toEqual(before);
  await expect(page.locator('[data-tag-prefix-sibling]')).toBeVisible();
});

for (const name of [
  'reactive-tag-prefix', 'reactive-dark-prefix', 'reactive-dark-solid',
  'reactive-compact-prefix', 'reactive-dark-checkable'
]) {
  test(`Tag prefix changes preserve the native theme for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.getByLabel('Native Tag prefix theme', { exact: true }).check();
    const sample = reference.cases.find(sample => sample.name === name)! as TagPrefixCase;
    const host = page.locator('#tag-prefix-surface');
    await host.evaluate(async node => {
      getComputedStyle(node.querySelector('[data-tag-prefix-root]')!).getPropertyValue('color');
      await Promise.all(node.getAnimations({ subtree: true }).map(animation => animation.finished));
    });
    const before = await host.evaluate(snapshotTagPrefix, sample);
    const wrappers = host.locator('.ant-tag-content, .ant-tag-icon');
    const boxes = await wrappers.evaluateAll(nodes => nodes.map(node =>
      getComputedStyle(node).boxSizing
    ));
    const closeFont = await host.locator('[data-ant-tag-close]').count()
      ? await host.locator('[data-ant-tag-close]').evaluate(node => getComputedStyle(node).font)
      : undefined;

    await page.getByRole('button', { name: 'Change Tag prefix props' }).dispatchEvent('click');

    await host.evaluate(async node => {
      getComputedStyle(node.querySelector('[data-tag-prefix-root]')!).getPropertyValue('color');
      await Promise.all(node.getAnimations({ subtree: true }).map(animation => animation.finished));
    });

    const after = await host.evaluate(snapshotTagPrefix, { ...sample, ...sample.patch });
    const normalize = (value: typeof after) => ({
      ...value,
      classes: value.classes.map(name => name.replace(/^next-tag/, 'ant-tag')),
      close: value.close ? {
        ...value.close,
        classes: value.close.classes.map(name => name.replace(/^next-tag/, 'ant-tag'))
      } : null
    });
    expect(normalize(after)).toEqual(before);
    expect(await wrappers.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).boxSizing)))
      .toEqual(boxes);
    if (closeFont) await expect(host.locator('[data-ant-tag-close]')).toHaveCSS('font', closeFont);
  });
}

test('a custom Tag prefix retains Wave on a single child link', async ({ page }) => {
  await select(page, 'tag-child-link');
  await page.getByLabel('Native Tag prefix theme', { exact: true }).check();
  const root = page.locator('[data-tag-prefix-root]');
  await root.getByRole('link').click();

  await expect(root.locator('.ant-wave')).toHaveCount(1);

  await page.getByRole('button', { name: 'Toggle prefix component' }).click();

  await expect(page.locator('.ant-wave')).toHaveCount(0);
});

test('custom Tag prefixes preserve native disabled close behavior', async ({ page }) => {
  await select(page, 'tag-status-disabled');
  const close = page.locator('[data-ant-tag-close]');

  await expect(close).toBeDisabled();
  await expect(close).toHaveCSS('cursor', 'not-allowed');

  await close.evaluate((node: HTMLButtonElement) => node.click());

  await expect(page.locator('[data-tag-prefix-root]')).toBeVisible();
  await expect(page.getByRole('status', { name: 'Tag prefix close' })).toHaveText('false');
});
