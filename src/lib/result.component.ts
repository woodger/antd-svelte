import Result from './Result.svelte';
import Image403 from './ResultImage403.svelte';
import Image404 from './ResultImage404.svelte';
import Image500 from './ResultImage500.svelte';

export default Object.assign(Result, {
  PRESENTED_IMAGE_403: Image403,
  PRESENTED_IMAGE_404: Image404,
  PRESENTED_IMAGE_500: Image500
});
