import type { Locator } from '@playwright/test';
import { test, expect } from './test';
import registry from 'antd-svelte/porting/registry.json' with { type: 'json' };
import reference from './fixtures/ant-design-float-back-top-motion-reference.json' with {
  type: 'json'
};

async function snapshotFrame(node: Locator, time: number) {
  return node.evaluate((element, currentTime) => {
    const animation = element.getAnimations()[0];
    if (!(animation?.effect instanceof KeyframeEffect)) throw new Error('Fade is missing');
    animation.currentTime = currentTime;
    const style = getComputedStyle(element);

    return {
      opacity: style.opacity,
      transform: style.transform,
      duration: animation.effect.getTiming().duration,
      easing: animation.effect.getTiming().easing,
      transformAnimated: animation.effect.getKeyframes().some(frame => 'transform' in frame)
    };
  }, time);
}

test('FloatButtonBackTop retains source linear opacity and user transform through enter and leave',
  async ({ page }) => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    await page.goto('/?fixture=float-button');
    await page.evaluate(() => {
      const animate = Element.prototype.animate;
      // Приостанавливаем настоящий WAAPI в момент создания, до первого кадра.
      Element.prototype.animate = function (this: Element, frames, options) {
        const animation = animate.call(this, frames, options);
        if (this.id === 'fixture-back-top') animation.pause();
        return animation;
      };
    });
    await page.addStyleTag({ content: `#fixture-back-top{transform:${reference.transform}}` });
    await page.getByRole('button', { name: 'Scroll floating target', exact: true }).click();
    const back = page.locator('#fixture-back-top');
    await back.waitFor({ state: 'attached' });
    const expected = (sample: typeof reference.enter) => ({
      opacity: sample.opacity,
      transform: sample.transform,
      duration: sample.timing.duration,
      easing: sample.timing.easing,
      transformAnimated: sample.frames.some(frame => 'transform' in frame)
    });

    expect(await snapshotFrame(back, reference.enter.time)).toEqual(expected(reference.enter));

    await back.evaluate(node => node.getAnimations()[0].finish());
    await expect.poll(() => back.evaluate(node => node.getAnimations().length)).toBe(0);
    await page.locator('#float-scroll').evaluate(node => { node.scrollTop = 0; });
    await expect.poll(() => back.evaluate(node => node.getAnimations().length)).toBe(1);

    expect(await snapshotFrame(back, reference.leave.time)).toEqual(expected(reference.leave));

    await back.evaluate(node => node.getAnimations()[0].finish());

    await expect(back).toHaveCount(0);
  });
