<script lang="ts" generics="OptionType extends CascaderOption = CascaderOption, Multiple extends boolean = false">
  import type { CascaderOption, CascaderPanelProps } from './cascader.types';
  import CascaderCore from './CascaderCore.svelte';

  let { nativeElement = $bindable(), ...props }: CascaderPanelProps<OptionType, Multiple> = $props();
</script>

<CascaderCore {...props} panel bind:nativeElement />
