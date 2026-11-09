import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-float-button-prefix-reference.json' with { type: 'json' };
import { snapshotFloatButtonPrefix } from './float-button-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

async function scroll(page: Page) {
  await page.locator('.fixture-float-scroller').evaluateAll(nodes => nodes.forEach(node => {
    node.scrollTop = 120;
    node.dispatchEvent(new Event('scroll'));
  }));
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local FloatButton prefix value' : 'Live FloatButton prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

for (const entry of reference.cases) {
  test(`FloatButton prefix matches explicit source group aliases for ${entry.sample.id}`, async ({
    page
  }) => {
    await page.goto('/?fixture=float-button-prefix');
    await page.getByRole('combobox', { name: 'FloatButton prefix sample', exact: true })
      .selectOption(entry.sample.id);
    await scroll(page);

    const expected = 'expectedNative' in entry ? entry.expectedNative : entry.matched;

    await expect.poll(() => page.evaluate(snapshotFloatButtonPrefix)).toEqual(expected);
  });
}

test('FloatButton prefix changes retain menu, progress, nodes, refs and editor state', async ({
  page
}) => {
  await page.goto('/?fixture=float-button-prefix');
  await page.getByRole('checkbox', { name: 'Live FloatButton prefix', exact: true }).check();
  await scroll(page);
  const scope = page.locator('[data-float-prefix-scope="normal"]');
  const root = scope.locator('.fixture-float-group');
  const oldRoot = await root.elementHandle();
  const buttons = root.locator('button');
  const oldButtons = await buttons.elementHandles();
  const editor = scope.getByRole('textbox', { name: 'normal floating draft', exact: true });
  const oldInput = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotFloatButtonPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    for (const [index, oldButton] of oldButtons.entries()) {
      expect(await buttons.nth(index).evaluate((node, old) => node === old, oldButton))
        .toBe(step.sameButtons);
    }
    expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
      .toBe(step.formValue);
    await expect(scope.getByLabel('normal floating refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal floating events')).toHaveText('');
  }
  await setPrefix(page, 'floating', true);

  await expect(root).toHaveClass(/floating-group-menu-mode/);
  await expect(buttons.first()).toHaveClass(/floating-circle/);
  await expect(editor).toBeFocused();
  await scope.getByRole('button', { name: 'normal first action', exact: true }).click();

  await expect(scope.getByLabel('normal floating events')).toHaveText('first');
  await scope.getByRole('button', { name: 'normal back to top', exact: true }).click();

  await expect.poll(() => scope.locator('.fixture-float-scroller').evaluate(node => node.scrollTop))
    .toBe(0);
});

test('FloatButton bottom menu closes toward its source offset with a custom global prefix', async ({
  page
}) => {
  await page.goto('/?fixture=float-button-prefix');
  await page.getByRole('combobox', { name: 'FloatButton prefix sample', exact: true })
    .selectOption('menu-bottom');
  const scope = page.locator('[data-float-prefix-scope="normal"]');
  const list = scope.locator('.fixture-float-list');
  await expect.poll(() => list.evaluate(node => node.getAnimations().length)).toBe(0);
  await scope.getByRole('button', { name: 'normal floating menu', exact: true }).click();
  await expect.poll(() => list.evaluate(node => node.getAnimations().length)).toBe(1);
  const offset = await list.evaluate(node => {
    const animation = node.getAnimations()[0];

    animation.pause();
    animation.currentTime = Number(animation.effect!.getTiming().duration);
    return new DOMMatrixReadOnly(getComputedStyle(node).transform).m42;
  });
  const source = reference.cases.find(entry => entry.sample.id === 'menu-bottom')!;

  expect(offset).toBe(-parseFloat(source.matched.normal.standalone.root.width));
});
