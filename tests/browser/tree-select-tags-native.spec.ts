import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-tags-reference.json' with { type: 'json' };
import { readTreeTags } from './tree-select-tag-metrics';

const input = (page: Page) => page.getByRole('combobox', { name: 'Tree tag values', exact: true });
const read = async (page: Page) => ({ view: await page.evaluate(readTreeTags, 'ant-select'),
  events: JSON.parse(await page.locator('[data-tree-tag-events]').innerText()) });

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-tags');
  await page.getByLabel('Tree tag sample').selectOption(id);
}

for (const [id, text] of [['emoji-split', '...'], ['middle-emoji-split', 'A...']]) {
  test(`TreeSelect tag text keeps a complete Unicode boundary for ${id}`, async ({ page }) => {
    const source = reference.observations.find(entry => entry.sample.id === id)!;
    const tags = source.initial.view.tags.map((tag, index) => index ? tag : { ...tag, text });
    expect(source.initial.view.tags[0].text).not.toBe(text);
    await mount(page, id);

    await expect.poll(() => read(page)).toEqual({
      ...source.initial, view: { ...source.initial.view, tags }
    });
  });
}

test('TreeSelect NaN visible count retains the selected tags like the Native Select adapter', async ({ page }) => {
  const source = reference.observations.find(entry => entry.sample.id === 'count-nan')!;
  const baseline = reference.cases.find(entry => entry.sample.id === 'default')!;
  expect(source.initial.view.tags).toEqual([]);
  await mount(page, source.sample.id);

  await expect.poll(() => read(page)).toEqual(baseline.initial);
});

test('TreeSelect shows all fitting tags instead of reserving an unnecessary oversized summary', async ({ page }) => {
  const source = reference.observations.find(entry => entry.sample.id === 'responsive-long-rest')!;
  const counterpart = reference.cases.find(entry => entry.sample.id === 'responsive-fit-320')!;
  expect(source.initial.view.tags).toHaveLength(1);
  expect(counterpart.initial.view.tags).toHaveLength(4);
  await mount(page, source.sample.id);

  await expect.poll(() => read(page)).toEqual(counterpart.initial);
});

for (const [id, titles] of [['opaque-array-title', ['Array0 label']], ['title-renderer', ['Alphabet', 'Beta']]] as const) {
  test(`TreeSelect preserves the existing Native tooltip boundary for ${id}`, async ({ page }) => {
    const source = reference.observations.find(entry => entry.sample.id === id)!;
    const tags = source.initial.view.tags.map((tag, index) =>
      index < titles.length ? { ...tag, title: titles[index] } : tag);
    await mount(page, id);

    await expect.poll(() => read(page)).toEqual({
      ...source.initial, view: { ...source.initial.view, tags }
    });
  });
}

test('TreeSelect hidden tags remain in FormData, Backspace and clear while callbacks retain full labels', async ({ page }) => {
  await mount(page, 'count-zero');
  const form = page.getByRole('form', { name: 'Tree tag native form', exact: true });
  const values = () => form.evaluate((node: HTMLFormElement) => new FormData(node).getAll('tree-tags'));
  expect(await values()).toEqual(['0', '1', 'locked', 'tail']);
  await input(page).press('Backspace');
  expect(await values()).toEqual(['0', '1', 'locked']);
  const events = (await read(page)).events;
  expect(events[0]).toMatchObject({ kind: 'change', value: [0, 1, 'locked'],
    labels: ['Alphabet', 'Beta', 'Locked'] });
  await input(page).press('Backspace');
  await input(page).press('Backspace');
  expect(await values()).toEqual(['locked']);
  await page.getByRole('button', { name: 'Очистить', exact: true }).click();
  expect(await values()).toEqual([]);
  await expect(input(page)).toBeFocused();
});

test('TreeSelect responsive hiding transfers remove focus and preserves explicit outside focus', async ({ page }) => {
  await mount(page, 'responsive-400');
  expect(await page.locator('.ant-select-selection-item').first().textContent())
    .toBe(reference.cases.find(entry => entry.sample.id === 'responsive-400')!.initial.view.tags[0].text);
  const editor = await input(page).elementHandle();
  await page.getByRole('button', { name: 'Удалить Tail', exact: true }).focus();
  await page.getByRole('button', { name: 'Narrow tree tags', exact: true }).dispatchEvent('click');

  await expect(input(page)).toBeFocused();
  expect(await editor!.evaluate(node => node.isConnected)).toBe(true);
  await expect(page.getByRole('button', { name: 'Удалить Tail', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Widen tree tags', exact: true }).dispatchEvent('click');
  await page.getByRole('button', { name: 'Удалить Tail', exact: true }).focus();
  const outside = page.getByRole('textbox', { name: 'Tree tag outside draft', exact: true });
  await page.getByRole('button', { name: 'Narrow tree tags', exact: true }).evaluate(node => {
    (node as HTMLButtonElement).click();
    document.querySelector<HTMLInputElement>('[aria-label="Tree tag outside draft"]')!.focus();
  });
  await expect(outside).toBeFocused();
  expect((await read(page)).events).toEqual([]);
});

test('TreeSelect cancels retained custom-tag close messages on a newer open and on unmount', async ({ page }) => {
  await mount(page, 'renderer');
  const tag = page.locator('[data-tree-choice-custom-tag]').first();
  await tag.locator('[data-tree-tag-label]').click();
  await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
  await page.evaluate(() => {
    const Native = MessageChannel;
    const probe = { closed: 0, jobs: [] as (() => void)[], Native };
    Reflect.set(window, 'treeTagChannelProbe', probe);
    window.MessageChannel = class extends Native {
      constructor() {
        super();
        for (const port of [this.port1, this.port2]) {
          const close = port.close.bind(port);
          port.close = () => { probe.closed++; close(); };
        }
        this.port2.postMessage = () => {
          const port = this.port1;
          const callback = port.onmessage;
          probe.jobs.push(() => callback?.call(port, new MessageEvent('message')));
        };
      }
    };
  });
  await tag.dispatchEvent('mousedown');
  await input(page).click();
  expect(await page.evaluate(() => {
    const probe = Reflect.get(window, 'treeTagChannelProbe');
    probe.jobs.shift()();
    return probe.closed;
  })).toBe(2);
  await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
  await tag.dispatchEvent('mousedown');
  const before = (await read(page)).events;
  await page.getByRole('button', { name: 'Toggle tree tag mount', exact: true }).dispatchEvent('click');
  await expect(input(page)).toHaveCount(0);
  const closed = await page.evaluate(() => {
    const probe = Reflect.get(window, 'treeTagChannelProbe');
    probe.jobs.shift()();
    window.MessageChannel = probe.Native;
    return probe.closed;
  });

  expect(closed).toBe(4);
  expect(JSON.parse(await page.locator('[data-tree-tag-events]').innerText())).toEqual(before);
  await expect(page.locator('[data-tree-tag-refs]')).toHaveText('false:false');
  await expect(page.locator('.ant-select-dropdown')).toHaveCount(0);
});
