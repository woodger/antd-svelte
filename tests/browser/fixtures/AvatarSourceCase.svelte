<script lang="ts">
  import { Avatar, AvatarGroup, ConfigProvider, Image, theme, type AvatarGroupItem } from 'antd-svelte';
  import type { AvatarSourceCase } from './avatar-source-presets';
  import AvatarSourceState from './AvatarSourceState.svelte';

  let {
    sample,
    larger = false,
    dark = false,
    sourceMode = 'case',
    decorated = false,
    named = true,
    attrsChanged = false,
    focusTrap = true
  }: {
    sample: AvatarSourceCase;
    larger?: boolean;
    dark?: boolean;
    sourceMode?: 'case' | 'string' | 'none';
    decorated?: boolean;
    named?: boolean;
    attrsChanged?: boolean;
    focusTrap?: boolean;
  } = $props();
  const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><rect width="64" height="32" fill="#1677ff"/></svg>');
  const fallbackImage = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><rect width="64" height="32" fill="#52c41a"/></svg>');
  let avatarErrors = $state(0);
  let ownErrors = $state(0);
  let previews = $state<boolean[]>([]);
  let revision = $state(0);
  let source = $derived(
    sourceMode === 'string' ? image : sourceMode === 'none' ? undefined
      : sample.kind === 'raw' ? raw : sample.kind === 'empty' ? empty
        : sample.kind === 'stateful' ? stateful : picture
  );
  let size = $derived(larger ? 180 : sample.size);
  let items = $derived<readonly AvatarGroupItem[]>([
    ...(sample.group === 'hidden' ? [{ key: 'plain', label: 'Plain avatar', text: 'A' }] : []),
    {
      key: 'source',
      id: 'source-avatar',
      label: 'Source avatar',
      alt: named ? 'Outer avatar' : undefined,
      src: source,
      size,
      icon: sample.icon ? icon : undefined,
      draggable: true,
      crossOrigin: 'anonymous',
      srcSet: sample.attrs ? fallbackImage + ' 2x' : undefined,
      onError: failed,
      children: fallback,
      'aria-hidden': decorated
    },
    ...(sample.group === 'visible' ? [{ key: 'plain', label: 'Plain avatar', text: 'A' }] : [])
  ]);

  function failed() {
    avatarErrors++;
    return false;
  }
</script>

{#snippet raw()}<img src={image} alt="Caller portrait" draggable="false" crossorigin="use-credentials"
  srcset={sample.attrs ? image + ' 1x' : undefined} data-source-image
  onerror={() => { ownErrors++; }} />{/snippet}
{#snippet empty()}{/snippet}
{#snippet stateful()}<AvatarSourceState />{/snippet}
{#snippet icon()}<svg viewBox="0 0 24 24" data-source-icon><circle cx="12" cy="12" r="8" /></svg>{/snippet}
{#snippet fallback()}Fallback{/snippet}
{#snippet picture()}<Image src={image} alt="Source photo" preview={sample.preview === false ? false : {
  focusTrap, onOpenChange: next => previews.push(next)
}} fallback={sample.fallback ? fallbackImage : undefined} onError={() => { ownErrors++; }} />{/snippet}

<button type="button" onclick={() => revision++}>Refresh avatar source</button>
<output aria-label="Source revision">{revision}</output>
<ConfigProvider theme={{
  algorithm: sample.compact ? theme.compactAlgorithm : dark ? theme.darkAlgorithm : undefined,
  token: { motion: false },
  components: sample.aliases ? { Avatar: sample.aliases } : undefined
}}>
  <div id="avatar-source-host">
    {#if sample.group}
      <AvatarGroup {items} {size} max={{ count: 1, popover: { trigger: 'click' } }} />
    {:else}
      <Avatar id="source-avatar" src={source} {size}
        alt={named ? 'Outer avatar' : undefined} aria-hidden={decorated}
        draggable={attrsChanged ? false : true} crossOrigin="anonymous"
        srcSet={sample.attrs || attrsChanged ? fallbackImage + ' 2x' : undefined}
        icon={sample.icon ? icon : undefined} onError={failed} children={fallback} />
    {/if}
  </div>
</ConfigProvider>
<output aria-label="Avatar source errors">{avatarErrors}</output>
<output aria-label="Own source errors">{ownErrors}</output>
<output aria-label="Avatar source previews">{JSON.stringify(previews)}</output>
