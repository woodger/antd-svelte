import type { Locator } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tooltip-lifecycle-reference.json' with { type: 'json' };
import type { TooltipLifecycleCase } from './fixtures/tooltip-lifecycle.types';

const cases = reference.cases as readonly TooltipLifecycleCase[];

async function sendEvent(trigger: Locator, name: string) {
  if (name === 'focus') await trigger.focus();
  else if (name === 'blur') await trigger.evaluate(node => (node as HTMLElement).blur());
  else if (name === 'click') await trigger.evaluate(node => (node as HTMLElement).click());
  else if (name === 'contextMenu') {
    await trigger.dispatchEvent('contextmenu', { bubbles: true, cancelable: true });
  } else {
    await trigger.locator('..').dispatchEvent(name === 'enter' ? 'pointerenter' : 'pointerleave', {
      pointerType: 'mouse'
    });
  }
}

for (const source of [false, true]) {
  for (const sample of cases) {
    test(`Tooltip follows pinned ${sample.name} in ${source ? 'source' : 'native'} theme`,
      async ({ page }) => {
        await page.goto('/?fixture=tooltip-lifecycle');
        await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
        await page.getByLabel('Tooltip lifecycle case', { exact: true }).selectOption(sample.name);
        await page.clock.install();
        const popup = page.locator('[data-ant-tooltip]');
        const content = popup.locator('[data-ant-tooltip-container]');
        const trigger = page.getByRole('button', { name: 'Lifecycle trigger', exact: true });
        const original = await popup.elementHandle();
        let generatedId: string | undefined;

        for (const [index, frame] of sample.frames.entries()) {
          if (index) {
            await page.getByRole('button', { name: 'Next lifecycle step', exact: true })
              .evaluate(node => (node as HTMLButtonElement).click());
            if (frame.action.kind === 'event') await sendEvent(trigger, frame.action.event!);
            if (frame.action.kind === 'advance') await page.clock.runFor(frame.action.ms!);
          }
          await page.clock.runFor(100);
          const expected = frame.snapshot;

          if (expected.visible) await expect(popup).toBeVisible();
          else await expect(popup).toBeHidden();
          if (expected.contentMounted) await expect(content).toHaveText(expected.text ?? '');
          else if (frame.props.destroyOnHidden) await expect(content).toBeEmpty();
          await expect(page.getByLabel('Lifecycle events', { exact: true }))
            .toHaveText(JSON.stringify(expected.events));
          expect(await trigger.evaluate(node => node.classList.contains('ant-tooltip-open')))
            .toBe(expected.openClass);

          if (expected.zIndex !== null) {
            const nativeTokenBoundary = !source && frame.props.tokenZIndex !== undefined
              && frame.props.zIndex == null;
            await expect(popup).toHaveCSS('z-index', nativeTokenBoundary ? '1070' : expected.zIndex);
            expect(await popup.evaluate(node => (node as HTMLElement).style.zIndex))
              .toBe(expected.inlineZIndex);
          }
          // Native shell и его доступное описание существуют также при закрытом popup.
          const described = !frame.props.disabled && Boolean(frame.props.title.trim());
          const id = await popup.getAttribute('id');
          const description = described
            ? [...new Set(['existing-description', ...id!.split(/\s+/).filter(Boolean)])].join(' ')
            : 'existing-description';
          await expect(trigger).toHaveAttribute('aria-describedby', description);
          if (expected.visible) {
            expect(await trigger.evaluate(
              (node, popupId) =>
                (node.getAttribute('aria-describedby') ?? '').split(/\s+/).includes(popupId),
              id!
            )).toBe(expected.described);
          }
          if (expected.contentMounted && expected.id !== '<generated>') {
            await expect(popup).toHaveAttribute('id', expected.id!);
          } else if (expected.id === '<generated>' || !frame.props.id) {
            generatedId ??= id!;
            expect(id).toBe(generatedId);
            expect(id).toMatch(/^ant-tooltip-/);
          }
          await expect.poll(async () => Number(await page
            .getByLabel('Lifecycle getter calls', { exact: true }).textContent()) > 0)
            .toBe(expected.getterUsed);
          if (expected.portal) {
            expect(await popup.evaluate(node => node.parentElement?.id))
              .toBe('lifecycle-container');
          }
          expect(await popup.evaluate((node, before) => node === before, original)).toBe(true);
        }
      });
  }

  test(`Tooltip removes delayed work and portals on unmount in ${source ? 'source' : 'native'} theme`,
    async ({ page }) => {
      await page.goto('/?fixture=tooltip-lifecycle');
      await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
      await page.getByLabel('Tooltip lifecycle case', { exact: true })
        .selectOption('disabled-pending-hover');
      await page.clock.install();
      await sendEvent(page.getByRole('button', { name: 'Lifecycle trigger', exact: true }), 'enter');
      await page.getByLabel('Mount lifecycle tooltip', { exact: true }).uncheck();
      await page.clock.runFor(1500);

      await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[]');
      await expect(page.getByLabel('Lifecycle ref', { exact: true })).toHaveText('empty');
      await expect(page.locator('[data-ant-tooltip]')).toHaveCount(0);
      await expect(page.locator('#lifecycle-container')).toBeEmpty();
    });

  for (const sample of reference.consumers) {
    test(`${sample.mode} forwards Tooltip lifecycle props in ${source ? 'source' : 'native'} theme`,
      async ({ page }) => {
        await page.goto('/?fixture=tooltip-lifecycle');
        await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
        await page.getByLabel('Lifecycle consumer', { exact: true }).selectOption(sample.mode);
        await page.clock.install();
        const root = page.locator('#tooltip-lifecycle-consumers');
        const trigger = sample.mode === 'typography' ? root.locator('.ant-typography')
          : root.getByRole('slider').first();

        for (const [index, frame] of sample.frames.entries()) {
          if (index) {
            await page.getByRole('button', { name: 'Next consumer step', exact: true })
              .evaluate(node => (node as HTMLButtonElement).click());
            if (frame.action.kind === 'event') {
              if (sample.mode === 'typography') {
                await trigger.dispatchEvent(frame.action.event === 'show'
                  ? 'mouseenter' : 'mouseleave');
                await trigger.dispatchEvent(frame.action.event === 'show'
                  ? 'pointerenter' : 'pointerleave', { pointerType: 'mouse' });
              } else if (frame.action.event === 'show') await trigger.focus();
              else await trigger.evaluate(node => (node as HTMLElement).blur());
            }
          }
          await page.clock.runFor(200);

          const popups = page.locator('[data-ant-tooltip]');
          await expect(page.locator('[data-ant-tooltip]:popover-open'))
            .toHaveCount(frame.snapshot.visibleCount);
          // Native active-range сохраняет один shell ещё до выбора ручки.
          for (const popup of await popups.all()) {
            await expect(popup.locator('[data-ant-tooltip-container]'))
              .toHaveText(frame.snapshot.texts[0] ?? '');
            await expect(popup).toHaveAttribute('id', frame.props.id);
            await expect(popup).toHaveCSS('z-index', String(frame.props.zIndex));
          }
          expect(await popups.count()).toBeGreaterThan(0);
        }
      });
  }

  test(`Tooltip preserves drafts and resets destroyed forced content in ${source ? 'source' : 'native'} theme`,
    async ({ page }) => {
      await page.goto('/?fixture=tooltip-lifecycle');
      await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
      await page.getByLabel('Lifecycle consumer', { exact: true }).selectOption('state');
      const popup = page.locator('[data-ant-tooltip]');
      const draft = popup.getByLabel('Lifecycle draft', { exact: true });
      const original = await popup.elementHandle();
      await draft.fill('Kept draft');
      await popup.getByRole('button', { name: 'Lifecycle count', exact: true }).click();
      const before = await draft.elementHandle();
      await draft.focus();
      await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 6));

      async function update(name: string, checked: boolean) {
        await page.getByLabel(name, { exact: true }).evaluate((node, value) => {
          const control = node as HTMLInputElement;
          control.checked = value;
          control.dispatchEvent(new Event('change', { bubbles: true }));
        }, checked);
      }

      await update('State lifecycle ID and layer', true);
      await expect(popup).toHaveAttribute('id', 'state-changed');
      await expect(popup).toHaveCSS('z-index', '1600');
      await expect(draft).toBeFocused();
      expect(await draft.evaluate(node => [
        (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
      ])).toEqual([1, 6]);
      await update('State lifecycle disabled', true);
      await expect(popup).toBeHidden();
      await expect(draft).toHaveValue('Kept draft');
      await update('State lifecycle disabled', false);
      await expect(popup).toBeVisible();
      expect(await draft.evaluate((node, old) => node === old, before)).toBe(true);
      await update('State lifecycle open', false);
      await expect(popup).toBeHidden();
      await expect(draft).toHaveValue('Kept draft');
      await update('State lifecycle force', false);
      await expect(draft).toHaveCount(0);
      await update('State lifecycle force', true);
      await expect(popup).toBeHidden();
      await expect(draft).toHaveValue('Draft');
      await expect(popup.locator('button')).toHaveText('0');
      expect(await popup.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(page.getByLabel('State lifecycle events', { exact: true })).toHaveText('[]');
    });

  test(`Tooltip preserves caller description ownership when IDs change in ${source ? 'source' : 'native'} theme`,
    async ({ page }) => {
      await page.goto('/?fixture=tooltip-lifecycle');
      await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
      await page.getByLabel('Tooltip lifecycle case', { exact: true }).selectOption('custom-id');
      const trigger = page.getByRole('button', { name: 'Lifecycle trigger', exact: true });
      const popup = page.locator('[data-ant-tooltip]');
      const original = await trigger.elementHandle();
      await trigger.focus();
      await page.getByLabel('Existing description ID', { exact: true }).evaluate(node => {
        const input = node as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect(popup).toHaveAttribute('id', 'existing-description');
      await expect(trigger).toHaveAttribute('aria-describedby', 'existing-description');
      await page.getByLabel('Existing description ID', { exact: true }).evaluate(node => {
        const input = node as HTMLInputElement;
        input.checked = false;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await expect(trigger).toHaveAttribute('aria-describedby', 'existing-description first-tooltip-id');
      await expect(trigger).toBeFocused();
      expect(await trigger.evaluate((node, before) => node === before, original)).toBe(true);
    });
}
