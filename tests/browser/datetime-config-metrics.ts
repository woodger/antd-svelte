export function snapshotDatetimeConfig() {
  const popup = [...document.querySelectorAll('.ant-picker-dropdown')]
    .find(node => !node.classList.contains('ant-picker-dropdown-hidden'))!;

  return {
    inputs: [...document.querySelectorAll<HTMLInputElement>('.ant-picker-input input')]
      .map(input => input.value),
    header: popup.querySelector('.ant-picker-time-panel .ant-picker-header-view')?.textContent
      ?? null,
    columns: [...popup.querySelectorAll('.ant-picker-time-panel-column')].map(column => ({
      values: [...column.querySelectorAll('li')].map(cell => cell.textContent),
      selected: [...column.querySelectorAll('.ant-picker-time-panel-cell-selected')]
        .map(cell => cell.textContent),
      disabled: [...column.querySelectorAll('.ant-picker-time-panel-cell-disabled')]
        .map(cell => cell.textContent)
    }))
  };
}
