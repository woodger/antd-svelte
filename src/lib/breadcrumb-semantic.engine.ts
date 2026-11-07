import type { BreadcrumbConfig, BreadcrumbProps, BreadcrumbSlots } from './breadcrumb.types';
import { mergeComponentSemantics } from './semantic-style.engine';

export function breadcrumbSemantics<Params extends Record<string, unknown>>(
  context: BreadcrumbConfig | undefined,
  props: BreadcrumbProps<Params>
) {
  // Общий context не знает Params экземпляра; callbacks получают его исходные props без обёртки.
  return mergeComponentSemantics<keyof BreadcrumbSlots, BreadcrumbProps<Params>>(
    context as BreadcrumbConfig<Params> | undefined,
    props,
    ['root', 'item', 'separator']
  );
}
