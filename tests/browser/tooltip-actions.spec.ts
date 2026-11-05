import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tooltip-actions-reference.json' with { type: 'json' };
import type { TooltipActionCase } from './fixtures/tooltip-actions.types';

const cases = reference.cases as readonly TooltipActionCase[];

async function pauseClock(page: Page) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
}

async function send(page: Page, mode: TooltipActionCase['mode'], event: string) {
  return page.locator('#tooltip-lifecycle-case').evaluate((host, { mode, event }) => {
    const trigger = host.querySelector<HTMLElement>('#lifecycle-trigger')!;
    if (event === 'focus') trigger.focus();
    else if (event === 'focusOutside') {
      host.querySelector<HTMLButtonElement>('button')!.focus();
    }
    else if (event === 'blur') trigger.blur();
    else if (event === 'click') trigger.click();
    else if (event === 'touch') {
      trigger.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
    } else if (event === 'contextMenu') {
      trigger.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    } else if (event === 'escape') {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape', bubbles: true, cancelable: true
      }));
    } else if (event.startsWith('outside')) {
      document.body.dispatchEvent(event === 'outsidePointer'
        ? new PointerEvent('pointerdown', { bubbles: true })
        : new MouseEvent(event === 'outsideContext' ? 'contextmenu' : 'mousedown', { bubbles: true }));
    } else if (event.startsWith('popup')) {
      document.querySelector('[data-ant-tooltip]')?.dispatchEvent(new PointerEvent(
        event === 'popupEnter' ? 'pointerenter' : 'pointerleave', { pointerType: 'mouse' }
      ));
    } else {
      const target = mode === 'tooltip' ? trigger.parentElement! : trigger;
      if (mode === 'typography') {
        trigger.dispatchEvent(new MouseEvent(event === 'enter' ? 'mouseenter' : 'mouseleave'));
      }
      target.dispatchEvent(new PointerEvent(event === 'enter' ? 'pointerenter' : 'pointerleave', {
        pointerType: 'mouse'
      }));
    }
    return (host as HTMLElement & { tooltipEvents: readonly boolean[]; }).tooltipEvents;
  }, { mode, event });
}

for (const source of [false, true]) {
  for (const sample of cases) {
    test(`${sample.name} follows pinned actions in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=tooltip-actions');
        await page.getByLabel('Source action config', { exact: true }).setChecked(source);
        await page.getByLabel('Tooltip action case', { exact: true }).selectOption(sample.name);
        await pauseClock(page);
        const popup = page.locator('[data-ant-tooltip]');
        const trigger = page.locator('#lifecycle-trigger');
        await page.clock.runFor(300);

        for (const [index, frame] of sample.frames.entries()) {
          if (index) {
            await page.getByRole('button', { name: 'Next lifecycle step', exact: true })
              .evaluate(node => (node as HTMLButtonElement).click());
            if (frame.action.kind === 'event') {
              const immediate = await send(page, sample.mode, frame.action.event!);
              // Без relatedTarget native blur ждёт microtask, чтобы исключить удаление DOM.
              const expected = frame.action.event === 'blur'
                ? sample.frames[index - 1].snapshot.events : frame.syncEvents;
              expect(immediate).toEqual(expected);
              if (frame.action.event === 'blur') {
                const afterMicrotask = await page.locator('#tooltip-lifecycle-case')
                  .evaluate(node => (node as HTMLElement & {
                    tooltipEvents: readonly boolean[];
                  }).tooltipEvents);
                expect(afterMicrotask).toEqual(frame.syncEvents);
              }
            } else if (frame.action.kind === 'advance') await page.clock.runFor(frame.action.ms!);
          }
          await page.clock.runFor(100);

          if (frame.snapshot.visible) await expect(popup).toBeVisible();
          else await expect(popup).toBeHidden();
          await expect(page.getByLabel('Lifecycle events', { exact: true }))
            .toHaveText(JSON.stringify(frame.snapshot.events));
          expect(await trigger.evaluate(node => node.classList.contains('ant-tooltip-open')))
            .toBe(frame.snapshot.openClass);
        }
      });
  }

  for (const mode of ['tooltip', 'typography'] as const) {
    for (const pending of [true, false]) {
      test(`${mode} disposes ${pending ? 'pending' : 'visible'} focus without late callbacks in ${source ? 'source' : 'native'} config`,
        async ({ page }) => {
          await page.goto('/?fixture=tooltip-actions');
          await page.getByLabel('Source action config', { exact: true }).setChecked(source);
          const name = pending ? 'focus-delay-without-hide' : 'focus-delays-independent';
          await page.getByLabel('Tooltip action case', { exact: true })
            .selectOption(`${mode}-${name}`);
          const expected = reference.cleanup.find(item => item.mode === mode
            && item.pending === pending)!;
          expect(cases.find(item => item.name === `${mode}-${name}`)!.frames[0].props)
            .toEqual(expected.props);
          await pauseClock(page);
          expect(await send(page, mode, 'focus')).toEqual(expected.focused);
          await page.getByLabel('Mount lifecycle tooltip', { exact: true }).evaluate(node => {
            const control = node as HTMLInputElement;
            control.checked = false;
            control.dispatchEvent(new Event('change', { bubbles: true }));
          });
          await page.clock.runFor(1500);

          await expect(page.getByLabel('Lifecycle events', { exact: true }))
            .toHaveText(JSON.stringify(expected.settled));
          await expect(page.locator('[data-ant-tooltip]')).toHaveCount(expected.popupCount);
        });
    }
  }

  test(`independent actions preserve Svelte binding in ${source ? 'source' : 'native'} config`,
    async ({ page }) => {
      await page.goto('/?fixture=tooltip-actions');
      await page.getByLabel('Source action config', { exact: true }).setChecked(source);
      await page.getByLabel('Tooltip action binding', { exact: true }).check();
      const trigger = page.getByRole('button', { name: 'Bound action trigger', exact: true });
      const bound = page.getByLabel('Bound action open', { exact: true });
      const events = page.getByLabel('Bound action events', { exact: true });
      const popup = page.locator('[data-ant-tooltip]');

      await trigger.focus();

      await expect(bound).toHaveText('true');
      await expect(events).toHaveText('[true]');
      await expect(popup).toBeVisible();
      await trigger.press('Enter');

      await expect(bound).toHaveText('false');
      await expect(events).toHaveText('[true,false]');
      await expect(popup).toBeHidden();
      await page.getByLabel('Bound Tooltip open', { exact: true }).check();

      await expect(bound).toHaveText('true');
      await expect(events).toHaveText('[true,false]');
      await expect(popup).toBeVisible();
      await trigger.focus();
      await trigger.press('Enter');

      await expect(bound).toHaveText('false');
      await expect(events).toHaveText('[true,false,false]');
      await expect(popup).toBeHidden();
    });
}
