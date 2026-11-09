export function readUploadProgressMotion(prefix: string) {
  const node = document.querySelector(`.${prefix}-list-item-progress`);
  if (!node) return null;
  const bar = node.querySelector('[role="progressbar"]');

  return {
    classes: [...node.classList].filter(name => /-fade(?:-|$)/.test(name)),
    bar: bar ? { value: bar.getAttribute('aria-valuenow'), label: bar.getAttribute('aria-label') } : null,
    animations: node.getAnimations().map(animation => {
      const effect = animation.effect;
      if (!(effect instanceof KeyframeEffect)) throw Error('Expected a DOM keyframe effect');

      return {
        kind: animation.constructor.name,
        keyframes: effect.getKeyframes().map(({ computedOffset: _computedOffset, ...frame }) => frame),
        duration: effect.getTiming().duration,
        easing: effect.getTiming().easing
      };
    })
  };
}
