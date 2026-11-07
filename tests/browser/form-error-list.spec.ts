import { test, expect } from './test';
import reference from './fixtures/ant-design-form-error-list-observation.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=form-error-list');
  await expect(page.locator('#form-error-list-fixture')).toBeVisible();
});

test('FormErrorList matches source help priority, ordering, theme metrics and visibility callbacks', async ({ page }) => {
  const actions: Record<string, string> = {
    'errors-and-warnings': 'Show errors',
    'help-priority': 'Show help',
    'empty-help': 'Show empty help',
    'false-help': 'Show false help',
    'zero-help': 'Show zero help',
    'null-help-falls-through': 'Show null help',
    'empty-after-messages': 'Clear messages'
  };
  const holder = page.locator('[data-ant-form-error-list]');

  for (const sample of reference.cases) {
    if (sample.id === 'duplicate-and-prototype-messages') continue;
    if (actions[sample.id]) {
      await page.getByRole('button', { name: actions[sample.id], exact: true }).click();
    }

    if (!sample.rendered) {
      await expect(holder).toHaveCount(0);
    } else {
      await expect(holder.locator(':scope > div')).toHaveText(sample.items.map(({ text }) => text));
      expect(await holder.evaluate((node) => node.id)).toBe(sample.idAttribute);
      const items = await holder.locator(':scope > div').evaluateAll((nodes) => nodes.map((node) => ({
        text: node.textContent,
        status: ['success', 'warning', 'error', 'validating'].find((status) =>
          node.classList.contains(`ant-form-item-explain-${status}`)
        ) ?? '',
        color: getComputedStyle(node).color,
        fontSize: getComputedStyle(node).fontSize,
        lineHeight: getComputedStyle(node).lineHeight
      })));
      expect(items).toEqual(sample.items);
    }

    await expect(page.getByRole('status', { name: 'Error list callbacks', exact: true }))
      .toHaveText(JSON.stringify(sample.callbacks));
  }
});

test('FormErrorList renders duplicate and prototype text exactly once per supplied entry', async ({ page }) => {
  await page.getByRole('button', { name: 'Show null help', exact: true }).click();
  await expect(page.locator('[data-ant-form-error-message]')).toHaveText(['Visible error']);

  await page.getByRole('button', { name: 'Show duplicate messages', exact: true }).click();

  await expect(page.locator('[data-ant-form-error-message]')).toHaveText([
    'toString', 'toString', 'constructor', '__proto__', 'toString'
  ]);
  const sample = reference.cases.find((entry) => entry.id === 'duplicate-and-prototype-messages')!;
  expect(sample.items.map(({ text }) => text)).toHaveLength(7);
  await page.getByRole('button', { name: 'Clear messages', exact: true }).click();
  await expect(page.locator('[data-ant-form-error-list]')).toHaveCount(0);
});

test('FormErrorList preserves text nodes when messages reorder', async ({ page }) => {
  await page.getByRole('button', { name: 'Show errors', exact: true }).click();
  await expect(page.locator('[data-ant-form-error-message]')).toHaveText(['First', 'Second', 'Warning']);
  const first = await page.getByText('First', { exact: true }).elementHandle();

  await page.getByRole('button', { name: 'Reorder messages', exact: true }).click();

  await expect(page.locator('[data-ant-form-error-message]')).toHaveText(['Second', 'First', 'Warning']);
  expect(await page.getByText('First', { exact: true }).evaluate((node, original) => node === original, first))
    .toBe(true);
  await first?.dispose();
});

test('FormErrorList renders snippets and updates its inherited prefix without remounting content', async ({ page }) => {
  await page.getByRole('button', { name: 'Show snippet message', exact: true }).click();
  const review = page.getByRole('button', { name: 'Review message', exact: true });
  await review.click();
  const original = await review.elementHandle();

  await page.getByRole('button', { name: 'Toggle error prefix', exact: true })
    .evaluate((button) => (button as HTMLButtonElement).click());

  await expect(page.locator('[data-ant-form-error-list]')).toHaveClass(/custom-form-item-explain/);
  await expect(page.locator('[data-ant-form-error-message]')).toHaveClass('custom-form-item-explain-error');
  await expect(page.locator('[data-ant-form-error-message]')).toHaveCSS('color', 'rgb(184, 18, 52)');
  await expect(review).toBeFocused();
  expect(await review.evaluate((node, previous) => node === previous, original)).toBe(true);
  await expect(page.getByRole('status', { name: 'Reviewed messages', exact: true })).toHaveText('1');
  await original?.dispose();
});

test('FormErrorList absorbs a short empty list without a hidden visibility callback', async ({ page }) => {
  await page.getByRole('button', { name: 'Show errors', exact: true }).click();
  const callbacks = page.getByRole('status', { name: 'Error list callbacks', exact: true });
  await expect(callbacks).toHaveText('[true]');
  await page.clock.install();

  await page.getByRole('button', { name: 'Replace after short clear', exact: true }).click();
  await page.clock.runFor(600);

  await expect(page.locator('[data-ant-form-error-message]')).toHaveText(['Recovered']);
  await expect(callbacks).toHaveText('[true]');
});

test('FormErrorList cancels a pending hide callback when unmounted', async ({ page }) => {
  await page.getByRole('button', { name: 'Show errors', exact: true }).click();
  const callbacks = page.getByRole('status', { name: 'Error list callbacks', exact: true });
  await expect(callbacks).toHaveText('[true]');
  await page.clock.install();

  // Обычный click ждёт остановки кнопки под сворачивающимся списком и пропускает leave.
  await page.getByRole('button', { name: 'Toggle error list', exact: true }).evaluate((button) => {
    const holder = document.querySelector<HTMLElement>('[data-ant-form-error-list]')!;
    const fixture = document.getElementById('form-error-list-fixture')!;
    const observer = new MutationObserver(() => {
      if (holder.dataset.visible !== 'false') return;

      observer.disconnect();
      fixture.dataset.controlledUnmount = 'true';
      (button as HTMLButtonElement).click();
    });
    observer.observe(holder, { attributes: true, attributeFilter: ['data-visible'] });
  });
  await page.getByRole('button', { name: 'Clear messages', exact: true }).click();
  await page.clock.runFor(1000);

  await expect(page.locator('#form-error-list-fixture'))
    .toHaveAttribute('data-controlled-unmount', 'true');
  await expect(page.locator('[data-ant-form-error-list]')).toHaveCount(0);
  await expect(callbacks).toHaveText('[true]');
});

test('FormErrorList honors motion disabled and reduced motion without missing callbacks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Show errors', exact: true }).click();
  const callbacks = page.getByRole('status', { name: 'Error list callbacks', exact: true });
  await expect(callbacks).toHaveText('[true]');

  await page.getByRole('button', { name: 'Clear messages', exact: true }).click();
  await expect(callbacks).toHaveText('[true,false]');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Toggle error motion', exact: true }).click();
  await page.getByRole('button', { name: 'Show errors', exact: true }).click();
  await expect(callbacks).toHaveText('[true,false,true]');
  await page.getByRole('button', { name: 'Clear messages', exact: true }).click();

  await expect(callbacks).toHaveText('[true,false,true,false]');
  await expect(page.locator('[data-ant-form-error-list]')).toHaveCount(0);
});
