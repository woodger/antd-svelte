import type { HTMLAttributes } from 'svelte/elements';

const events = {
  onClick: 'onclick',
  onDoubleClick: 'ondblclick',
  onContextMenu: 'oncontextmenu',
  onMouseDown: 'onmousedown',
  onMouseUp: 'onmouseup',
  onMouseMove: 'onmousemove',
  onMouseOver: 'onmouseover',
  onMouseOut: 'onmouseout',
  onMouseEnter: 'onmouseenter',
  onMouseLeave: 'onmouseleave',
  onKeyDown: 'onkeydown',
  onKeyUp: 'onkeyup',
  onKeyPress: 'onkeypress',
  onFocus: 'onfocusin',
  onBlur: 'onfocusout',
  onPointerDown: 'onpointerdown',
  onPointerUp: 'onpointerup',
  onPointerMove: 'onpointermove',
  onPointerOver: 'onpointerover',
  onPointerOut: 'onpointerout',
  onPointerEnter: 'onpointerenter',
  onPointerLeave: 'onpointerleave',
  onPointerCancel: 'onpointercancel',
  onGotPointerCapture: 'ongotpointercapture',
  onLostPointerCapture: 'onlostpointercapture',
  onTouchStart: 'ontouchstart',
  onTouchMove: 'ontouchmove',
  onTouchEnd: 'ontouchend',
  onTouchCancel: 'ontouchcancel',
  onWheel: 'onwheel',
  onScroll: 'onscroll',
  onCopy: 'oncopy',
  onCut: 'oncut',
  onPaste: 'onpaste',
  onSelect: 'onselect',
  onDrag: 'ondrag',
  onDragStart: 'ondragstart',
  onDragEnd: 'ondragend',
  onDragEnter: 'ondragenter',
  onDragLeave: 'ondragleave',
  onDragOver: 'ondragover',
  onDrop: 'ondrop',
  onCompositionStart: 'oncompositionstart',
  onCompositionUpdate: 'oncompositionupdate',
  onCompositionEnd: 'oncompositionend',
  onInput: 'oninput',
  onChange: 'onchange',
  onBeforeInput: 'onbeforeinput',
  onInvalid: 'oninvalid',
  onSubmit: 'onsubmit',
  onReset: 'onreset',
  onAnimationStart: 'onanimationstart',
  onAnimationEnd: 'onanimationend',
  onAnimationIteration: 'onanimationiteration',
  onTransitionEnd: 'ontransitionend',
  onLoad: 'onload',
  onError: 'onerror',
  onToggle: 'ontoggle'
} as const satisfies Record<string, keyof HTMLAttributes<HTMLDivElement>>;

type NativeAttributes = HTMLAttributes<HTMLDivElement>;
/** Native DOM events; camelCase aliases и capture сохраняют Svelte delegation. */
export type CollapseItemEvents = {
  [Name in keyof typeof events]?: NativeAttributes[typeof events[Name]];
} & {
  [Name in keyof typeof events as `${Name}Capture`]?: NativeAttributes[typeof events[Name]];
};

const componentProps = new Set([
  'key', 'label', 'header', 'children', 'extra', 'collapsible', 'showArrow', 'forceRender',
  'destroyOnHidden', 'headerClass', 'class', 'style', 'classNames', 'styles', 'onItemClick',
  'prefixCls', 'nativeElement', 'ref'
]);

export function collapseItemAttributes(item: object) {
  const attributes: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(item)) {
    if (componentProps.has(name)) continue;

    const capture = name.endsWith('Capture');
    const alias = capture ? name.slice(0, -7) : name;
    const native = events[alias as keyof typeof events];
    attributes[native ? `${native}${capture ? 'capture' : ''}` : name] = value;
  }

  return attributes;
}
