export function readUploadTriggerStructure() {
  const host = document.querySelector('[data-upload-trigger-host]')!;

  return {
    inputs: [...host.querySelectorAll<HTMLInputElement>('input[type=file]')].map(node => ({
      id: node.getAttribute('id'), disabled: node.disabled
    })),
    selectCount: host.querySelectorAll('.ant-upload-select').length,
    dragCount: host.querySelectorAll('.ant-upload-drag').length,
    buttons: [...host.querySelectorAll('button')].map(node => node.textContent),
    selects: [...host.querySelectorAll('.ant-upload-select')].map(node => ({
      display: getComputedStyle(node).display,
      hiddenClass: node.classList.contains('ant-upload-hidden')
    }))
  };
}

export function readUploadTriggerMotion(prefix: string) {
  const node = document.querySelector(`[data-upload-trigger-host] .${prefix}-select`)!;

  return {
    classes: [...node.classList].filter(name => /-animate-inline(?:-|$)/.test(name)),
    display: getComputedStyle(node).display,
    pointerEvents: getComputedStyle(node).pointerEvents,
    inputId: node.querySelector('input')!.getAttribute('id'),
    buttons: [...node.querySelectorAll('button')].map(button => button.textContent),
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
