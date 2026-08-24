export function validateSplitPercentages(
  participants: { splitPercent: number }[]
): { valid: boolean; total: number } {
  const total = participants.reduce((sum, p) => sum + p.splitPercent, 0)
  return { valid: total <= 100, total }
}
