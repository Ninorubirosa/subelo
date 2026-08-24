import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(),
}))

import { upload } from '@vercel/blob/client'
import { uploadAudioFile, uploadCoverArt } from '@/lib/blob-upload'

describe('blob-upload', () => {
  afterEach(() => {
    vi.mocked(upload).mockReset()
  })

  it('uploadCoverArt calls upload with the cover-art payload and returns the url', async () => {
    vi.mocked(upload).mockResolvedValue({
      url: 'https://blob.vercel-storage.com/cover.jpg',
    } as Awaited<ReturnType<typeof upload>>)

    const file = new File(['data'], 'cover.jpg', { type: 'image/jpeg' })
    const url = await uploadCoverArt(file)

    expect(url).toBe('https://blob.vercel-storage.com/cover.jpg')
    expect(upload).toHaveBeenCalledWith(
      'cover.jpg',
      file,
      expect.objectContaining({
        access: 'public',
        handleUploadUrl: '/api/blob/upload',
        clientPayload: JSON.stringify({ kind: 'cover-art' }),
      })
    )
  })

  it('uploadAudioFile calls upload with the audio payload and returns the url', async () => {
    vi.mocked(upload).mockResolvedValue({
      url: 'https://blob.vercel-storage.com/track.wav',
    } as Awaited<ReturnType<typeof upload>>)

    const file = new File(['data'], 'track.wav', { type: 'audio/wav' })
    const url = await uploadAudioFile(file)

    expect(url).toBe('https://blob.vercel-storage.com/track.wav')
    expect(upload).toHaveBeenCalledWith(
      'track.wav',
      file,
      expect.objectContaining({
        clientPayload: JSON.stringify({ kind: 'audio' }),
      })
    )
  })
})
