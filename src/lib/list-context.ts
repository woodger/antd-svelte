import { getContext, setContext } from 'svelte';
import type { ListConsumerProps } from './list.types';

const listKey = Symbol('ant-design-list');

export function useList(): ListConsumerProps {
  return getContext<ListConsumerProps | undefined>(listKey) ?? {};
}

export function provideList(context: ListConsumerProps) {
  setContext(listKey, context);
}
