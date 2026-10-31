import type { Component } from 'svelte';
import CalendarCore from './CalendarCore.svelte';
import type { CalendarGenerateConfig, CalendarProps } from './calendar.types';

/** Фабрика Calendar.generateCalendar: Svelte component с фиксированным date adapter. */
export function generateCalendar<DateType extends object>(
  generateConfig: CalendarGenerateConfig<DateType>
): Component<CalendarProps<DateType>, {}, 'nativeElement'> {
  return (anchor, props) => CalendarCore<DateType>(anchor, new Proxy(props, {
    // Props и bind setters остаются реактивными; spread создал бы начальный снимок.
    get(target, key, receiver) {
      return key === 'generateConfig' ? generateConfig : Reflect.get(target, key, receiver);
    }
  }) as CalendarProps<DateType> & { generateConfig: CalendarGenerateConfig<DateType>; });
}
