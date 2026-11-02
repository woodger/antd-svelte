<script lang="ts">
  // @ant-design/icons-svg 4.6.0, MIT; vendor/LICENSE.ant-design-icons.
  let { name }: { name: 'plus' | 'close'; } = $props();
  const paths = {
    plus: [
      'M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z',
      'M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z'
    ],
    close: [
      'M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z'
    ],
  };
</script>

<style>
  .anticon { display: inline-flex; line-height: 0; vertical-align: -0.125em; }
</style>

<span class={`anticon anticon-${name}`} aria-hidden="true" inert><svg viewBox="64 64 896 896" width="1em" height="1em"
  fill="currentColor" fill-rule={name === 'close' ? 'evenodd' : undefined}
  aria-hidden="true" focusable="false">
  {#each paths[name] as path}<path d={path} />{/each}
</svg></span>
