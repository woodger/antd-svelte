export interface TagTextSample {
  id: string;
  component: string;
  text: string;
  length?: number | string;
}

export function getTagTextLimit(value?: number | string) {
  return value === 'nan' ? Number.NaN : value === 'infinity' ? Number.POSITIVE_INFINITY
    : typeof value === 'number' ? value : undefined;
}
