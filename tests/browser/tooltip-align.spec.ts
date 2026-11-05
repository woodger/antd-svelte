import { test, expect } from './test';
import { snapshotTooltipAlignment } from './tooltip-align-metrics';
import type { TooltipAlignmentHost } from './fixtures/tooltip-align.types';
import reference from './fixtures/ant-design-tooltip-align-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1024, height: 800 } });

for (const source of [false, true]) {
  for (const sample of reference.cases) {
    test(`Tooltip alignment matches pinned ${sample.name} in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=tooltip-align');
        await page.getByLabel('Source alignment config', { exact: true }).evaluate((node, checked) => {
          const control = node as HTMLInputElement;
          control.checked = checked;
          control.dispatchEvent(new Event('change', { bubbles: true }));
        }, source);
        await page.getByLabel('Tooltip alignment case', { exact: true }).selectOption(sample.name);
        const root = page.locator('#tooltip-align-case');
        const popup = page.locator('[data-ant-tooltip]');
        await expect(popup).toBeVisible();
        const expected = ({ calls: _calls, ...snapshot }: typeof sample.initial) => snapshot;
        await expect.poll(() => page.evaluate(snapshotTooltipAlignment))
          .toEqual(expected(sample.initial));
        await expect(page.getByLabel('Alignment calls', { exact: true }))
          .toHaveText(String(sample.initial.calls));

        const result = await root.evaluate(async node => {
          const host = node as TooltipAlignmentHost;
          const before = host.alignCalls;
          host.tooltipRef!.forceAlign();
          await Promise.resolve();
          return host.alignCalls - before;
        });
        expect(result).toBe(sample.manual.delta);
        const batched = await root.evaluate(async node => {
          const host = node as TooltipAlignmentHost;
          const before = host.alignCalls;
          host.tooltipRef!.forceAlign();
          host.tooltipRef!.forceAlign();
          await Promise.resolve();
          return host.alignCalls - before;
        });
        expect(batched).toBe(sample.batchDelta);

        if (sample.patch) {
          const input = page.getByLabel('Alignment draft', { exact: true });
          await input.fill('Kept alignment draft');
          await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));
          const original = await input.elementHandle();
          await page.getByRole('button', { name: 'Change alignment props', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());
          await root.evaluate(node => (node as TooltipAlignmentHost).tooltipRef!.forceAlign());

          await expect.poll(() => page.evaluate(snapshotTooltipAlignment))
            .toEqual(expected(sample.changed!));
          await expect(input).toHaveValue('Kept alignment draft');
          await expect(input).toBeFocused();
          expect(await input.evaluate((node, before) => node === before, original)).toBe(true);
          expect(await input.evaluate((node: HTMLInputElement) => [
            node.selectionStart, node.selectionEnd
          ])).toEqual([2, 7]);
        }
      });
  }

  test(`Tooltip reports popup resize without coordinate changes in ${source ? 'source' : 'native'} config`,
    async ({ page }) => {
      const sample = reference.cases.find(item => item.name === 'resize-without-offset')!;
      await page.goto('/?fixture=tooltip-align');
      await page.getByLabel('Source alignment config', { exact: true }).evaluate((node, checked) => {
        const control = node as HTMLInputElement;
        control.checked = checked;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      }, source);
      await page.getByLabel('Tooltip alignment case', { exact: true })
        .selectOption('resize-without-offset');
      const root = page.locator('#tooltip-align-case');
      const popup = page.locator('[data-ant-tooltip]');
      await expect(popup).toBeVisible();
      await expect(page.getByLabel('Alignment calls', { exact: true }))
        .toHaveText(String(sample.initial.calls));
      const before = await popup.boundingBox();
      const calls = await root.evaluate(node => (node as TooltipAlignmentHost).alignCalls);
      await page.getByRole('button', { name: 'Resize alignment popup', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());

      await expect(popup).toHaveCSS('width', '180px');
      await expect.poll(() => root.evaluate(node => (node as TooltipAlignmentHost).alignCalls))
        .toBe(calls + sample.resize!.delta);
      const after = await popup.boundingBox();
      expect([after!.x, after!.y]).toEqual([before!.x, before!.y]);
    });
}

for (const mode of ['single', 'range', 'pinned', 'typography']) {
  test(`${mode} Tooltip forwards custom align, placements and callback without replacing DOM`,
    async ({ page }) => {
      await page.goto('/?fixture=tooltip-align');
      await page.getByLabel('Alignment consumer mode', { exact: true }).selectOption(mode);
      const root = page.locator('#alignment-consumers');
      const anchor = mode === 'typography' ? root.locator('.ant-typography')
        : mode === 'single' ? root.getByRole('slider') : root.locator('.ant-slider-handle').first();
      if (mode !== 'typography') await root.getByRole('slider').first().focus();
      await anchor.hover();
      const popups = root.locator('[data-ant-tooltip]:not([hidden])');
      await expect(popups).toHaveCount(mode === 'pinned' ? 2 : 1);
      const before = await popups.evaluateAll(nodes => nodes.map(node => ({
        id: node.id, x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y
      })));
      const originals = await popups.elementHandles();

      await page.getByRole('button', { name: 'Shift consumer alignment', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());

      await expect.poll(() => popups.evaluateAll((nodes, previous) => nodes.map((node, index) => ({
        id: node.id, x: node.getBoundingClientRect().x - previous[index].x,
        y: node.getBoundingClientRect().y - previous[index].y
      })), before)).toEqual(before.map(node => ({ id: node.id, x: 24, y: 30 })));
      for (const [index, original] of originals.entries()) {
        expect(await popups.nth(index).evaluate((node, before) => node === before, original)).toBe(true);
      }
      await expect(page.getByLabel('Consumer alignment payload', { exact: true }))
        .toHaveText(JSON.stringify({ points: ['bc', 'tc'], offset: [24, 18], dynamicInset: true }));
      if (mode !== 'typography') await expect(root.getByRole('slider').first()).toBeFocused();
    });
}
