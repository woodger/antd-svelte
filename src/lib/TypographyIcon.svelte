<script lang="ts">
  import { typographyIcons } from './typography-icons';
  let { name, class: className }: {
    name: keyof typeof typographyIcons;
    class?: string;
  } = $props();
</script>

<style>
  span { display: inline-flex; align-items: center; color: inherit; font-style: normal; line-height: 0; vertical-align: -0.125em; text-align: center; text-transform: none; }
  svg { display: inline-block; width: 1em; height: 1em; fill: currentColor; }
  .loading { animation: typography-spin 1s linear infinite; }
  @keyframes typography-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .loading { animation-duration: 2s; } }
</style>

<span class={['anticon', `anticon-${name}`, className]} aria-hidden="true">
  <svg viewBox={typographyIcons[name].viewBox} focusable="false" class:loading={name === 'loading'}>
    <path d={typographyIcons[name].path} />
  </svg>
</span>
