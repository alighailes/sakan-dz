// Generates Nordic-palette PWA icons (pure Node, no deps).
// Design: opaque #295255 square, #F0F5F7 house (roof band + body), #162623 door.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

const BG = [41, 82, 85] // #295255
const HOUSE = [240, 245, 247] // #F0F5F7
const DOOR = [22, 38, 35] // #162623

// Roof chevron band polygon (normalized coords, y down)
const ROOF = [
  [0.5, 0.203],
  [0.203, 0.469],
  [0.281, 0.469],
  [0.5, 0.281],
  [0.719, 0.469],
  [0.797, 0.469],
]
const BODY = { x0: 0.297, x1: 0.703, y0: 0.469, y1: 0.766 }
const DOOR_R = { x0: 0.4375, x1: 0.5625, y0: 0.578, y1: 0.766 }

function inPoly(px, py, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function sampleColor(u, v) {
  // door on top
  if (u >= DOOR_R.x0 && u < DOOR_R.x1 && v >= DOOR_R.y0 && v < DOOR_R.y1) return DOOR
  if (u >= BODY.x0 && u < BODY.x1 && v >= BODY.y0 && v < BODY.y1) return HOUSE
  if (inPoly(u, v, ROOF)) return HOUSE
  return BG
}

function render(size, ss = 2) {
  const out = Buffer.alloc(size * size * 3)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const u = (x + (sx + 0.5) / ss) / size
          const v = (y + (sy + 0.5) / ss) / size
          const [cr, cg, cb] = sampleColor(u, v)
          r += cr
          g += cg
          b += cb
        }
      }
      const n = ss * ss
      const o = (y * size + x) * 3
      out[o] = Math.round(r / n)
      out[o + 1] = Math.round(g / n)
      out[o + 2] = Math.round(b / n)
    }
  }
  return out
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function encodePngRGB(size, rgb) {
  const stride = size * 3 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0 // filter: none
    rgb.copy(raw, y * stride + 1, y * size * 3, (y + 1) * size * 3)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: RGB
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return png
}

const targets = [
  ['icons/icon-192x192.png', 192],
  ['icons/icon-512x512.png', 512],
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [rel, size] of targets) {
  const rgb = render(size)
  const png = encodePngRGB(size, rgb)
  const dest = join(pub, rel)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, png)
  console.log(`wrote ${rel} (${size}x${size}, ${png.length} bytes)`)
}
