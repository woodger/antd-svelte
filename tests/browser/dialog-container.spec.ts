import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-dialog-container-reference.json' with { type: 'json' };

const root = (page: Page) => page.locator('dialog.ant-svelte-dialog,dialog.ant-svelte-drawer');
const panel = (page: Page) => page.getByRole('dialog', { name: 'Container panel', exact: true });
const draft = (page: Page) => page.getByRole('textbox', { name: 'Panel draft', exact: true });
test.use({ viewport: { width: 1300, height: 1000 } });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=dialog-container'); });

async function frames(page: Page) {
  await page.evaluate(async () => {
    for (let n = 0; n < 10; n++) await new Promise(requestAnimationFrame);
  });
}
async function check(page: Page, label: string, checked: boolean) {
  await page.getByLabel(label, { exact: true }).evaluate((node, checked) => {
    const input = node as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}
async function snapshot(page: Page) {
  return root(page).evaluate(node => {
    const input = node.querySelector<HTMLInputElement>('[aria-label="Panel draft"]');
    const calls: unknown[] = JSON.parse(
      document.querySelector('[aria-label="Panel container calls"]')!.textContent!
    );
    return {
      calls: [...new Map(calls.map(call => [JSON.stringify(call), call])).values()]
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en')),
      target: node.getRootNode() instanceof ShadowRoot ? 'shadow'
        : node.closest<HTMLElement>('[data-panel-container]')?.dataset.panelContainer ?? 'default',
      hasInput: Boolean(input),
      draft: input?.value ?? null,
      count: node.querySelector('[data-panel-count]')?.textContent ?? null
    };
  });
}
async function open(page: Page, name: string) {
  const sample = reference.cases.find(item => item.name === name)!;
  await page.getByLabel('Dialog reference', { exact: true }).selectOption(name);
  await expect.poll(async () => ({ calls: (await snapshot(page)).calls })).toEqual(sample.beforeOpen);
  if (!sample.initial) {
    await page.getByRole('button', { name: 'Open container panel', exact: true }).click();
  }
  await expect(panel(page)).toBeVisible();
  await expect(draft(page)).toBeVisible();
  await frames(page);
  return sample;
}
async function edit(page: Page) {
  await draft(page).fill('Owned draft');
  await draft(page).evaluate(node => {
    const input = node as HTMLInputElement;
    input.setSelectionRange(1, 5);
    input.form!.querySelector<HTMLElement>('[data-panel-count]')!.click();
  });
}

for (const sample of reference.cases) {
  test(`dialog container precedence and payload match the source for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);

    await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
    await expect(root(page)).toHaveCount(1);
    await expect(root(page)).not.toHaveAttribute('getcontainer');
    await expect(root(page)).toHaveJSProperty('open', true);
    expect(await root(page).evaluate(node => node.matches(':modal'))).toBe(true);
  });

  test(`dialog getter refresh preserves source contents for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);
    await edit(page);
    const previousInput = await draft(page).elementHandle();
    const previousRoot = await root(page).elementHandle();

    await page.getByRole('button', { name: 'Refresh panel function', exact: true })
      .evaluate(node => (node as HTMLElement).click());
    await frames(page);

    const current = await draft(page).evaluate((node, old) => {
      const input = node as HTMLInputElement;
      return {
        sameInput: node === old.input,
        sameRoot: node.closest('dialog') === old.root,
        draft: input.value,
        count: input.form!.querySelector('[data-panel-count]')!.textContent,
        selection: [input.selectionStart, input.selectionEnd],
        focused: node === (node.getRootNode() as Document | ShadowRoot).activeElement
      };
    }, { input: previousInput, root: previousRoot });

    expect(current).toEqual(sample.refresh);
    await expect(panel(page)).toBeVisible();
  });

  if (sample.moved) {
    const moved = sample.moved;
    test(`dialog target changes recreate source contents for ${sample.name}`, async ({ page }) => {
      await open(page, sample.name);
      await edit(page);
      const previousRoot = await root(page).elementHandle();

      await check(page, 'Alternate panel container', true);

      await expect.poll(() => snapshot(page)).toEqual(moved.snapshot);
      expect(await root(page).evaluate((node, old) => node === old, previousRoot)).toBe(moved.sameRoot);
      await expect(panel(page)).toBeVisible();
      await expect(root(page)).toHaveCount(1);
      await expect(page.getByLabel('Panel container closes', { exact: true })).toHaveText('0');
    });
  }

  test(`dialog close retains the source draft lifecycle for ${sample.name}`, async ({ page }) => {
    await open(page, sample.name);
    await edit(page);
    if (sample.moved) await check(page, 'Alternate panel container', true);

    await page.getByRole('button', { name: 'Close container panel', exact: true })
      .evaluate(node => (node as HTMLElement).click());
    await expect(panel(page)).toHaveCount(0);
    await frames(page);

    // Native Drawer сохраняет закрытый dialog shell и при destroyOnHidden.
    const expected = sample.afterClose;
    await expect.poll(async () => {
      const current = await snapshot(page);
      return expected.hasInput ? current : { ...current, target: 'default' };
    }).toEqual(expected);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await page.getByRole('button', { name: 'Open container panel', exact: true }).click();

    await expect(draft(page)).toHaveValue(expected.draft ?? 'Seed');
    await expect(panel(page)).toBeVisible();
  });
}
