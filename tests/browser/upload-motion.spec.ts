import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-motion-reference.json' with { type: 'json' };
import { readUploadMotionItems } from './upload-motion-metrics';

type SourceMotionFrame = typeof reference.cases[number][
  'initial' | 'added' | 'removed' | 'settled'
][number];

function expectedItems(items: readonly SourceMotionFrame[]) {
  return items.filter(item => item.name !== 'trigger').map(item => ({
    name: item.name,
    motionClasses: item.motionClasses,
    height: item.inlineStyle?.match(/height:\s*([^;]+)/)?.[1] ?? null,
    opacity: item.inlineStyle?.match(/opacity:\s*([^;]+)/)?.[1] ?? null,
    animations: item.animations
  }));
}

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload list motion matches Source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=upload-motion');
    await page.getByRole('combobox', { name: 'Upload motion sample', exact: true })
      .selectOption(String(index));
    const prefix = 'prefix' in entry.sample ? entry.sample.prefix : 'ant';

    await expect.poll(() => page.evaluate(readUploadMotionItems, prefix))
      .toEqual(expectedItems(entry.initial));
    await page.getByRole('button', { name: 'Add beta', exact: true }).click();
    if (entry.sample.motion) {
      await page.waitForFunction(prefix => {
        const node = document.querySelector(
          `.${prefix}-upload-animate-appear-active, .${prefix}-upload-animate-inline-appear-active`
        );
        if (!node) return false;
        for (const animation of node.getAnimations()) animation.pause();
        return true;
      }, prefix);
    }

    expect(await page.evaluate(readUploadMotionItems, prefix)).toEqual(expectedItems(entry.added));

    await page.evaluate(() => {
      for (const node of document.querySelectorAll('[data-motion-host] *')) {
        for (const animation of node.getAnimations()) animation.finish();
      }
    });
    await expect.poll(() => page.evaluate(readUploadMotionItems, prefix))
      .toEqual(expectedItems(entry.added).map(item => ({
        ...item, motionClasses: [], height: null, opacity: null, animations: []
      })));
    await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();
    if (entry.sample.motion) {
      await page.waitForFunction(prefix => {
        const node = document.querySelector(
          `.${prefix}-upload-animate-leave-active, .${prefix}-upload-animate-inline-leave-active`
        );
        if (!node) return false;
        for (const animation of node.getAnimations()) animation.pause();
        return true;
      }, prefix);
    }

    expect(await page.evaluate(readUploadMotionItems, prefix))
      .toEqual(expectedItems(entry.removed));

    await page.evaluate(() => {
      for (const node of document.querySelectorAll('[data-motion-host] *')) {
        for (const animation of node.getAnimations()) animation.finish();
      }
    });

    await expect.poll(() => page.evaluate(readUploadMotionItems, prefix))
      .toEqual(expectedItems(entry.settled));
  });
}

test('Upload reuses a leaving row on return and keeps the input, draft and focus', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  const editor = page.getByRole('textbox', { name: 'Upload motion editor', exact: true });
  const row = page.locator('.ant-upload-list-item-container').first();
  const oldRow = await row.elementHandle();
  const oldInput = await page.locator('input[type=file]').elementHandle();
  await editor.fill('Retained draft');
  await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));
  await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
  await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));

  await page.getByRole('button', { name: 'Remove alpha', exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await page.clock.runFor(80);
  await page.waitForFunction(() => {
    const node = document.querySelector('.ant-upload-animate-leave-active');
    if (!node) return false;
    for (const animation of node.getAnimations()) animation.pause();
    return true;
  });
  await page.getByRole('button', { name: 'Restore alpha', exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await page.clock.runFor(3000);

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(1);
  expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(true);
  expect(await page.locator('input[type=file]').evaluate((node, old) => node === old, oldInput))
    .toBe(true);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Retained draft');
  expect(await editor.evaluate((node: HTMLInputElement) =>
    [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual([1, 5, 'backward']);
});

test('Upload finishes a retained row at the deadline when no CSS end event arrives', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
  await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
  await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();
  await page.clock.runFor(80);
  await page.locator('.ant-upload-list-item-container').evaluate(node => {
    for (const animation of node.getAnimations()) animation.pause();
  });

  await page.clock.runFor(1900);

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(1);

  await page.clock.runFor(150);

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(0);
});

test('Upload removes a leaving row immediately after motion is disabled', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();

  await page.getByRole('checkbox', { name: 'Disable Upload motion', exact: true }).check();

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(0);
});

test('Upload respects reduced motion and never animates its initial files', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fixture=upload-motion');

  await expect.poll(() => page.evaluate(readUploadMotionItems, 'ant'))
    .toEqual(expectedItems(reference.cases[0].initial));

  await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(0);
});

test('Upload keeps unique rows when a prototype-named uid is reordered', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  await page.getByRole('button', { name: 'Use prototype keys', exact: true }).click();
  await expect(page.locator('.ant-upload-list-item-name')).toHaveText(['a.png', '__proto__.png']);

  await page.getByRole('button', { name: 'Reverse files', exact: true }).click();

  await expect(page.locator('.ant-upload-list-item-name')).toHaveText(['__proto__.png', 'a.png']);
});

test('Upload ignores child end events and finishes only the owned row transition', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();
  await page.waitForFunction(() => {
    const node = document.querySelector('.ant-upload-animate-leave-active');
    if (!node) return false;
    for (const animation of node.getAnimations()) animation.pause();
    return true;
  });

  await page.locator('.ant-upload-list-item').evaluate(node => node.dispatchEvent(
    new TransitionEvent('transitionend', { bubbles: true, propertyName: 'opacity' })
  ));

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(1);

  await page.locator('.ant-upload-list-item-container').evaluate(node => node.dispatchEvent(
    new TransitionEvent('transitionend', { bubbles: true, propertyName: 'height' })
  ));

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(0);
});

test('Upload finishes its leave when reduced motion becomes active', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();

  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(page.locator('.ant-upload-list-item-container')).toHaveCount(0);
});

test('Upload remounts a hidden list without replaying initial item motion', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Show Upload list', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Restore alpha', exact: true }).click();

  await page.getByRole('checkbox', { name: 'Show Upload list', exact: true }).check();

  await expect.poll(() => page.evaluate(readUploadMotionItems, 'ant'))
    .toEqual(expectedItems(reference.cases[0].initial));
});

test('Upload cancels pending motion on unmount without changing outside focus', async ({ page }) => {
  await page.goto('/?fixture=upload-motion');
  await page.clock.install({ time: new Date('2024-09-15T03:00:00Z') });
  await page.clock.pauseAt(new Date('2024-09-15T03:00:01Z'));
  await page.getByRole('button', { name: 'Remove alpha', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Mount Upload', exact: true }).uncheck();
  const editor = page.getByRole('textbox', { name: 'Upload motion editor', exact: true });
  await editor.fill('Outside');

  await page.clock.runFor(3000);

  await expect(page.locator('[data-motion-host] [data-ant-upload-root]')).toHaveCount(0);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Outside');
});
