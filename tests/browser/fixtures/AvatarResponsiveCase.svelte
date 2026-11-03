<script lang="ts">
  import { Avatar, AvatarGroup, ConfigProvider, theme, type AvatarGroupItem } from 'antd-svelte';
  import type { AvatarResponsiveCase } from './avatar-responsive-presets';
  let {
    sample,
    mode = 'case',
    shifted = false,
    dark = false,
    text = 'AVATAR'
  }: {
    sample: AvatarResponsiveCase;
    mode?: 'case' | 'numeric' | 'empty' | 'new-map';
    shifted?: boolean;
    dark?: boolean;
    text?: string;
  } = $props();
  const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#1677ff"/></svg>');
  let size = $derived.by(() => {
    if (mode === 'numeric') return 48;
    if (mode === 'empty') return {};
    if (mode === 'new-map') return { xs: 30, md: 55, xxxl: 130 };
    if (typeof sample.size !== 'object') return sample.size;
    const value = { ...sample.size };
    for (const key of sample.undefinedSize ?? []) value[key] = undefined;
    return value;
  });
  const items: readonly AvatarGroupItem[] = [
    { key: 'a', label: 'First avatar', text: 'AVATAR' },
    { key: 'b', label: 'Empty avatar', size: { md: 52, xxl: 70 } },
    { key: 'c', label: 'Icon avatar', size: 'small', icon },
    { key: 'd', label: 'Last avatar', size: {}, text: 'D' }
  ];
  let errors = $state(0);
</script>

{#snippet icon()}<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>{/snippet}
{#snippet content()}{text}{/snippet}
<ConfigProvider componentSize={sample.context} theme={{
  mode: dark ? 'dark' : 'light',
  token: { motion: false, ...sample.token, ...(shifted ? { screenSM: 650 } : {}) },
  algorithm: sample.compact ? theme.compactAlgorithm : undefined,
  components: sample.aliases ? { Avatar: sample.aliases } : undefined
}}>
  <div id="avatar-responsive-surface">
    {#if sample.group}
      <AvatarGroup {items} {size} max={{ count: 2, popover: { trigger: 'click' } }} />
    {:else}
      <button type="button" aria-label="Responsive avatar owner">
        <Avatar {size} alt="Responsive avatar" children={sample.content === 'text' ? content : undefined}
          icon={sample.content === 'icon' ? icon : undefined}
          src={sample.content === 'image' ? image : undefined} onError={() => { errors++; }}
          style={sample.style ? 'width:73px;height:27px;font-size:9px' : undefined} />
      </button>
    {/if}
  </div>
</ConfigProvider>
<output aria-label="Responsive avatar errors">{errors}</output>
