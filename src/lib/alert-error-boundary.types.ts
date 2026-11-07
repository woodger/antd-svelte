import type { AlertContent } from './alert.types';

/**
 * Ошибка дочернего render/sync effect заменяет содержимое Alert; сброс — remount/key.
 * SSR ошибки не ловит.
 */
export interface AlertErrorBoundaryProps {
  /** По умолчанию Error.toString(); null/undefined выбирают текст ошибки. */
  title?: AlertContent;
  /** По умолчанию Error.stack из Svelte вместо React componentStack; выводится внутри pre. */
  description?: AlertContent;
  children?: AlertContent;
  /** Применяется только к Alert при ошибке; здоровые children не получают wrapper/id. */
  id?: string;
}
