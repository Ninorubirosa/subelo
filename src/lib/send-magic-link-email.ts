export async function sendMagicLinkEmail({
  to,
  url,
}: {
  to: string
  url: string
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Subelo <no-reply@subelodistro.com>',
      to,
      subject: 'Sign in to Subelo',
      html: `
        <div style="font-family: sans-serif; background: #09090b; color: #fafafa; padding: 32px;">
          <h1 style="color: #38B6FF; font-size: 20px;">Sign in to Subelo</h1>
          <p>Click the link below to sign in. This link expires in 24 hours.</p>
          <p><a href="${url}" style="color: #38B6FF;">Sign in to Subelo</a></p>
          <p style="color: #a1a1aa; font-size: 13px;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
      text: `Sign in to Subelo: ${url}`,
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`)
  }
}
