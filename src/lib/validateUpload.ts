/**
 * Validates uploaded files by inspecting their magic bytes (file signature),
 * not relying on the user-supplied filename or Content-Type header.
 */

const IMAGE_SIGNATURES: Array<{ mime: string; ext: string; sig: number[]; offset?: number }> = [
  { mime: 'image/jpeg', ext: 'jpg',  sig: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  ext: 'png',  sig: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { mime: 'image/gif',  ext: 'gif',  sig: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { mime: 'image/webp', ext: 'webp', sig: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // WEBP at byte 8
]

/** Detects image MIME type from magic bytes. Returns null if not a recognised image. */
function detectImageMime(buf: Uint8Array): { mime: string; ext: string } | null {
  for (const { mime, ext, sig, offset = 0 } of IMAGE_SIGNATURES) {
    if (sig.every((byte, i) => buf[offset + i] === byte)) {
      return { mime, ext }
    }
  }
  return null
}

export class UploadValidationError extends Error {}

/**
 * Validates an image upload file.
 * @param file      The File from formData
 * @param maxBytes  Maximum allowed size in bytes (default: 5 MB)
 * @returns         { buffer, ext } — the validated buffer and safe extension
 * @throws          UploadValidationError if validation fails
 */
export async function validateImageUpload(
  file: File,
  maxBytes = 5 * 1024 * 1024
): Promise<{ buffer: Buffer; ext: string }> {
  if (file.size > maxBytes) {
    throw new UploadValidationError(`Fichier trop volumineux (max ${maxBytes / 1024 / 1024} Mo).`)
  }

  const arrayBuffer = await file.arrayBuffer()
  const buf = new Uint8Array(arrayBuffer)

  const detected = detectImageMime(buf)
  if (!detected) {
    throw new UploadValidationError('Format de fichier non supporté. Utilise JPEG, PNG, GIF ou WebP.')
  }

  return { buffer: Buffer.from(arrayBuffer), ext: detected.ext }
}
