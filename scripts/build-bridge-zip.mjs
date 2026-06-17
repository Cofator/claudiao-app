// scripts/build-bridge-zip.mjs
// Empacota a pasta bridge/ num .zip para distribuição.
// Uso: node scripts/build-bridge-zip.mjs
// Saída: dist/claudio-bridge-0.1.0.zip
//
// Implementação mínima de ZIP STORE (sem compressão extra). A Bridge é <100KB.
// Para Fase 1b, não precisamos de DEFLATE. STORE é suficiente.

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dosTime(d = new Date()) {
  return ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((d.getSeconds() / 2) & 0x1f)
}
function dosDate(d = new Date()) {
  return (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0xf) << 5) | (d.getDate() & 0x1f)
}

function buildLocalHeader(name, data) {
  const nameBuf = Buffer.from(name, 'utf8')
  const crc = crc32(data)
  const header = Buffer.alloc(30)
  header.writeUInt32LE(0x04034b50, 0)
  header.writeUInt16LE(20, 4)
  header.writeUInt16LE(0, 6)
  header.writeUInt16LE(0, 8)
  header.writeUInt16LE(dosTime(), 10)
  header.writeUInt16LE(dosDate(), 12)
  header.writeUInt32LE(crc, 14)
  header.writeUInt32LE(data.length, 18)
  header.writeUInt32LE(data.length, 22)
  header.writeUInt16LE(nameBuf.length, 26)
  header.writeUInt16LE(0, 28)
  return Buffer.concat([header, nameBuf, data])
}

function buildCentralHeader(name, offset, data) {
  const nameBuf = Buffer.from(name, 'utf8')
  const crc = crc32(data)
  const header = Buffer.alloc(46)
  header.writeUInt32LE(0x02014b50, 0)
  header.writeUInt16LE(20, 4)
  header.writeUInt16LE(20, 6)
  header.writeUInt16LE(0, 8)
  header.writeUInt16LE(0, 10)
  header.writeUInt16LE(dosTime(), 12)
  header.writeUInt16LE(dosDate(), 14)
  header.writeUInt32LE(crc, 16)
  header.writeUInt32LE(data.length, 20)
  header.writeUInt32LE(data.length, 24)
  header.writeUInt16LE(nameBuf.length, 28)
  header.writeUInt16LE(0, 30)
  header.writeUInt16LE(0, 32)
  header.writeUInt16LE(0, 34)
  header.writeUInt16LE(0, 36)
  header.writeUInt32LE(0, 38)
  header.writeUInt32LE(offset, 42)
  return Buffer.concat([header, nameBuf])
}

function zipDir(srcDir) {
  const files = []
  function walk(dir, prefix = '') {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      const rel = join(prefix, entry)
      if (statSync(full).isDirectory()) walk(full, rel)
      else files.push({ rel, full })
    }
  }
  walk(srcDir)
  const chunks = []
  let offset = 0
  const central = []
  for (const f of files) {
    const data = readFileSync(f.full)
    const local = buildLocalHeader(f.rel, data)
    chunks.push(local)
    central.push(buildCentralHeader(f.rel, offset, data))
    offset += local.length
  }
  const centralBuf = Buffer.concat(central)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(files.length, 8)
  eocd.writeUInt16LE(files.length, 10)
  eocd.writeUInt32LE(centralBuf.length, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)
  return Buffer.concat([...chunks, centralBuf, eocd])
}

const bridgeDir = 'bridge'
const outDir = 'dist'
mkdirSync(outDir, { recursive: true })
const buf = zipDir(bridgeDir)
const outPath = join(outDir, 'claudio-bridge-0.1.0.zip')
writeFileSync(outPath, buf)
console.log(`✅ ${outPath} (${buf.length} bytes)`)