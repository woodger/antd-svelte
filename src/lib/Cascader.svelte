<script lang="ts" generics="OptionType extends CascaderOption = CascaderOption, Multiple extends boolean = false">
  import type { CascaderOption, CascaderProps } from './cascader.types';
  import CascaderCore from './CascaderCore.svelte';

  let {
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...props
  }: CascaderProps<OptionType, Multiple> = $props();
  let core = $state<InstanceType<typeof CascaderCore>>();

  export function focus(options?: FocusOptions) {
    core?.focus(options);
  }
  export function blur() {
    core?.blur();
  }
</script>

<CascaderCore {...props} semanticProps={props}
  bind:this={core} bind:nativeElement bind:inputElement />
