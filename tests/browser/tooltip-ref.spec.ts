import { test, expect } from './test';
import type { TooltipRefFixtureElement } from './fixtures/tooltip-ref-fixture.types';
import reference from './fixtures/ant-design-tooltip-ref-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1000, height: 800 } });

for (const source of [false, true]) {
  for (const sample of reference.cases) {
    test(`Tooltip ref follows pinned ${sample.name} lifecycle in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=tooltip-ref');
        await page.getByLabel('Source ref config', { exact: true }).setChecked(source);
        await page.getByLabel('Tooltip ref case', { exact: true }).selectOption(sample.name);
        const root = page.locator('#tooltip-ref-case');
        let original: string | null = null;

        for (const [index, frame] of sample.frames.entries()) {
          if (index) await root.getByRole('button', { name: 'Next ref step', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());
          await expect(page.getByLabel('Ref step', { exact: true })).toHaveText(String(index));
          await expect.poll(() => root.evaluate(node => {
            const host = node as TooltipRefFixtureElement;
            const api = host.tooltipRef;
            return {
              exists: Boolean(api),
              align: typeof api?.forceAlign,
              native: api?.nativeElement?.tagName ?? null,
              nativeConnected: api?.nativeElement?.isConnected ?? null,
              matches: api?.nativeElement === host.querySelector('[data-ref-trigger]')
            };
          })).toEqual({
            exists: frame.snapshot.exists,
            align: frame.snapshot.align,
            native: frame.snapshot.native,
            nativeConnected: frame.snapshot.nativeConnected,
            matches: !frame.unmounted
          });

          if (!frame.unmounted) {
            const popup = page.locator('[data-ant-tooltip]');
            if (frame.open) await expect(popup).toBeVisible();
            else {
              await expect(popup).toBeHidden();
              const style = await popup.getAttribute('style');
              await root.evaluate(node => (node as TooltipRefFixtureElement).tooltipRef?.forceAlign());
              await expect(popup).toBeHidden();
              expect(await popup.getAttribute('style')).toBe(style);
            }
            const id = await popup.getAttribute('id');
            if (original === null) original = id;
            expect(id).toBe(original);
            expect(await root.evaluate(node => {
              const api = (node as TooltipRefFixtureElement).tooltipRef;
              return api?.popupElement?.isConnected && api.popupElement.tagName === 'SPAN'
                && api.popupElement === document.querySelector('[data-ant-tooltip]');
            })).toBe(true);
          } else {
            await root.evaluate(node => (node as TooltipRefFixtureElement)
              .savedTooltipRef?.forceAlign());
            await expect(page.locator('[data-ant-tooltip]')).toHaveCount(0);
          }
          await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[]');
        }
      });

    test(`Tooltip forceAlign moves pinned ${sample.name} geometry with animation frames paused in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
        await page.goto('/?fixture=tooltip-ref');
        await page.getByLabel('Source ref config', { exact: true }).setChecked(source);
        await page.getByLabel('Tooltip ref case', { exact: true }).selectOption(sample.name);
        await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1000));
        const root = page.locator('#tooltip-ref-case');
        await root.getByRole('button', { name: 'Next ref step', exact: true })
          .evaluate(node => (node as HTMLButtonElement).click());
        const popup = page.locator('[data-ant-tooltip]');
        await expect(popup).toBeVisible();
        const previous = await popup.elementHandle();
        const draft = page.getByLabel('Lifecycle draft', { exact: true });
        await draft.fill('Preserved by forceAlign');
        await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 8));

        const movement = await root.evaluate(async node => {
          const api = (node as TooltipRefFixtureElement).tooltipRef!;
          const popup = api.popupElement!;
          const trigger = api.nativeElement as HTMLElement | SVGElement;
          const before = popup.getBoundingClientRect().x;
          trigger.style.marginLeft = '80px';
          const beforeForce = popup.getBoundingClientRect().x - before;
          api.forceAlign();
          await Promise.resolve();
          return { beforeForce, afterForce: popup.getBoundingClientRect().x - before };
        });

        expect(Math.abs(movement.beforeForce)).toBeLessThan(0.1);
        expect(movement.afterForce).toBeCloseTo(sample.alignment.delta, 1);
        expect(await popup.evaluate((node, old) => node === old, previous)).toBe(true);
        await expect(draft).toHaveValue('Preserved by forceAlign');
        await expect(draft).toBeFocused();
        expect(await draft.evaluate((node: HTMLInputElement) => [
          node.selectionStart, node.selectionEnd
        ])).toEqual([2, 8]);
        await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[]');
      });
  }

  test(`Tooltip ref tracks replacement and portaled nodes without leaking effect dependencies in ${source ? 'source' : 'native'} config`,
    async ({ page }) => {
      await page.goto('/?fixture=tooltip-ref');
      await page.getByLabel('Source ref config', { exact: true }).setChecked(source);
      const root = page.locator('#tooltip-ref-case');
      await root.getByRole('button', { name: 'Next ref step', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());
      const previous = await page.locator('[data-ref-trigger]').elementHandle();
      await page.getByLabel('Replace ref trigger', { exact: true }).evaluate(node => {
        const control = node as HTMLInputElement;
        control.checked = true;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect.poll(() => root.evaluate(node => (node as TooltipRefFixtureElement)
        .tooltipRef?.nativeElement?.tagName)).toBe('A');
      expect(await previous!.evaluate(node => node.isConnected)).toBe(false);
      const popup = await page.locator('[data-ant-tooltip]').elementHandle();
      await page.getByLabel('Ref body container', { exact: true }).evaluate(node => {
        const control = node as HTMLInputElement;
        control.checked = true;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect(page.locator('body > [data-ant-tooltip]')).toBeVisible();
      expect(await root.evaluate((node, previous) => (node as TooltipRefFixtureElement)
        .tooltipRef?.popupElement === previous, popup)).toBe(true);

      await page.getByLabel('Ref align effect', { exact: true }).evaluate(node => {
        const control = node as HTMLInputElement;
        control.checked = true;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect(page.getByLabel('Ref effect calls', { exact: true })).toHaveText('1');
      await page.getByRole('button', { name: 'Update ref title', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());
      await expect(page.locator('[data-ant-tooltip]')).toContainText('Updated ref content');
      await expect(page.getByLabel('Ref effect calls', { exact: true })).toHaveText('1');
      await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[]');
    });
}
