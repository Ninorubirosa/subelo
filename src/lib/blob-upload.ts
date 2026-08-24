import { upload } from '@vercel/blob/client'

export async function uploadCoverArt(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload',
    clientPayload: JSON.stringify({ kind: 'cover-art' }),
  })
  return blob.url
}

export async function uploadAudioFile(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload',
    clientPayload: JSON.stringify({ kind: 'audio' }),
  })
  return blob.url
}
