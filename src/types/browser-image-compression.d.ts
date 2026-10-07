declare module 'browser-image-compression' {
  export interface CompressionOptions {
    maxSizeMB?: number
    maxWidthOrHeight?: number
    useWebWorker?: boolean
    fileType?: string
    initialQuality?: number
  }

  export default function imageCompression(file: File, options: CompressionOptions): Promise<File>
}
