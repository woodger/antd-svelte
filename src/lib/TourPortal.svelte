<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { useConfig } from './config-context';
  import { connectTourPortal } from './tour-portal.dom';
  import type { TourProps } from './tour.types';

  let {
    children,
    getPopupContainer,
    reference,
    popup = false,
    onReady
  }: {
    children: Snippet;
    getPopupContainer?: TourProps['getPopupContainer'];
    reference?: HTMLElement;
    popup?: boolean;
    onReady?: (ready: boolean) => void;
  } = $props();
  const config = useConfig();
  let origin: HTMLElement | undefined;
  let marker: Comment | undefined;

  onDestroy(() => {
    marker?.remove();
  });
</script>

<div class="ant-svelte-theme" style={`display:contents;${config.themeStyle ?? ''}`}
  data-ant-theme={config.theme.mode} data-ant-primary={config.theme.primary}
  data-ant-compact={config.theme.compact || undefined}
  {@attach element => {
    const getter = getPopupContainer;
    const trigger = popup ? reference : undefined;
    if (popup && !trigger) return;
    return untrack(() => {
      origin ??= element.parentElement ?? undefined;
      if (!origin) return;
      if (!marker) {
        marker = element.ownerDocument.createComment('tour-portal');
        origin.insertBefore(marker, element);
      }
      const dispose = connectTourPortal(element, {
        getPopupContainer: getter,
        reference: trigger,
        autoLock: !popup,
        origin,
        marker
      });
      onReady?.(true);
      return () => untrack(() => {
        onReady?.(false);
        dispose();
      });
    });
  }}>{@render children()}</div>
