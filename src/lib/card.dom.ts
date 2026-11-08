export function connectCardGrid(body: HTMLElement, update: (
  containsGrid: boolean
) => void): () => void {
  let active = true;
  const publish = () => {
    if (active)
      update([...body.children].some(child => child.hasAttribute('data-ant-card-grid')
        || child.classList.contains('ant-card-grid')));
  };
  const Observer = body.ownerDocument.defaultView!.MutationObserver;
  const observer = new Observer(publish);
  observer.observe(body, { childList: true });
  publish();
  return () => {
    active = false;
    observer.disconnect();
  };
}
