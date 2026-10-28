import { SETTINGS_COPY } from './copy'

const MAX_EDGE = 1600

const QUALITY = 0.8

const PHOTO_TYPE = 'image/jpeg'

export async function shrinkPhoto(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = MAX_EDGE / Math.max(bitmap.width, bitmap.height)

  if (scale >= 1) {
    bitmap.close()

    return file
  }
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()
    throw new Error(SETTINGS_COPY.photoUnsupported)
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return canvas.convertToBlob({ type: PHOTO_TYPE, quality: QUALITY })
}
