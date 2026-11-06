<script lang="ts">
  import { Mentions } from 'antd-svelte';

  let {
    mode = 'default',
    scope = 'normal',
    prefix = 'ant',
    priority = false,
    autoSize = false
  }: {
    mode?: string;
    scope?: string;
    prefix?: string;
    priority?: boolean;
    autoSize?: boolean;
  } = $props();
  let styled = $derived(priority || scope === 'priority');
  let events = $state<string[]>([]);
</script>

<form aria-label="Mentions theme form">
  <Mentions name="mention" aria-label="Themed Mentions" rows={1} defaultValue="Draft"
    {autoSize} options={[
      { value: 'alpha', label: 'Alpha' },
      { value: 'beta', label: 'Beta' },
      { value: 'gamma', label: 'Gamma', disabled: true }
    ]}
    size={mode === 'small' ? 'small' : mode === 'large' ? 'large' : undefined}
    variant={mode === 'filled' ? 'filled' : mode === 'underlined' ? 'underlined'
      : mode === 'borderless' ? 'borderless' : 'outlined'}
    disabled={mode === 'disabled'}
    status={mode === 'error' ? 'error' : mode === 'warning' ? 'warning' : undefined}
    style={['width:320px', styled && 'color:rgb(0,128,0);border-radius:13px',
      scope === 'variable' && `--${prefix}-mentions-padding-inline:19px`]
      .filter(Boolean).join(';')}
    onChange={value => events.push(`change:${value}`)}
    onSearch={value => events.push(`search:${value}`)}
    onSelect={option => events.push(`select:${option.value}`)} />
</form>
<output aria-label="Mentions theme events">{JSON.stringify(events)}</output>
