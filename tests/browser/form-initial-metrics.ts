export function formInitialMetrics() {
  const metadata = document.querySelector('output[aria-label="Initial field metadata"]')!.textContent!;

  return {
    ...JSON.parse(metadata),
    inputs: [...document.querySelectorAll<HTMLInputElement>('.capture-initial .ant-input')]
      .map(node => node.value)
  };
}
