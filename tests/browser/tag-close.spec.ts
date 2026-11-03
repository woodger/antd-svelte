import { test, expect } from './test';
import reference from './fixtures/ant-design-tag-close-reference.json' with { type: 'json' };
import { snapshotTagClose, snapshotTagLink } from './tag-close-metrics';
import type { TagCloseStep } from './fixtures/tag-close-presets';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tag-close');
});

for (const sample of reference.cases) {
  test(`Tag matches source links and closable for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption(sample.name);
    const host = page.locator('#tag-close-surface');
    const root = host.locator('[data-tag-api-root]');
    await expect(root).toBeVisible();

    expect(await host.evaluate(snapshotTagClose)).toEqual(sample.snapshot);
    if ('patch' in sample) {
      const original = await root.elementHandle();
      await page.getByRole('button', { name: 'Change close API props', exact: true })
        .dispatchEvent('click');

      expect(await host.evaluate(snapshotTagClose)).toEqual(sample.changed);
      expect(await root.evaluate((node, original) => node === original, original))
        .toBe(sample.snapshot.tag === sample.changed!.tag);

      await page.getByRole('button', { name: 'Change close API props', exact: true })
        .dispatchEvent('click');

      expect(await host.evaluate(snapshotTagClose)).toEqual(sample.restored);
    }
    const prevented: boolean[] = [];

    for (const step of sample.steps as TagCloseStep[]) {
      const target = step.kind === 'root' ? root : root.locator('.ant-tag-close-icon');
      prevented.push(await target.evaluate((node, step) => {
        const event = step.kind === 'key'
          ? new KeyboardEvent('keydown', {
            bubbles: true, cancelable: true, key: step.key, repeat: step.repeat
          })
          : new MouseEvent('click', { bubbles: true, cancelable: true });
        if (step.cancelled) event.preventDefault();
        node.dispatchEvent(event);
        return event.defaultPrevented;
      }, step));
    }

    expect(prevented).toEqual(sample.prevented);
    await expect(page.getByRole('status', { name: 'Tag close events' }))
      .toHaveText(JSON.stringify(sample.events));
    expect(await host.evaluate(snapshotTagClose)).toEqual(sample.final);
  });
}

for (const sample of reference.cases.filter(sample => 'linkStates' in sample)) {
  test(`Tag matches source link interaction styles for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption(sample.name);
    const host = page.locator('#tag-close-surface');
    const root = host.locator('[data-tag-api-root]');
    const target = sample.childrenLink ? root.locator('a') : root;
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    expect(await host.evaluate(snapshotTagLink)).toEqual(sample.linkStates!.hovered);

    await page.mouse.down();

    expect(await host.evaluate(snapshotTagLink)).toEqual(sample.linkStates!.active);

    await page.mouse.move(0, 0);
    await page.mouse.up();
    await page.getByRole('button', { name: 'Before close API Tag', exact: true }).focus();
    await page.keyboard.press('Tab');

    expect(await host.evaluate(snapshotTagLink)).toEqual(sample.linkStates!.focused);
  });
}

test('Tag keeps the focused close button while ARIA props change', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('reactive-aria');
  const close = page.locator('#tag-close-surface .ant-tag-close-icon');
  const original = await close.elementHandle();
  await close.focus();
  await page.getByRole('button', { name: 'Change close API props', exact: true })
    .dispatchEvent('click');

  await expect(close).toBeFocused();
  await expect(close).toHaveAccessibleName('Second close');
  await expect(close).toHaveAccessibleDescription('Custom close description');
  expect(await close.evaluate((node, original) => node === original, original)).toBe(true);
});

test('Tag keeps local closeLabel priority over closable ARIA naming', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('object-aria');
  await page.getByRole('textbox', { name: 'Tag native close label' }).fill('Native close label');

  await expect(page.locator('#tag-close-surface .ant-tag-close-icon'))
    .toHaveAccessibleName('Native close label');
});

for (const name of ['reactive-root-type', 'reactive-root-span']) {
  test(`Tag updates its native ref through ${name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption(name);
    await page.getByRole('checkbox', { name: 'Focusable Tag root' }).check();
    const root = page.locator('#tag-close-surface [data-tag-api-root]');

    for (let index = 0; index < 3; index++) {
      if (index) await page.getByRole('button', { name: 'Change close API props', exact: true })
        .dispatchEvent('click');
      await page.getByRole('button', { name: 'Focus Tag root ref', exact: true }).click();

      await expect(root).toBeFocused();
      await expect(page.getByRole('status', { name: 'Tag root ref' }))
        .toHaveText(await root.evaluate(node => node.tagName));
    }

    await page.getByRole('button', { name: 'Toggle close API Tag', exact: true }).click();

    await expect(root).toHaveCount(0);
    await expect(page.getByRole('status', { name: 'Tag root ref' })).toHaveCount(0);
  });
}

test(
  'Tag follows a native link and Enter without invoking close or submitting a form',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('link-close');
    const link = page.getByRole('link', { name: 'API Tag', exact: true });
    await link.focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/#tag-close-destination$/);
    await expect(page.getByRole('status', { name: 'Tag close events' }))
      .toHaveText(JSON.stringify(['click:A', 'parent']));
    await expect(link).toBeVisible();
  }
);

test('Tag closes a native link without navigation and clears its root ref', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('link-close');
  const close = page.locator('#tag-close-surface .ant-tag-close-icon');
  await close.click();

  await expect(page).not.toHaveURL(/#tag-close-destination$/);
  await expect(page.locator('#tag-close-surface [data-tag-api-root]')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Tag root ref' })).toHaveText('empty');
  await expect(page.getByRole('button', { name: 'After close API Tag', exact: true }))
    .toBeFocused();
  await expect(page.getByRole('status', { name: 'Tag close events' }))
    .toHaveText(JSON.stringify(['close:click:false']));
});

test(
  'Tag retains the native disabled close button and removes disabled link navigation',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('link-disabled');
    const root = page.locator('#tag-close-surface [data-tag-api-root]');
    const close = root.locator('button');

    await expect(root).not.toHaveAttribute('href');
    await expect(root).toHaveAttribute('aria-disabled', 'true');
    await expect(close).toBeDisabled();
    await close.evaluate(node => (node as HTMLButtonElement).click());

    await expect(page.getByRole('status', { name: 'Tag close events' })).toHaveText('[]');
    await expect(root).toBeVisible();
  }
);

test('Tag honors the native blank link target', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('link-blank');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'API Tag', exact: true }).click();
  const popup = await popupPromise;

  await expect(popup).toHaveURL(/#tag-close-destination$/);
  await expect(page).not.toHaveURL(/#tag-close-destination$/);

  await popup.close();
});

test('Tag ignores held Enter when its owner cancels closing', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('close-prevented');
  const close = page.locator('#tag-close-surface .ant-tag-close-icon');
  await close.focus();
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');

  await expect(close).toBeFocused();
  await expect(page.getByRole('status', { name: 'Tag close events' }))
    .toHaveText(JSON.stringify(['close:click:false']));
});

test(
  'Tag removes its direct keyboard listener when the close control disappears',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tag close reference' })
      .selectOption('reactive-close-remove');
    const close = await page.locator('#tag-close-surface .ant-tag-close-icon').elementHandle();
    await page.getByRole('button', { name: 'Change close API props', exact: true })
      .dispatchEvent('click');

    await expect(page.locator('#tag-close-surface .ant-tag-close-icon')).toHaveCount(0);
    expect(await close!.evaluate(node => {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' });
      node.dispatchEvent(event);
      return event.defaultPrevented;
    })).toBe(false);
    await expect(page.getByRole('status', { name: 'Tag close events' })).toHaveText('[]');
  }
);

test('Tag link styles stay inside the component marker', async ({ page }) => {
  const outside = page.getByRole('link', { name: 'Outside Tag link' });
  await page.getByRole('combobox', { name: 'Tag close reference' }).selectOption('link');

  await expect(outside).toHaveCSS('text-decoration-line', 'underline');
  await expect(outside).toHaveCSS('cursor', 'pointer');
  await expect(page.getByRole('link', { name: 'API Tag', exact: true }))
    .toHaveCSS('text-decoration-line', 'none');
});
