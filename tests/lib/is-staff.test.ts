import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isStaffEmail } from '@/lib/is-staff'

describe('isStaffEmail', () => {
  const original = process.env.STAFF_EMAILS

  beforeEach(() => {
    process.env.STAFF_EMAILS = 'staff@subelo.com, Other@Example.com'
  })

  afterEach(() => {
    process.env.STAFF_EMAILS = original
  })

  it('returns true for an allowlisted email', () => {
    expect(isStaffEmail('staff@subelo.com')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isStaffEmail('OTHER@example.com')).toBe(true)
  })

  it('returns false for an email not on the allowlist', () => {
    expect(isStaffEmail('artist@example.com')).toBe(false)
  })

  it('returns false for null and undefined', () => {
    expect(isStaffEmail(null)).toBe(false)
    expect(isStaffEmail(undefined)).toBe(false)
  })

  it('returns false when STAFF_EMAILS is unset', () => {
    process.env.STAFF_EMAILS = ''
    expect(isStaffEmail('staff@subelo.com')).toBe(false)
  })
})
