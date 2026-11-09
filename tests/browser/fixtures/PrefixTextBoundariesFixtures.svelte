<script lang="ts">
  import {
    Avatar, AvatarGroup, Button, Checkbox, ConfigProvider, InputPassword, InputSearch,
    InputOTP, Radio, Switch, Tag
  } from 'antd-svelte';

  let prefix = $state('suite');
</script>

<section id="prefix-text-boundaries-fixture">
  <label>Text boundary prefix<input bind:value={prefix} /></label>
  <ConfigProvider prefixCls={prefix} theme={{ cssVar: {} }}>
    <span data-text-boundary="buttons"><Button>One</Button><Button>Two</Button></span>
    <span data-text-boundary="avatars"><Avatar>One</Avatar><AvatarGroup items={[
      { key: 'one', label: 'One', text: 'O' }
    ]} /></span>
    <span data-text-boundary="tags"><Tag>One</Tag><Tag>Two</Tag></span>
    <span data-text-boundary="checks"><Checkbox>One</Checkbox><Radio>Two</Radio><Switch /></span>
    <span data-text-boundary="password"><InputPassword aria-label="Boundary password" /></span>
    <span data-text-boundary="search"><InputSearch aria-label="Boundary search" /></span>
    <span data-text-boundary="otp"><InputOTP aria-label="Boundary code" /></span>
    <span data-user-boundary><b>Before</b> A <Button>Action</Button> Z <b>After</b></span>
  </ConfigProvider>
</section>
