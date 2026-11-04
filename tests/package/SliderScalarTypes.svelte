<script lang="ts">
  import { Slider } from 'antd-svelte';
  let changed = $state(0);
</script>

<Slider value={20} onChange={next => changed = next}
  classNames={({ props }) => ({ root: `value-${props.value?.toFixed()}` })} />
{#snippet mark()}<span data-rich-mark>Rich scalar mark</span>{/snippet}
<Slider marks={{ 25: mark }} step={null} defaultValue={25} />
<output>{changed}</output>
