export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const staffEmails = (process.env.STAFF_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return staffEmails.includes(email.toLowerCase())
}
