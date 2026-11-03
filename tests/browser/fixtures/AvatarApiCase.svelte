<script lang="ts">
  import { Avatar, AvatarGroup, ConfigProvider } from 'antd-svelte';
  import type { AvatarGroupItem } from 'antd-svelte';
  import { avatarApiImage, type AvatarApiCase, type AvatarApiValues } from './avatar-api-presets';

  let { sample, changed = false, aliases = false }: {
    sample: AvatarApiCase;
    changed?: boolean;
    aliases?: boolean;
  } = $props();
  let values = $derived<AvatarApiValues>({ ...sample, ...(changed ? sample.patch : {}) });
  let avatarElement = $state<HTMLSpanElement>();
  let groupElement = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
  let mounted = $state(true);
  let provider = $derived(values.provider);
  let items = $derived<AvatarGroupItem[]>([
    { key: 'alpha', label: 'Alpha', text: 'A', class: 'case-alpha',
      'data-member': 'alpha', onClick: event => handleClick(event, 'member') },
    { key: 'beta', label: 'Beta', text: 'B', class: 'case-beta', style: 'color:rgb(1,2,3)' },
    { key: 'gamma', label: 'Gamma', text: 'G' }
  ]);

  function handleClick(event: MouseEvent, label = 'click') {
    const node = event.currentTarget as HTMLElement;
    events = [...events, `${label}:${node.tagName}:${node.dataset.marker ?? node.dataset.member}`];
  }

  function handleError() {
    events = [...events, 'error'];
    return sample.cancelError ? false : undefined;
  }
</script>

{#snippet icon()}◆{/snippet}
{#snippet callerImage()}<input aria-label="Caller Avatar draft" value="Draft" style="width:24px" />{/snippet}

<ConfigProvider
  avatar={provider}
  direction={sample.direction}
  componentSize={sample.componentSize}
  componentDisabled={sample.componentDisabled}
  theme={{
    mode: sample.dark ? 'dark' : 'light',
    compact: sample.compact,
    token: { motion: false, ...sample.token }
  }}
>
  <ConfigProvider avatar={values.innerProvider}>
    <div id="avatar-api-surface">
      {#if mounted}{#if sample.group}
        <AvatarGroup
          {items}
          size={values.size}
          shape={values.shape}
          class={values.class}
          rootClassName={values.rootClassName}
          style={values.style}
          max={{ count: 2, style: 'color:rgb(4,5,6)' }}
          bind:nativeElement={groupElement}
        />
      {:else}
        <Avatar
          size={values.size}
          shape={values.shape}
          gap={values.gap}
          class={values.class}
          rootClassName={values.rootClassName}
          style={values.style}
          title={values.title ?? 'API <Avatar>'}
          dir={values.dir}
          role={values.role}
          tabindex={values.tabindex}
          src={values.kind === 'image' ? avatarApiImage
            : values.kind === 'snippet' ? callerImage : undefined}
          icon={values.kind === 'icon' ? icon : undefined}
          alt="API Avatar"
          data-marker="api"
          lang="en"
          onClick={handleClick}
          onclick={aliases ? event => handleClick(event, 'onclick') : undefined}
          onkeydown={event => events = [...events, `key:${event.key}`]}
          onError={handleError}
          bind:nativeElement={avatarElement}
        >ABC</Avatar>
      {/if}{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Avatar API events">{JSON.stringify(events)}</output>
<output aria-label="Avatar API ref">{(groupElement ?? avatarElement)?.tagName ?? 'empty'}</output>
<button type="button" onclick={() => mounted = !mounted}>Toggle bound Avatar</button>
