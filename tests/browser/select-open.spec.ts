import { test, expect } from './test';
import reference from './fixtures/ant-design-select-open-reference.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=select-open');
});

for (const entry of reference.cases) {
  test(`Select popup visibility matches source for ${entry.sample.id}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Open sample', exact: true })
      .selectOption(entry.sample.id);
    const input = page.getByRole('combobox', { name: 'Open choice', exact: true });
    const snapshot = () => input.evaluate(node => {
      const active = node.getAttribute('aria-activedescendant');
      return {
        expanded: node.getAttribute('aria-expanded'),
        popup: Boolean(document.querySelector('.ant-select-dropdown')),
        activeLabel: active ? document.getElementById(active)?.textContent?.trim() ?? null : null,
        focused: node === document.activeElement,
        events: JSON.parse(document.getElementById('select-open-events')!.textContent!)
      };
    });
    const initial = structuredClone(entry.initial);
    if (entry.sample.id === 'default-zero-empty') {
      initial.expanded = 'true';
      initial.popup = true;
    }
    await expect.poll(snapshot).toEqual(initial);
    if (entry.sample.id === 'default-zero-empty' || entry.sample.id === 'default-array-zero') {
      await expect(page.locator('.ant-select-item-empty')).toHaveText('0');
    }
    if ('action' in entry.sample) {
      if (entry.sample.action === 'click') await input.click();
      else {
        await input.focus();
        await input.press('Escape');
      }
    }
    if ('update' in entry.sample) {
      await page.getByRole('button', { name: 'Update open sample', exact: true })
        .dispatchEvent('click');
    }
    for (const phase of entry.phases) {
      if (phase.phase === 'enable') {
        await page.getByRole('button', { name: 'Enable open sample', exact: true })
          .dispatchEvent('click');
      }
      await expect.poll(snapshot).toEqual(phase.result);
    }
  });
}

for (const strategy of ['bound', 'accepted']) {
  test(`Select ${strategy} open preserves ArrowUp selection and event order`,
    async ({ page }) => {
      await page.getByRole('combobox', { name: 'Open sample', exact: true }).selectOption(strategy);
      const input = page.getByRole('combobox', { name: 'Open choice', exact: true });
      await input.focus();
      await input.press('ArrowUp');
      await expect(input).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#select-open-owner')).toHaveText('true');
      await expect(page.locator('.ant-select-item-option-active')).toHaveText('Gamma');
      await input.press('Enter');

      await expect(input).toHaveValue('Gamma');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#select-open-owner')).toHaveText('false');
      await expect(page.locator('#select-open-events')).toHaveText('[true,false]');
      await expect(page.locator('#select-open-changes')).toHaveText('"g"');
    });
}

test('Select binds defaultOpen after mount without a synthetic open callback or focus transfer',
  async ({ page }) => {
    const chooser = page.getByRole('combobox', { name: 'Open sample', exact: true });
    await chooser.focus();
    await chooser.selectOption('bound-default');
    await expect(page.locator('#select-open-owner')).toHaveText('true');
    await expect(page.locator('#select-open-events')).toHaveText('[]');
    await expect(chooser).toBeFocused();
    await page.getByRole('button', { name: 'Toggle owner open', exact: true })
      .dispatchEvent('click');

    await expect(page.getByRole('combobox', { name: 'Open choice', exact: true }))
      .toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#select-open-events')).toHaveText('[]');
  });

test('Select external open preserves input and focus and clears single search', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Open sample', exact: true })
    .selectOption('controlled-open');
  const input = page.getByRole('combobox', { name: 'Open choice', exact: true });
  await input.fill('Al');
  const original = await input.elementHandle();
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(0, 1); });
  await page.getByRole('button', { name: 'Toggle owner open', exact: true }).dispatchEvent('click');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toHaveValue('');
  await page.getByRole('button', { name: 'Toggle owner open', exact: true }).dispatchEvent('click');

  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(input).toHaveValue('');
  await expect(page.locator('#select-open-changes')).toHaveText('');
  await expect(page.locator('#select-open-events')).toHaveText('[]');
});

test('Select native reset closes bound multiple open without callbacks and clears FormData',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Open sample', exact: true })
      .selectOption('bound-multiple');
    const input = page.getByRole('combobox', { name: 'Open choice', exact: true });
    await input.click();
    await page.getByRole('option', { name: 'Alpha', exact: true }).click();
    await expect(page.locator('#select-open-events')).toHaveText('[true]');
    await page.locator('form').evaluate((node: HTMLFormElement) => node.reset());

    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#select-open-owner')).toHaveText('false');
    await expect(page.locator('#select-open-events')).toHaveText('[true]');
    await expect(page.locator('#select-open-changes')).toHaveText('["a"]');
    expect(await page.locator('form').evaluate((node: HTMLFormElement) =>
      new FormData(node).getAll('choice'))).toEqual([]);
  });
