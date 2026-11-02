import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-motion-reference.json' with { type: 'json' };
import type { TabsMotionTrace } from './fixtures/tabs-motion-presets';

interface MotionStep {
  key: string;
  status: string;
  step: string;
  duration: string;
  property: string;
  position: string;
  color: string;
}
interface MotionCapture {
  steps: MotionStep[];
  original: Element;
  observer?: MutationObserver;
}

async function check(page: Page, name: string, checked: boolean) {
  await page.getByLabel(name, { exact: true }).evaluate((element, value) => {
    const input = element as HTMLInputElement;
    input.checked = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

async function stable(page: Page) {
  await expect.poll(() => page.locator('#tabs-motion-main').evaluate(root =>
    !Array.from(root.querySelectorAll('[role=tabpanel]')).some(node =>
      /-(?:appear|enter|leave)-(?:prepare|start|active)/.test(node.className)))).toBe(true);
}

async function snapshot(page: Page) {
  return page.locator('#tabs-motion-main').evaluate(root => ({
    inkAnimated: root.querySelector('.ant-tabs-ink-bar')!.classList
      .contains('ant-tabs-ink-bar-animated'),
    inkDuration: getComputedStyle(root.querySelector('.ant-tabs-ink-bar')!).transitionDuration,
    bodyAnimated: root.querySelector('.ant-tabs-body')!.classList.contains('ant-tabs-body-animated'),
    visible: Array.from(root.querySelectorAll<HTMLElement>('[role=tabpanel]'))
      .filter(node => node.getClientRects().length).map(node => node.dataset.tabsKey),
    values: Array.from(root.querySelectorAll('input'), input => [input.name, input.value]),
    contentStyles: Array.from(root.querySelectorAll('input'), input => {
      const panel = input.closest('[role=tabpanel]')!;
      const css = getComputedStyle(panel);
      return [input.name, css.color,
        Array.from(panel.classList).filter(name => name === 'event-pane' || name.startsWith('p-')),
        Object.fromEntries(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderLeftWidth']
          .map(name => [name, css[name as keyof CSSStyleDeclaration]]))];
    })
  }));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tabs-motion');
});

for (const sample of reference.cases) {
  test(`pane motion and callbacks match the official source for ${sample.name}`, async ({ page }) => {
    await check(page, 'Mount motion Tabs', false);
    await page.getByLabel('Tabs motion reference', { exact: true }).selectOption(sample.name);
    await check(page, 'Mount motion Tabs', true);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await stable(page);

    expect(await snapshot(page)).toEqual(sample.initial);
    await page.evaluate(() => {
      const root = document.getElementById('tabs-motion-main')!;
      const original = root.querySelector<HTMLInputElement>('input[name=alpha]')!;
      original.value = 'Retained draft';
      const capture: MotionCapture = { steps: [], original };
      Reflect.set(window, 'tabsMotionTrace', []);
      Reflect.set(window, 'tabsMotionCapture', capture);
      const seen = new Set<string>();
      capture.observer = new MutationObserver(() => {
        for (const node of root.querySelectorAll<HTMLElement>('[role=tabpanel]')) {
          const match = /(?:ant-tabs-switch|tabs-motion-custom|deadline-pane)-(appear|enter|leave)-(prepare|start|active)/.exec(node.className);
          if (!match) continue;
          const key = node.dataset.tabsKey!;
          const marker = [key, match[1], match[2]].join(':');
          if (seen.has(marker)) continue;
          seen.add(marker);
          const css = getComputedStyle(node);
          capture.steps.push({
            key,
            status: match[1],
            step: match[2],
            duration: css.transitionDuration,
            property: css.transitionProperty,
            position: css.position,
            color: css.color
          });
        }
      });
      capture.observer.observe(root, {
        attributes: true,
        subtree: true,
        childList: true,
        attributeFilter: ['class', 'style']
      });
    });
    await page.locator('#tabs-motion-main').getByRole('tab', { name: 'Beta', exact: true }).click();
    await stable(page);
    const capture = () => page.evaluate(() => {
      const state = Reflect.get(window, 'tabsMotionCapture') as MotionCapture;
      return {
        steps: state.steps,
        trace: Reflect.get(window, 'tabsMotionTrace') as TabsMotionTrace[],
        retained: state.original.isConnected
      };
    });

    await expect.poll(() => snapshot(page)).toEqual(sample.snapshot);
    const expected = {
      steps: sample.steps,
      trace: sample.trace,
      retained: sample.retained
    };
    if (sample.name === 'deadline') {
      const byPane = <T extends { phase: string; visible?: boolean; key?: string | null; }>(
        trace: readonly T[]
      ) => ['alpha', 'beta'].map(key =>
        trace.filter(event => event.phase === 'visible'
          ? event.visible === (key === 'beta') : event.key === key));
      // В upstream два независимых deadline timers тоже не гарантируют межпанельный порядок.
      await expect.poll(async () => {
        const actual = await capture();
        return { ...actual, trace: byPane(actual.trace) };
      }).toEqual({ ...expected, trace: byPane(expected.trace) });
    } else await expect.poll(capture).toEqual(expected);
    await page.evaluate(() => {
      (Reflect.get(window, 'tabsMotionCapture') as MotionCapture).observer?.disconnect();
    });
  });
}

async function configure(page: Page, name: string) {
  await page.getByLabel('Tabs motion reference', { exact: true }).selectOption(name);
  await stable(page);
  await page.getByRole('button', { name: 'Reset motion observation', exact: true })
    .evaluate(element => (element as HTMLButtonElement).click());
}

test('outgoing content keeps its draft, state and FormData until leave ends', async ({ page }) => {
  await configure(page, 'enabled');
  const root = page.locator('#tabs-motion-main');
  const alpha = page.getByRole('textbox', { name: 'alpha motion draft', exact: true });
  const original = await alpha.elementHandle();
  await alpha.fill('Retained transition draft');
  await page.getByRole('button', { name: 'Increment alpha motion', exact: true }).click();
  await alpha.focus();
  await page.getByRole('button', { name: 'Hide motion Alpha', exact: true })
    .evaluate(element => (element as HTMLButtonElement).click());
  const panel = root.locator('[role=tabpanel][data-tabs-key=alpha]');
  await expect(panel).toHaveClass(/ant-tabs-switch-leave-active/);
  await panel.evaluate(element => {
    for (const animation of element.getAnimations()) animation.pause();
  });

  await expect(panel).toHaveAttribute('aria-hidden', 'true');
  await expect(panel).toHaveAttribute('inert', '');
  await expect(root.getByRole('tab', { name: 'Beta', exact: true })).toBeFocused();
  await expect(panel.locator('input[name=alpha]')).toHaveValue('Retained transition draft');
  await expect(panel.locator('output')).toHaveText('1');
  expect(await page.locator('#tabs-motion-form').evaluate(element =>
    Array.from(new FormData(element as HTMLFormElement).keys()))).toEqual(['alpha', 'beta']);
  await expect(page.getByLabel('Tabs motion lifecycle', { exact: true }))
    .toHaveText('["mount:beta"]');

  await panel.evaluate(element => {
    for (const animation of element.getAnimations()) animation.play();
  });
  await stable(page);

  await expect(root.locator('input[name=alpha]')).toHaveCount(0);
  await expect(page.getByLabel('Tabs motion lifecycle', { exact: true }))
    .toHaveText('["mount:beta","destroy:alpha"]');
  await expect(page.getByLabel('Tabs motion changes', { exact: true })).toHaveText('[]');
  await root.getByRole('tab', { name: 'Alpha', exact: true }).click();
  await stable(page);

  await expect(alpha).toHaveValue('alpha initial');
  expect(await alpha.evaluate((node, previous) => node === previous, original)).toBe(false);
  await expect(root.locator('[data-tabs-key=alpha][role=tabpanel] output')).toHaveText('0');
});

test('reversing an unfinished leave preserves the same pane instance and draft', async ({ page }) => {
  await configure(page, 'enabled');
  const root = page.locator('#tabs-motion-main');
  const alpha = page.getByRole('textbox', { name: 'alpha motion draft', exact: true });
  await alpha.fill('Reversed draft');
  await page.getByRole('button', { name: 'Increment alpha motion', exact: true }).click();
  const original = await alpha.elementHandle();
  await root.getByRole('tab', { name: 'Beta', exact: true }).click();
  await expect(root.locator('[role=tabpanel][data-tabs-key=alpha]'))
    .toHaveClass(/ant-tabs-switch-leave-active/);
  await root.getByRole('tab', { name: 'Alpha', exact: true })
    .evaluate(element => (element as HTMLButtonElement).click());
  await stable(page);

  await expect(alpha).toHaveValue('Reversed draft');
  expect(await alpha.evaluate((node, previous) => node === previous, original)).toBe(true);
  await expect(root.locator('[role=tabpanel][data-tabs-key=alpha] output')).toHaveText('1');
  await expect(page.getByLabel('Tabs motion lifecycle', { exact: true }))
    .not.toContainText('destroy:alpha');
  await expect(page.getByLabel('Tabs motion changes', { exact: true }))
    .toHaveText('["beta","alpha"]');
});

test('async prepare keeps content mounted and ignores its completion after unmount', async ({ page }) => {
  await configure(page, 'prepare');
  await check(page, 'Hold motion prepare', true);
  const root = page.locator('#tabs-motion-main');
  await root.getByRole('tab', { name: 'Beta', exact: true }).click();
  await expect(root.locator('[role=tabpanel][data-tabs-key=alpha]'))
    .toHaveClass(/tabs-motion-custom-leave-prepare/);
  await expect(root.locator('input[name=alpha]')).toHaveCount(1);
  await expect(page.getByLabel('Tabs motion lifecycle', { exact: true }))
    .not.toContainText('destroy:alpha');
  const outside = page.getByRole('textbox', { name: 'Motion Tabs outside', exact: true });
  await outside.focus();
  await check(page, 'Mount motion Tabs', false);
  const before = await page.evaluate(() => Reflect.get(window, 'tabsMotionTrace'));
  await page.getByRole('button', { name: 'Resolve motion prepare', exact: true })
    .evaluate(element => (element as HTMLButtonElement).click());
  await page.evaluate(() => new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))));

  await expect(root).toHaveCount(0);
  await expect(outside).toBeFocused();
  expect(await page.evaluate(() => Reflect.get(window, 'tabsMotionTrace'))).toEqual(before);
});

test('end=false retains the motion until an allowed end from each pane itself', async ({ page }) => {
  await configure(page, 'custom-motion');
  await check(page, 'Allow motion end', false);
  const root = page.locator('#tabs-motion-main');
  const panel = root.locator('[role=tabpanel][data-tabs-key=alpha]');
  await root.getByRole('tab', { name: 'Beta', exact: true }).click();
  await expect.poll(() => page.evaluate(() =>
    (Reflect.get(window, 'tabsMotionTrace') as TabsMotionTrace[])
      .filter(event => event.phase !== 'visible' && event.step === 'end').length)).toBe(2);

  await expect(panel).toHaveClass(/tabs-motion-custom-leave-active/);
  await expect(panel.locator('input')).toHaveCount(1);
  await check(page, 'Allow motion end', true);
  await panel.locator('input').evaluate(element => {
    element.dispatchEvent(new TransitionEvent('transitionend', {
      bubbles: true,
      propertyName: 'opacity'
    }));
  });

  await expect(panel).toHaveClass(/tabs-motion-custom-leave-active/);
  await root.locator('[role=tabpanel]').evaluateAll(elements => {
    for (const element of elements) element.dispatchEvent(new TransitionEvent('transitionend', {
      bubbles: true,
      propertyName: 'opacity'
    }));
  });
  await stable(page);

  await expect(root.locator('input[name=alpha]')).toHaveCount(0);
  await expect(root.locator('input[name=beta]')).toHaveCount(1);
});

test('reduced motion and live disabling settle transitions without losing active focus', async ({ page }) => {
  await configure(page, 'enabled');
  const root = page.locator('#tabs-motion-main');
  await root.getByRole('tab', { name: 'Beta', exact: true }).click();
  await expect(root.locator('[role=tabpanel][data-tabs-key=alpha]'))
    .toHaveClass(/ant-tabs-switch-leave-active/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await stable(page);

  await expect(root.locator('input[name=alpha]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await root.getByRole('tab', { name: 'Alpha', exact: true }).click();
  const alpha = page.getByRole('textbox', { name: 'alpha motion draft', exact: true });
  await alpha.focus();
  const original = await alpha.elementHandle();
  await check(page, 'Enable Tabs animation', false);
  await stable(page);

  await expect(alpha).toBeFocused();
  expect(await alpha.evaluate((node, previous) => node === previous, original)).toBe(true);
  await expect(root.locator('input[name=beta]')).toHaveCount(0);
  await expect(root.locator('.ant-tabs-body')).not.toHaveClass(/ant-tabs-body-animated/);
  await expect(root.locator('.ant-tabs-ink-bar')).not.toHaveClass(/ant-tabs-ink-bar-animated/);
});

test('changing item panel styles preserves the focused draft and leaves headers untouched', async ({ page }) => {
  await configure(page, 'pane-after-semantic');
  const root = page.locator('#tabs-motion-main');
  const panel = root.locator('[role=tabpanel][data-tabs-key=alpha]');
  const draft = page.getByRole('textbox', { name: 'alpha motion draft', exact: true });
  await draft.fill('Styled panel draft');
  await page.getByRole('button', { name: 'Increment alpha motion', exact: true }).click();
  await draft.focus();
  await draft.evaluate(element => (element as HTMLInputElement).setSelectionRange(2, 8));
  const previous = await draft.elementHandle();

  await expect(panel).toHaveCSS('color', 'rgb(40, 50, 60)');
  await expect(panel).toHaveCSS('padding-left', '17px');
  await check(page, 'Apply pane item styles', false);

  await expect(panel).toHaveCSS('color', 'rgb(10, 20, 30)');
  await expect(panel).toHaveCSS('padding-left', '3px');
  await expect(panel).not.toHaveClass(/p-alpha/);
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Styled panel draft');
  expect(await draft.evaluate((node, original) => node === original, previous)).toBe(true);
  expect(await draft.evaluate(element => [
    (element as HTMLInputElement).selectionStart,
    (element as HTMLInputElement).selectionEnd
  ])).toEqual([2, 8]);
  await expect(panel.locator('output')).toHaveText('1');
  await expect(root.getByRole('tab', { name: 'Alpha', exact: true })).not.toHaveClass(/p-alpha/);
  await expect(page.getByLabel('Tabs motion changes', { exact: true })).toHaveText('[]');
  await expect(page.getByLabel('Tabs motion lifecycle', { exact: true })).toHaveText('[]');
  await check(page, 'Apply pane item styles', true);

  await expect(panel).toHaveClass(/p-alpha/);
  await expect(panel).toHaveCSS('color', 'rgb(40, 50, 60)');
  await expect(draft).toBeFocused();
});

test('motion styles stay above live item styles and restore the current semantic layer afterward', async ({ page }) => {
  await configure(page, 'pane-hook-styles');
  const root = page.locator('#tabs-motion-main');
  const alpha = root.locator('[role=tabpanel][data-tabs-key=alpha]');
  const beta = root.locator('[role=tabpanel][data-tabs-key=beta]');
  await root.getByRole('tab', { name: 'Beta', exact: true }).click();
  await expect(alpha).toHaveClass(/tabs-motion-custom-leave-active/);
  await alpha.evaluate(element => {
    for (const animation of element.getAnimations()) animation.pause();
  });

  await expect(alpha).toHaveCSS('color', 'rgb(200, 30, 40)');
  await expect(alpha).toHaveCSS('padding-left', '17px');
  await check(page, 'Apply pane item styles', false);

  await expect(alpha).toHaveCSS('color', 'rgb(200, 30, 40)');
  await expect(alpha).toHaveCSS('padding-left', '3px');
  await expect(alpha).not.toHaveClass(/p-alpha/);
  await expect(alpha).toHaveClass(/tabs-motion-custom-leave-active/);
  await alpha.evaluate(element => {
    for (const animation of element.getAnimations()) animation.play();
  });
  await stable(page);

  await expect(beta).toHaveCSS('color', 'rgb(10, 20, 30)');
  await expect(beta).not.toHaveClass(/p-beta/);
  await expect(root.getByRole('tab', { name: 'Beta', exact: true })).toBeFocused();
  await expect(page.getByLabel('Tabs motion changes', { exact: true })).toHaveText('["beta"]');
});
