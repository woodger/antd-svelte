import { test, expect } from './test';
import reference from './fixtures/ant-design-tag-group-reference.json' with { type: 'json' };
import type { TagGroupCase } from './fixtures/tag-group-presets';
import { snapshotTagGroup } from './tag-group-metrics';

async function openCase(page: import('@playwright/test').Page, name: string) {
  await page.goto('/?fixture=tag-group');
  await page.getByLabel('Tag group reference').selectOption(name);
  await expect(page.locator('[data-tag-group-root]')).toBeAttached();
}

for (const sample of reference.cases as TagGroupCase[]) {
  test(`CheckableTagGroup matches source state and styles for ${sample.name}`, async ({ page }) => {
    await openCase(page, sample.name);
    const snapshot = () => page.locator('#tag-group-fixture').evaluate(snapshotTagGroup);

    expect(await snapshot()).toEqual(sample.snapshots[0]);
    let changed = false;
    for (const [index, step] of (sample.steps ?? []).entries()) {
      if ('patch' in step) {
        if (changed !== step.patch) await page.getByRole('button', {
          name: 'Change tag group props'
        }).click();
        changed = step.patch;
        await page.mouse.move(0, 0);
      } else {
        const item = page.locator('[data-tag-group-root] .ant-tag-checkable').nth(
          'click' in step ? step.click : step.space
        );
        if ('click' in step) await item.evaluate((node: HTMLButtonElement) => node.click());
        else await item.evaluate(node => node.dispatchEvent(new KeyboardEvent('keydown', {
          key: ' ', bubbles: true, cancelable: true
        })));
      }

      await expect.poll(snapshot).toEqual(sample.snapshots[index + 1]);
    }
  });
}

test('CheckableTagGroup uses native buttons with Space, Enter and tab order', async ({ page }) => {
  await openCase(page, 'single-empty');
  const items = page.locator('[data-tag-group-root] button');
  await page.getByRole('button', { name: 'Before tag group' }).focus();
  await page.keyboard.press('Tab');

  await expect(items.nth(0)).toBeFocused();
  await expect(items.nth(0)).toHaveAttribute('type', 'button');
  await expect(items.nth(0)).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('Space');
  await expect(items.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Tab');
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(items.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(items.nth(0)).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After tag group' })).toBeFocused();
  await expect(page.getByRole('status', { name: 'Tag group events' })).toHaveText('["a","b"]');
});

test('CheckableTagGroup preserves item DOM and focus when options reorder', async ({ page }) => {
  await openCase(page, 'options-reorder');
  const item = page.getByRole('button', { name: 'b', exact: true });
  await item.focus();
  await item.evaluate(node => node.setAttribute('data-retained', 'yes'));
  await page.getByRole('button', { name: 'Change tag group props' })
    .evaluate((node: HTMLButtonElement) => node.click());

  await expect(item).toBeFocused();
  await expect(item).toHaveAttribute('data-retained', 'yes');
  await expect(page.locator('[data-tag-group-root] button').first()).toHaveText('b');
  await expect(page.getByRole('status', { name: 'Tag group events' })).toHaveText('[]');
});

test('CheckableTagGroup clears its ref and resets defaults on remount', async ({ page }) => {
  await openCase(page, 'single-default');
  await page.getByRole('button', { name: 'b', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Tag group ref' })).toHaveText('div');
  await page.getByRole('button', { name: 'Toggle API group' }).click();

  await expect(page.locator('[data-tag-group-root]')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Tag group ref' })).toHaveText('empty');

  await page.getByRole('button', { name: 'Toggle API group' }).click();
  await expect(page.getByRole('button', { name: 'a', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status', { name: 'Tag group ref' })).toHaveText('div');
});

test('CheckableTagGroup blocks disabled activation and skips disabled items', async ({ page }) => {
  await openCase(page, 'context-disabled');
  const items = page.locator('[data-tag-group-root] button');

  await expect(items.nth(0)).toBeDisabled();
  await expect(items.nth(1)).toBeDisabled();

  await items.nth(1).evaluate((node: HTMLButtonElement) => node.click());
  await page.getByRole('button', { name: 'Before tag group' }).focus();
  await page.keyboard.press('Tab');

  await expect(page.getByRole('button', { name: 'After tag group' })).toBeFocused();
  await expect(page.getByRole('status', { name: 'Tag group events' })).toHaveText('[]');
});

test('CheckableTagGroup keeps surrounding forms unchanged', async ({ page }) => {
  await openCase(page, 'single-empty');
  await page.locator('[data-tag-group-root]').evaluate(root => {
    const form = root.closest('form')!;
    form.addEventListener('submit', () => form.dataset.submitted = 'yes');
  });
  await page.getByRole('button', { name: 'a', exact: true }).click();
  await page.keyboard.press('Enter');

  expect(await page.locator('[data-tag-group-root]').evaluate(root => {
    const form = root.closest('form')!;
    return { submitted: form.dataset.submitted ?? 'no', values: [...new FormData(form)] };
  })).toEqual({ submitted: 'no', values: [] });
});
