/** Исходные usePercent buckets; после последнего порога значение больше не растёт. */
export function advanceSpinPercent(percent: number) {
  for (const [limit, step] of [[30, 0.05], [70, 0.03], [96, 0.01]]) {
    if (percent <= limit) return percent + (100 - percent) * step;
  }
  return percent;
}

export function spinProgress(percent: number) {
  const value = Math.max(Math.min(percent, 100), 0);
  const circumference = 80 * Math.PI;

  return {
    value,
    offset: String(circumference / 4),
    dash: `${circumference * value / 100} ${circumference * (100 - value) / 100}`
  };
}
