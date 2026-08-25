export function validateSplitPercentages(
  participants: { splitPercent: number }[]
): { valid: boolean; total: number } {
  const total = participants.reduce((sum, p) => sum + p.splitPercent, 0)
  const hasNegative = participants.some((p) => p.splitPercent < 0)
  return { valid: !hasNegative && total <= 100, total }
}
