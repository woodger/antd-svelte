import { test, expect } from './test';
import reference from './fixtures/ant-design-beam-global-reference.json' with { type: 'json' };
import isolated from './fixtures/ant-design-beam-global-isolated.json' with { type: 'json' };
import { snapshotBeamGlobal } from './beam-global-metrics';

for (const entry of reference.cases) {
  test(`BorderBeam keeps source prefixes for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=beam-global');
    await page.getByRole('combobox', { name: 'Beam global sample', exact: true })
      .selectOption(entry.sample.id);
    // Source cache теряет inner namespace при shared local class; fresh page даёт эталон.
    const separate = isolated.cases.find(sample => sample.sample.id === entry.sample.id);
    const expected = { ...entry.result, ...separate?.result };

    await expect.poll(() => page.evaluate(snapshotBeamGlobal)).toEqual(expected);
  });
}

test('Global beam prefix changes preserve layers targets and focused drafts', async ({ page }) => {
  await page.goto('/?fixture=beam-global');
  await page.getByRole('checkbox', { name: 'Live global beam prefix', exact: true }).check();
  const scope = page.locator('[data-beam-global-scope="normal"]');
  const target = scope.locator('[data-beam-global-target]');
  const oldTarget = await target.elementHandle();
  const layers = target.locator(':scope > [aria-hidden="true"]');
  await expect(layers).toHaveCount(2);
  const oldLayers = await layers.elementHandles();
  const input = page.getByRole('textbox', { name: 'normal widget draft', exact: true });
  const oldInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live global beam prefix value', exact: true })
      .evaluate((node: HTMLInputElement, prefix) => {
        node.value = prefix;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotBeamGlobal)).toEqual(step.result);
    for (let index = 0; index < oldLayers.length; index++) {
      expect(await layers.nth(index).evaluate((node, old) => node === old, oldLayers[index]))
        .toBe(step.rootsRetained);
    }
    expect(await target.evaluate((node, old) => node === old, oldTarget)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });

  expect(await layers.first().evaluate(node => getComputedStyle(node, '::before').display))
    .toBe('none');
});
