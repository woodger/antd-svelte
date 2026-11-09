import { test, expect } from './test';
import reference from './fixtures/ant-design-descriptions-breakpoints-reference.json' with { type: 'json' };
import { snapshotDescriptionsBreakpoints } from './descriptions-breakpoints-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Descriptions responsive tokens match Source ${entry.sample.id}/${entry.scope}`,
    async ({ page }) => {
      await page.goto('/?fixture=descriptions-breakpoints');
      await page.getByRole('combobox', { name: 'Descriptions breakpoint sample', exact: true })
        .selectOption(String(index));

      for (const frame of entry.result) {
        await page.setViewportSize({ width: frame.width, height: 1200 });

        await expect.poll(() => page.evaluate(snapshotDescriptionsBreakpoints))
          .toEqual(frame.layout);
      }
    });
}

test('Descriptions token updates apply current queries while retaining the first editor and ref',
  async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1200 });
    await page.goto('/?fixture=descriptions-breakpoints');
    await page.getByRole('checkbox', { name: 'Live Descriptions breakpoints', exact: true }).check();
    const root = page.locator('.fixture-descriptions-breakpoints');
    const input = page.getByRole('textbox', { name: 'Descriptions responsive draft', exact: true });
    await input.fill('Retained draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5, 'backward'));
    const oldRoot = await root.elementHandle();
    const oldInput = await input.elementHandle();
    await expect.poll(() => page.evaluate(snapshotDescriptionsBreakpoints))
      .toEqual(reference.live.initial);

    await page.getByRole('button', { name: 'Update Descriptions breakpoints', exact: true })
      .dispatchEvent('click');

    for (const frame of reference.live.fresh) {
      await page.setViewportSize({ width: frame.width, height: 1200 });

      // Raw Source update оставляет старые queries; public fresh mount даёт актуальную раскладку.
      await expect.poll(() => page.evaluate(snapshotDescriptionsBreakpoints)).toEqual(frame.layout);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue(reference.live.updated.value);
      expect(await input.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection]))
        .toEqual(reference.live.updated.selection);
      await expect(page.getByLabel('Descriptions responsive ref', { exact: true }))
        .toHaveText('true');
      expect(await page.getByRole('form', { name: 'Descriptions responsive form', exact: true })
        .evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
        .toBe('Retained draft');
    }

    await page.setViewportSize({ width: 800, height: 1200 });
    await page.getByRole('button', { name: 'Update Descriptions breakpoints', exact: true })
      .dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotDescriptionsBreakpoints))
      .toEqual(reference.live.initial);
    await expect(input).toBeFocused();
  });

test('Descriptions replaces custom queries and removes all media listeners after unmount',
  async ({ page }) => {
    await page.addInitScript(() => {
      const active = new Map<MediaQueryList, Set<unknown>>();
      const original = window.matchMedia;
      const counter = { count: () => [...active.values()].reduce((sum, set) => sum + set.size, 0) };
      Object.assign(window, { descriptionsMedia: counter });
      window.matchMedia = function (query) {
        const media = original.call(this, query);
        const add = media.addEventListener;
        const remove = media.removeEventListener;
        const listeners = new Set<unknown>();
        active.set(media, listeners);
        media.addEventListener = new Proxy(add, {
          apply(target, receiver, args) {
            const [type, listener] = args;
            if (type === 'change') listeners.add(listener);

            return Reflect.apply(target, receiver, args);
          }
        });
        media.removeEventListener = new Proxy(remove, {
          apply(target, receiver, args) {
            const [type, listener] = args;
            if (type === 'change') listeners.delete(listener);

            return Reflect.apply(target, receiver, args);
          }
        });
        return media;
      };
    });
    await page.goto('/?fixture=descriptions-breakpoints');
    const count = () => page.evaluate(() => (window as unknown as {
      descriptionsMedia: { count: () => number };
    }).descriptionsMedia.count());
    await expect.poll(count).toBe(7);
    await page.getByRole('checkbox', { name: 'Live Descriptions breakpoints', exact: true }).check();
    await page.getByRole('button', { name: 'Update Descriptions breakpoints', exact: true }).click();

    await expect.poll(count).toBe(7);
    await page.getByRole('checkbox', { name: 'Source Descriptions breakpoints', exact: true })
      .uncheck();
    await expect.poll(count).toBe(7);
    await page.getByRole('checkbox', { name: 'Mount responsive Descriptions', exact: true })
      .uncheck();

    await expect.poll(count).toBe(0);
    await page.setViewportSize({ width: 639, height: 1200 });
    await expect(page.locator('.fixture-descriptions-breakpoints')).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Mount responsive Descriptions', exact: true }).check();
    await expect.poll(count).toBe(7);
    await expect(page.getByRole('textbox', { name: 'Descriptions responsive draft', exact: true }))
      .toHaveValue('Draft');
  });
