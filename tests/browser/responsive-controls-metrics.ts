/** Измеряет только зависящие от breakpoint геометрию Masonry и размер Pagination. */
export function snapshotResponsiveControls() {
  const masonry = document.querySelector<HTMLElement>('[data-responsive-masonry] > div');
  const pagination = document.querySelector<HTMLElement>('.fixture-responsive-pagination');
  if (!masonry || !pagination) throw new Error('Responsive controls are missing');
  const bounds = masonry.getBoundingClientRect();
  const page = pagination.querySelector('.ant-pagination-item-4');
  const pageStyle = page && getComputedStyle(page);

  return {
    masonry: {
      height: bounds.height,
      items: [...masonry.children].map(item => {
        const box = item.getBoundingClientRect();

        return { x: box.x - bounds.x, y: box.y - bounds.y, width: box.width, height: box.height };
      })
    },
    pagination: {
      mini: pagination.classList.contains('ant-pagination-mini'),
      height: pageStyle?.height,
      minWidth: pageStyle?.minWidth,
      marginEnd: pageStyle?.marginInlineEnd
    }
  };
}
