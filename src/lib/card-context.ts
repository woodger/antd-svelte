import { getContext, setContext } from 'svelte';

export interface CardContext {
  readonly prefixCls: string;
}

const key = Symbol('ant-card');

export function provideCard(context: CardContext) {
  setContext(key, context);
}

export function useCard() {
  return getContext<CardContext | undefined>(key);
}
