import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const COVER_ART_TYPES = ['image/jpeg', 'image/png', 'image/tiff']
const AUDIO_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/aiff',
  'audio/x-aiff',
]

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth()
        if (!session?.user?.artistId) {
          throw new Error('Not authenticated')
        }

        const payload = clientPayload ? JSON.parse(clientPayload) : {}
        const allowedContentTypes =
          payload.kind === 'audio' ? AUDIO_TYPES : COVER_ART_TYPES

        return {
          allowedContentTypes,
          addRandomSuffix: true,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
