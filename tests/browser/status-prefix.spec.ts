import { test, expect } from './test';
import reference from './fixtures/ant-design-status-prefix-reference.json' with { type: 'json' };
import { snapshotStatusPrefix } from './status-prefix-metrics';

function expectedNative(result: typeof reference.cases[number]['result']) {
  const copy = structuredClone(result);
  for (const widgets of Object.values(copy)) {
    // Согласованные Native group spacing и прежние Tag default/RTL classes сохранены.
    widgets['avatar-group'].padding = widgets['avatar-group'].direction === 'rtl'
      ? '0px 8px 0px 0px' : '0px 0px 0px 8px';
    widgets.tag.classes.push(`${widgets.tag.classes[0]}-default`);
    widgets.tag.classes.sort();
    if (widgets['checkable-tag'].direction === 'rtl') {
      widgets['checkable-tag'].classes.push(`${widgets['checkable-tag'].classes[0]}-rtl`);
      widgets['checkable-tag'].classes.sort();
    }
  }
  return copy;
}

for (const entry of reference.cases) {
  test(`Shared status prefixes match source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=status-prefix');
    await page.getByRole('combobox', { name: 'Status prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotStatusPrefix))
      .toEqual(expectedNative(entry.result));
  });
}

test('Status prefix updates preserve all roots and the focused draft', async ({ page }) => {
  await page.goto('/?fixture=status-prefix');
  await page.getByRole('checkbox', { name: 'Live status prefix', exact: true }).check();
  const scope = page.locator('[data-status-prefix-scope="normal"]');
  const roots = scope.locator(
    '[data-ant-skeleton-main], [data-prefix-widget]:not([data-prefix-widget="skeleton"]) > :first-child'
  );
  const oldRoots = await roots.elementHandles();
  const input = page.getByRole('textbox', { name: 'normal widget draft', exact: true });
  const oldInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live status prefix value', exact: true })
      .evaluate((node: HTMLInputElement, prefix) => {
        node.value = prefix;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotStatusPrefix))
      .toEqual(expectedNative(step.result));
    await expect(roots).toHaveCount(17);
    for (let index = 0; index < oldRoots.length; index++) {
      expect(await roots.nth(index).evaluate((node, old) => node === old, oldRoots[index]))
        .toBe(step.rootsRetained);
    }
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
  }
});

test('Local group prefixes keep inherited Avatar and CheckableTag prefixes independent',
  async ({ page }) => {
    await page.goto('/?fixture=status-prefix');
    await page.getByRole('combobox', { name: 'Status prefix sample', exact: true })
      .selectOption('local');
    const scope = page.locator('[data-status-prefix-scope="normal"]');

    await expect(scope.locator('[data-prefix-widget="avatar-group"] > div'))
      .toHaveClass(/custom-avatar-group/);
    await expect(scope.locator('[data-prefix-widget="avatar-group"] .suite-avatar'))
      .toHaveCount(2);
    await expect(scope.locator('[data-prefix-widget="checkable-tag-group"] > div'))
      .toHaveClass(/custom-tag-checkable-group/);
    await expect(scope.locator('[data-prefix-widget="checkable-tag-group"] .suite-tag'))
      .toHaveCount(2);
  });

test('Prefixed badge digits keep reduced motion while the count changes', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-08T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-08T00:01:00Z'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fixture=status-prefix');
  await page.getByRole('combobox', { name: 'Status prefix sample', exact: true })
    .selectOption('global');
  const digit = page.locator(
    '[data-status-prefix-scope="normal"] [data-prefix-widget="badge"] .suite-scroll-number-only'
  );
  await page.getByRole('spinbutton', { name: 'Prefixed badge count', exact: true }).fill('9');

  await expect(digit).toHaveAttribute('style', /transform:/);
  await expect(digit).toHaveCSS('transition-property', 'none');
  await page.clock.runFor(1100);
  await expect(digit).toHaveText('9');
});
