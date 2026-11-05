import type { TooltipTrigger } from 'antd-svelte';

export interface TooltipLifecycleOptions {
  title: string;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  trigger?: TooltipTrigger | readonly TooltipTrigger[];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  fresh?: boolean;
  id?: string | null;
  zIndex?: number | null;
  rootZIndex?: number | null;
  overlayZIndex?: number | null;
  providerZIndex?: number | null;
  tokenZIndex?: number;
  portal?: boolean;
}

export interface TooltipLifecycleCase {
  name: string;
  frames: readonly {
    action: {
      kind: string;
      event?: string;
      ms?: number;
    };
    props: TooltipLifecycleOptions;
    snapshot: {
      visible: boolean;
      contentMounted: boolean;
      text: string | null;
      id: string | null;
      openClass: boolean;
      described: boolean;
      existingDescription: boolean;
      zIndex: string | null;
      inlineZIndex: string | null;
      portal: boolean;
      getterUsed: boolean;
      events: readonly boolean[];
    };
  }[];
}

export interface TooltipLifecycleConsumer {
  mode: string;
  frames: readonly {
    action: { kind: string; event?: string };
    props: Omit<TooltipLifecycleOptions, 'title'>;
    snapshot: {
      visibleCount: number;
      ids: readonly string[];
      zIndices: readonly string[];
      texts: readonly string[];
    };
  }[];
}
