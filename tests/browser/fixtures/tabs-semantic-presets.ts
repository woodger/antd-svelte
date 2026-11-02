import type {
  TabsConfig,
  TabsContent,
  TabsMoreProps,
  TabsProps,
  TabsSemanticProps,
  TabsSlots
} from 'antd-svelte';

interface UndefinedMarker { $type: string; }
interface SourceMore extends Omit<TabsMoreProps, 'icon' | 'overlayStyle' | 'overlayClassName'> {
  icon?: TabsContent | UndefinedMarker;
  overlayStyle?: Record<string, string | number | undefined> | UndefinedMarker;
  overlayClassName?: string | UndefinedMarker;
}
interface SourceSettings {
  addIcon?: TabsContent;
  removeIcon?: TabsContent;
  moreIcon?: TabsContent;
  indicator?: { size?: TabsProps['indicatorSize']; align?: string; };
  indicatorSize?: TabsProps['indicatorSize'];
  more?: SourceMore;
}
export interface TabsSemanticCase {
  name: string;
  mode?: string;
  placement?: string;
  size?: string;
  rtl?: boolean;
  defaultType?: boolean;
  defaultSize?: boolean;
  nested?: boolean;
  context?: SourceSettings;
  local?: SourceSettings;
}
export interface TabsSemanticTrace {
  scope: string;
  kind: string;
  size: TabsSemanticProps['size'] | null;
  placement: TabsSemanticProps['tabPlacement'] | null;
  type: TabsSemanticProps['type'] | null;
  items: number;
  normalized?: boolean;
}

function isUndefined(value: unknown): value is UndefinedMarker {
  return value !== null && typeof value === 'object' && '$type' in value
    && value.$type === 'undefined';
}

function more(input: SourceMore | undefined): TabsMoreProps | undefined {
  if (!input) return undefined;

  const { icon, overlayClassName, overlayStyle, ...rest } = input;
  const result: TabsMoreProps = { ...rest };
  if (Object.hasOwn(input, 'icon')) result.icon = isUndefined(icon) ? undefined : icon;
  if (Object.hasOwn(input, 'overlayClassName'))
    result.overlayClassName = isUndefined(overlayClassName) ? undefined : overlayClassName;
  if (Object.hasOwn(input, 'overlayStyle')) {
    result.overlayStyle = isUndefined(overlayStyle) || !overlayStyle ? undefined
      : Object.entries(overlayStyle)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, part => `-${part.toLowerCase()}`)}:${value}`)
        .join(';');
  }
  return result;
}

function indicator(input: SourceSettings['indicator']): TabsProps['indicator'] {
  if (!input) return undefined;
  const align = input.align;
  if (align !== undefined && align !== 'start' && align !== 'center' && align !== 'end')
    throw new Error(`Unknown indicator alignment: ${align}`);

  return { ...input, align };
}

export function tabsSemanticSettings(
  sample: TabsSemanticCase,
  report?: (info: TabsSemanticTrace) => void
) {
  let context: TabsConfig = {
    ...sample.context,
    more: more(sample.context?.more),
    indicator: indicator(sample.context?.indicator)
  };
  let local: Partial<TabsProps> = {
    ...sample.local,
    more: more(sample.local?.more),
    indicator: indicator(sample.local?.indicator)
  };
  if (sample.mode) {
    const classes = (prefix: string): TabsSlots => ({
      ...Object.fromEntries(['root', 'header', 'item', 'remove', 'indicator', 'body', 'content']
        .map(slot => [slot, `s-${prefix}-${slot}`])),
      popup: `s-${prefix}-popup`
    });
    context = {
      ...context,
      class: 's-context-plain',
      style: 'color:rgb(20,30,40)',
      classNames: classes('context'),
      styles: {
        root: 'color:rgb(10,20,30)',
        header: 'margin-bottom:13px',
        item: 'padding:4px 9px',
        remove: 'color:rgb(30,40,50)',
        indicator: 'background-color:rgb(40,50,60)',
        body: 'padding-top:5px',
        content: 'padding-left:7px',
        popup: { root: 'background-color:rgb(50,60,70)' }
      }
    };
    local = {
      ...local,
      class: 's-local-plain',
      rootClassName: 's-extra-root',
      popupClassName: 's-legacy-popup',
      style: 'color:rgb(40,50,60)',
      tabBarStyle: 'margin-bottom:3px',
      classNames: classes('local'),
      styles: {
        root: 'color:rgb(30,40,50)',
        item: 'padding:6px 11px',
        remove: 'color:rgb(60,70,80)',
        indicator: 'width:7px;transform:none',
        content: 'padding-left:11px',
        popup: { root: 'background-color:rgb(70,80,90)' }
      }
    };
    if (sample.mode === 'callbacks') for (const [scope, settings] of [
      ['context', context], ['local', local]
    ] as const) {
      const original = typeof settings.classNames === 'function' ? {} : settings.classNames ?? {};
      const originalStyles = typeof settings.styles === 'function' ? {} : settings.styles ?? {};
      const record = (kind: string, props: TabsSemanticProps) => report?.({
        scope,
        kind,
        size: props.size ?? null,
        placement: props.tabPlacement ?? null,
        type: props.type ?? null,
        items: props.items.length,
        normalized: props.items[1]?.destroyOnHidden
      });
      settings.classNames = ({ props }) => {
        record('classNames', props);
        return { ...original, root: `${original.root} s-${scope}-${props.size}-${props.tabPlacement ?? 'none'}` };
      };
      settings.styles = ({ props }) => {
        record('styles', props);
        return { ...originalStyles, root: `${originalStyles.root};font-size:${props.items.length + 11}px` };
      };
    }
  }
  return { context, local };
}
