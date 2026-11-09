export function readUploadMotionItems(prefix = 'ant') {
  return [...document.querySelectorAll(`[data-motion-host] .${prefix}-upload-list-item-container`)]
    .map(node => ({
      name: node.querySelector(`.${prefix}-upload-list-item-name`)?.textContent ?? '',
      motionClasses: [...node.classList].filter(value => /-animate(?:-inline)?-/.test(value)),
      height: (node as HTMLElement).style.height || null,
      opacity: (node as HTMLElement).style.opacity || null,
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
    }));
}
