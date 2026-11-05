import { test, expect } from './test';
import type { PopoverRefFixtureElement } from './fixtures/popover-ref-fixture.types';
import reference from './fixtures/ant-design-popover-ref-reference.json' with { type: 'json' };

test.use({ viewport: reference.reference.viewport, reducedMotion: 'reduce' });

for (const source of [false, true]) {
  for (const sample of reference.cases) {
    test(`Popover ref follows pinned ${sample.name} lifecycle in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-ref');
        await page.getByLabel('Source ref config', { exact: true }).setChecked(source);
        await page.getByLabel('Popover ref case', { exact: true }).selectOption(sample.name);
        const root = page.locator('#popover-ref-case');
        let original: string | null = null;

        for (const [index, frame] of sample.frames.entries()) {
          if (index) await root.getByRole('button', { name: 'Next ref step', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());
          await expect(page.getByLabel('Ref step', { exact: true })).toHaveText(String(index));
          await expect.poll(() => root.evaluate(node => {
            const host = node as PopoverRefFixtureElement;
            const api = host.popupRef;
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
            const popup = page.locator('[data-ant-popover]');
            if (frame.open) await expect(popup).toBeVisible();
            else {
              await expect(popup).toBeHidden();
              const style = await popup.getAttribute('style');
              await root.evaluate(node => (node as PopoverRefFixtureElement).popupRef?.forceAlign());
              await expect(popup).toBeHidden();
              expect(await popup.getAttribute('style')).toBe(style);
            }
            const id = await popup.getAttribute('id');
            if (original === null) original = id;
            expect(id).toBe(original);
            expect(await root.evaluate(node => {
              const api = (node as PopoverRefFixtureElement).popupRef;
              return api?.popupElement?.isConnected && api.popupElement.tagName === 'DIV'
                && api.popupElement === document.querySelector('[data-ant-popover]');
            })).toBe(true);
            if (index) expect(await root.evaluate(node => {
              const host = node as PopoverRefFixtureElement;
              return host.popupRef === host.savedPopupRef;
            })).toBe(true);

            if (index === 1) {
              await page.getByLabel('Lifecycle draft', { exact: true }).fill('Kept ref draft');
              await page.getByLabel('Lifecycle count', { exact: true })
                .evaluate(node => (node as HTMLButtonElement).click());
            } else if (index === 3) {
              await expect(page.getByLabel('Lifecycle draft', { exact: true }))
                .toHaveValue(sample.destroy ? 'Draft' : 'Kept ref draft');
              await expect(page.getByLabel('Lifecycle count', { exact: true }))
                .toHaveText(sample.destroy ? '0' : '1');
            }
          } else {
            await root.evaluate(node => (node as PopoverRefFixtureElement).savedPopupRef?.forceAlign());
            await expect(page.locator('[data-ant-popover]')).toHaveCount(0);
            expect(await root.evaluate(node => {
              const saved = (node as PopoverRefFixtureElement).savedPopupRef;
              return [saved?.nativeElement, saved?.popupElement];
            })).toEqual([undefined, undefined]);
          }
          await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[]');
        }
      });

    for (const observe of [false, true]) {
      test(`Popover forceAlign moves pinned ${sample.name} with frames paused and callback ${observe} in ${source ? 'source' : 'native'} config`,
        async ({ page }) => {
          await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
          await page.goto('/?fixture=popover-ref');
          await page.getByLabel('Source ref config', { exact: true }).setChecked(source);
          await page.getByLabel('Popover ref case', { exact: true }).selectOption(sample.name);
          await page.getByLabel('Observe ref alignment', { exact: true }).setChecked(observe);
          await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1000));
          const root = page.locator('#popover-ref-case');
          await root.getByRole('button', { name: 'Next ref step', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());
          const popup = page.locator('[data-ant-popover]');
          await expect(popup).toBeVisible();
          const previous = await popup.elementHandle();
          const draft = page.getByLabel('Lifecycle draft', { exact: true });
          await draft.fill('Preserved by forceAlign');
          await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 8));

          const movement = await root.evaluate(async node => {
            const host = node as PopoverRefFixtureElement;
            const api = host.popupRef!;
            const popup = api.popupElement!;
            const trigger = api.nativeElement as HTMLElement | SVGElement;
            const before = popup.getBoundingClientRect().x;
            const calls = host.alignCalls;
            trigger.style.marginLeft = '80px';
            const beforeForce = popup.getBoundingClientRect().x - before;
            api.forceAlign();
            await Promise.resolve();
            return {
              beforeForce,
              afterForce: popup.getBoundingClientRect().x - before,
              callbacks: host.alignCalls - calls
            };
          });

          expect(movement).toEqual({
            beforeForce: sample.alignment.beforeForce,
            afterForce: sample.alignment.delta,
            callbacks: observe ? sample.alignment.callbacks : 0
          });
          const batch = await root.evaluate(async node => {
            const host = node as PopoverRefFixtureElement;
            const before = host.alignCalls;
            host.popupRef!.forceAlign();
            host.popupRef!.forceAlign();
            host.popupRef!.forceAlign();
            await Promise.resolve();
            return host.alignCalls - before;
          });
          expect(batch).toBe(observe ? sample.batchDelta : 0);
          expect(await popup.evaluate((node, old) => node === old, previous)).toBe(true);
          await expect(draft).toHaveValue('Preserved by forceAlign');
          await expect(draft).toBeFocused();
          expect(await draft.evaluate((node: HTMLInputElement) => [
            node.selectionStart, node.selectionEnd
          ])).toEqual([2, 8]);
          await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[]');
        });
    }
  }

  for (const mode of ['popover', 'popconfirm']) {
    test(`${mode} ref tracks replacement and portal nodes without leaking effect dependencies in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        const sample = reference.cases.find(item => item.mode === mode && item.kind === 'button'
          && !item.destroy)!;
        await page.goto('/?fixture=popover-ref');
        await page.getByLabel('Source ref config', { exact: true }).setChecked(source);
        await page.getByLabel('Popover ref case', { exact: true }).selectOption(sample.name);
        const root = page.locator('#popover-ref-case');
        await root.getByRole('button', { name: 'Next ref step', exact: true })
          .evaluate(node => (node as HTMLButtonElement).click());
        const draft = page.getByLabel('Lifecycle draft', { exact: true });
        await draft.fill('Ref portal draft');
        await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 8));
        const previous = await page.locator('[data-ref-trigger]').elementHandle();
        const popup = await page.locator('[data-ant-popover]').elementHandle();
        await page.getByLabel('Replace ref trigger', { exact: true }).dispatchEvent('click');

        await expect.poll(() => root.evaluate(node => (node as PopoverRefFixtureElement)
          .popupRef?.nativeElement?.tagName)).toBe(sample.replacement.snapshot.native);
        expect(await previous!.evaluate(node => node.isConnected)).toBe(false);
        expect(await root.evaluate((node, previous) => (node as PopoverRefFixtureElement)
          .popupRef?.popupElement === previous, popup)).toBe(sample.replacement.samePopup);
        await expect(draft).toBeFocused();
        await page.getByLabel('Ref body container', { exact: true }).dispatchEvent('click');

        await expect(page.locator('body > [data-ant-popover]')).toBeVisible();
        expect(await root.evaluate((node, previous) => (node as PopoverRefFixtureElement)
          .popupRef?.popupElement === previous, popup)).toBe(true);
        await expect(draft).toHaveValue('Ref portal draft');
        await expect(draft).toBeFocused();
        expect(await draft.evaluate((node: HTMLInputElement) => [
          node.selectionStart, node.selectionEnd
        ])).toEqual([2, 8]);
        await page.getByLabel('Ref align effect', { exact: true }).dispatchEvent('click');

        await expect(page.getByLabel('Ref effect calls', { exact: true })).toHaveText('1');
        await page.getByRole('button', { name: 'Update ref title', exact: true })
          .evaluate(node => (node as HTMLButtonElement).click());
        await expect(page.locator('[data-ant-popover]')).toContainText('Updated ref content');
        await expect(page.getByLabel('Ref effect calls', { exact: true })).toHaveText('1');
        for (const step of [2, 3]) {
          await root.getByRole('button', { name: 'Next ref step', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());

          await expect(page.getByLabel('Ref step', { exact: true })).toHaveText(String(step));
          await expect(page.getByLabel('Ref effect calls', { exact: true })).toHaveText('1');
        }
        await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[]');
      });
  }

  test(`Popconfirm forceAlign preserves a pending confirmation in ${source ? 'source' : 'native'} config`,
    async ({ page }) => {
      await page.goto('/?fixture=popover-ref');
      await page.getByLabel('Source ref config', { exact: true }).setChecked(source);
      await page.getByLabel('Popover ref case', { exact: true })
        .selectOption('popconfirm-button-destroy-false');
      const root = page.locator('#popover-ref-case');
      await root.getByRole('button', { name: 'Next ref step', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());
      const popup = page.locator('[data-ant-popover]');
      const previous = await popup.elementHandle();
      const draft = page.getByLabel('Lifecycle draft', { exact: true });
      await draft.fill('Pending ref draft');
      await page.getByRole('button', { name: 'Confirm via ref', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());

      await expect(page.getByRole('button', { name: 'Confirm via ref', exact: true })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Cancel via ref', exact: true })).toBeDisabled();
      const focusTarget = page.locator('[data-ant-popconfirm-content]');
      await expect(focusTarget).toBeFocused();
      await root.evaluate(async node => {
        const api = (node as PopoverRefFixtureElement).popupRef!;
        (api.nativeElement as HTMLElement).style.marginLeft = '80px';
        api.forceAlign();
        await Promise.resolve();
      });

      expect(await popup.evaluate((node, old) => node === old, previous)).toBe(true);
      await expect(popup).toBeVisible();
      await expect(draft).toHaveValue('Pending ref draft');
      await expect(focusTarget).toBeFocused();
      await expect(page.getByLabel('Ref confirmation calls', { exact: true })).toHaveText('1');
      await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[]');
      await page.getByRole('button', { name: 'Resolve ref confirmation', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());

      await expect(popup).toBeHidden();
      await expect(page.getByLabel('Ref events', { exact: true })).toHaveText('[false]');
      await expect(page.locator('[data-ref-trigger]')).toBeFocused();
    });
}
