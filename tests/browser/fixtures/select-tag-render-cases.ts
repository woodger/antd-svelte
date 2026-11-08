export interface SelectTagRenderSample {
  id: string;
  values: readonly (string | number)[];
  mode?: string;
  disabled?: boolean;
  count?: number;
  textLength?: number;
  stopClose?: boolean;
}
