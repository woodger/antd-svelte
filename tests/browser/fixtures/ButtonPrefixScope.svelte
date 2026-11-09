<script lang="ts">
  import {
    Button, SpaceCompact, type ButtonColor, type ButtonShape, type ButtonType,
    type ButtonVariant, type ComponentSize
  } from 'antd-svelte';

  export interface ButtonPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    type?: ButtonType;
    color?: ButtonColor;
    variant?: ButtonVariant;
    size?: ComponentSize;
    shape?: ButtonShape;
    loading?: boolean;
    disabled?: boolean;
    ghost?: boolean;
    iconEnd?: boolean;
    chinese?: boolean;
    link?: boolean;
    vertical?: boolean;
    userStyle?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: ButtonPrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLButtonElement | HTMLAnchorElement>();
  let events = $state(0);
  let submissions = $state(0);
</script>

{#snippet icon()}<span aria-hidden="true" style="display:inline-block;width:12px;height:12px">+</span>{/snippet}
{#snippet compactButton(label: string)}
  <Button prefixCls={local ? sample.local : undefined} type="primary" size={sample.size}
    class="fixture-button-prefix" classNames={{ content: 'fixture-button-content' }}>{label}</Button>
{/snippet}
{#snippet first()}{@render compactButton('First')}{/snippet}
{#snippet last()}{@render compactButton('Last')}{/snippet}
<form data-button-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => { event.preventDefault(); submissions++; }}>
  <Button prefixCls={local ? sample.local : undefined} bind:nativeElement
    type={sample.type} color={sample.color} variant={sample.variant} size={sample.size}
    shape={sample.shape} loading={sample.loading} disabled={sample.disabled} ghost={sample.ghost}
    href={sample.link ? '#button-prefix-target' : undefined} {icon}
    iconPlacement={sample.iconEnd ? 'end' : 'start'} htmlType="submit"
    classNames={({ props }) => ({
      root: `fixture-button-prefix fixture-raw-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`,
      icon: 'fixture-button-icon', content: 'fixture-button-content'
    })} styles={sample.userStyle ? { root: 'height:41px;color:rgb(18, 52, 86)' } : undefined}
    style={sample.userStyle ? 'height:43px' : undefined} onclick={() => events++}>
    {sample.chinese ? '按钮' : 'Action'}
  </Button>
  <SpaceCompact orientation={sample.vertical ? 'vertical' : 'horizontal'} items={[first, last]} />
  <input aria-label={`${scope} button draft`} name="draft" value="Draft" />
  <output aria-label={`${scope} Button prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} Button prefix events`}>{events}</output>
  <output aria-label={`${scope} Button prefix submissions`}>{submissions}</output>
</form>
