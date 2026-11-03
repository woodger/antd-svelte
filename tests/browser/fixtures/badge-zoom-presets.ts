import type { BadgeStatus } from 'antd-svelte';

export interface BadgeZoomValues {
  count?: number | string | null;
  custom?: boolean;
  show?: boolean;
  dot?: boolean;
  title?: string | false | null;
  status?: BadgeStatus;
}

export type BadgeZoomStep = ({ kind: 'set'; } & BadgeZoomValues)
  | { kind: 'wait'; ms: number; }
  | { kind: 'initial' | 'end' | 'inner-end' | 'unmount'; };

export interface BadgeZoomCase extends BadgeZoomValues {
  name: string;
  wrap?: boolean;
  motion?: boolean;
  steps: BadgeZoomStep[];
}
