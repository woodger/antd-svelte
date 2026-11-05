import Empty from './Empty.svelte';

export default Object.assign(Empty, {
  PRESENTED_IMAGE_DEFAULT: 'default' as const,
  PRESENTED_IMAGE_SIMPLE: 'simple' as const
});
