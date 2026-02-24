/** Calculate weighted percentage from assessment scores. Safe for client use.
 * Result maps to letter grade via percentageToGrade() using uniportal_docs.txt scale. */
export function calculateWeightedPercentage(
  assessments: { id: string; weight: number; maxScore: number }[],
  scores: Record<string, { score: number | null; maxScore: number }>
): number | null {
  let totalWeighted = 0
  let totalWeight = 0
  for (const a of assessments) {
    const s = scores[a.id]
    if (!s || s.score === null) return null
    let max = s.maxScore || a.maxScore
    // Backward compat: maxScore=100 was default; treat as "points out of weight" (e.g. 11/15 for Test 1)
    if (max === 100) max = a.weight
    if (max <= 0) continue
    totalWeighted += (s.score / max) * a.weight
    totalWeight += a.weight
  }
  if (totalWeight === 0) return null
  return Math.round((totalWeighted / totalWeight) * 100)
}
