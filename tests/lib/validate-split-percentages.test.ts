import { describe, expect, it } from 'vitest'
import { validateSplitPercentages } from '@/lib/validate-split-percentages'

describe('validateSplitPercentages', () => {
  it('accepts a single solo artist at 100%', () => {
    const result = validateSplitPercentages([{ splitPercent: 100 }])
    expect(result.valid).toBe(true)
    expect(result.total).toBe(100)
  })

  it('accepts multiple collaborators summing to exactly 100%', () => {
    const result = validateSplitPercentages([
      { splitPercent: 60 },
      { splitPercent: 25 },
      { splitPercent: 15 },
    ])
    expect(result.valid).toBe(true)
    expect(result.total).toBe(100)
  })

  it('rejects splits summing to more than 100%', () => {
    const result = validateSplitPercentages([
      { splitPercent: 70 },
      { splitPercent: 40 },
    ])
    expect(result.valid).toBe(false)
    expect(result.total).toBe(110)
  })

  it('accepts an empty list (no collaborators added yet, mid-draft)', () => {
    const result = validateSplitPercentages([])
    expect(result.valid).toBe(true)
    expect(result.total).toBe(0)
  })
})
