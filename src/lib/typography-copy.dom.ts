/** Повторяет Ant Design copy: async Clipboard API, затем capture listener + execCommand. */
export async function writeTypographyClipboard(
  text: string,
  format: 'text/plain' | 'text/html' | undefined,
  document: Document
) {
  const view = document.defaultView;
  const html = format === 'text/html';
  try {
    const clipboard = view?.navigator.clipboard;
    if (html && view) {
      await clipboard?.write([new view.ClipboardItem({
        'text/html': new view.Blob([text], { type: 'text/html' }),
        'text/plain': new view.Blob([text], { type: 'text/plain' })
      })]);
      if (clipboard) return true;
    } else if (clipboard) {
      await clipboard.writeText(text);
      return true;
    }
  } catch {
    // Отказ async API передаёт попытку исходному synchronous fallback.
  }

  let copied = false;
  function handleCopy(event: ClipboardEvent) {
    event.stopPropagation();
    event.preventDefault();
    event.clipboardData?.clearData();
    event.clipboardData?.setData('text/plain', text);
    if (html) event.clipboardData?.setData('text/html', text);
    copied = true;
  }
  try {
    document.addEventListener('copy', handleCopy, { capture: true });
    document.execCommand('copy');
    return copied;
  } catch {
    return false;
  } finally {
    document.removeEventListener('copy', handleCopy, { capture: true });
  }
}
