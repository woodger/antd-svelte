<script lang="ts">
  import { statusIcons } from './status-icons';
  import { useDesignTokenContext } from './theme-context.svelte';

  let { name }: {
    name:
    'down'
    | 'left'
    | 'right'
    | 'close'
    | 'check'
    | 'loading'
    | 'filter'
    | 'search'
    | 'warning'
    | 'plus'
    | 'minus'
    | keyof typeof statusIcons;
  } = $props();
  let statusPath = $derived(
    name in statusIcons ? statusIcons[name as keyof typeof statusIcons] : undefined
  );
  // Пять filled status icons из icons-svg 4.6.0 используют fitted viewBox; legacy размер сохранён.
  const designTokens = useDesignTokenContext();
</script>

<style>
  svg { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
  .loading { animation: ant-svelte-spin 1s linear infinite; }
  @keyframes ant-svelte-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .loading { animation-duration: 2s; } }
</style>

<svg
  viewBox={statusPath
    ? designTokens.enabled ? '64 64 896 896' : '0 0 1024 1024'
    : '0 0 24 24'}
  fill={statusPath ? 'currentColor' : 'none'}
  fill-rule={name === 'close-circle-filled' ? 'evenodd' : undefined}
  stroke={statusPath ? 'none' : 'currentColor'}
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
  class:loading={name === 'loading'}
>
  {#if statusPath}
    <path d={statusPath} />
  {:else if name === 'down'}
    <path d="m6 9 6 6 6-6" />
  {:else if name === 'left'}
    <path d="m15 6-6 6 6 6" />
  {:else if name === 'right'}
    <path d="m9 6 6 6-6 6" />
  {:else if name === 'close'}
    <path d="m6 6 12 12M6 18 18 6" />
  {:else if name === 'check'}
    <path d="m5 12 4 4L19 6" />
  {:else if name === 'plus'}
    <path d="M5 12h14M12 5v14" />
  {:else if name === 'minus'}
    <path d="M5 12h14" />
  {:else if name === 'filter'}
    <path d="M4 5h16l-6 7v6l-4 2v-8z" />
  {:else if name === 'search'}
    <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" />
  {:else if name === 'warning'}
    <circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" />
  {:else}
    <path d="M21 12a9 9 0 1 1-9-9" />
  {/if}
</svg>
