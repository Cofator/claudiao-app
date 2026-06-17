// scripts/zip-dir.mjs
// Zipa uma pasta com barras NORMAIS (/) — compativel com extratores web/Linux.
// Uso: node scripts/zip-dir.mjs <pastaOrigem> <arquivo.zip>
// Implementacao ZIP STORE (sem compressao). Inclui dotfiles (.htaccess).

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'

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
const dosTime = (d) => ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((d.getSeconds() / 2) & 0x1f)
const dosDate = (d) => (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0xf) << 5) | (d.getDate() & 0x1f)

function localHeader(name, data, d) {
  const nameBuf = Buffer.from(name, 'utf8')
  const crc = crc32(data)
  const h = Buffer.alloc(30)
  h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0, 6); h.writeUInt16LE(0, 8)
  h.writeUInt16LE(dosTime(d), 10); h.writeUInt16LE(dosDate(d), 12)
  h.writeUInt32LE(crc, 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(data.length, 22)
  h.writeUInt16LE(nameBuf.length, 26); h.writeUInt16LE(0, 28)
  return Buffer.concat([h, nameBuf, data])
}
function centralHeader(name, offset, data, d) {
  const nameBuf = Buffer.from(name, 'utf8')
  const crc = crc32(data)
  const h = Buffer.alloc(46)
  h.writeUInt32LE(0x02014b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(20, 6); h.writeUInt16LE(0, 8); h.writeUInt16LE(0, 10)
  h.writeUInt16LE(dosTime(d), 12); h.writeUInt16LE(dosDate(d), 14)
  h.writeUInt32LE(crc, 16); h.writeUInt32LE(data.length, 20); h.writeUInt32LE(data.length, 24)
  h.writeUInt16LE(nameBuf.length, 28); h.writeUInt16LE(0, 30); h.writeUInt16LE(0, 32); h.writeUInt16LE(0, 34); h.writeUInt16LE(0, 36)
  h.writeUInt32LE(0, 38); h.writeUInt32LE(offset, 42)
  return Buffer.concat([h, nameBuf])
}

function zipDir(srcDir) {
  const files = []
  function walk(dir, prefix) {
    for (const entry of readdirSync(dir)) {
      const full = dir + '/' + entry
      const rel = prefix ? prefix + '/' + entry : entry   // SEMPRE barra normal
      if (statSync(full).isDirectory()) walk(full, rel)
      else files.push({ rel, full })
    }
  }
  walk(srcDir, '')
  const now = new Date(2026, 5, 17, 12, 0, 0)
  const chunks = []; const central = []; let offset = 0
  for (const f of files) {
    const data = readFileSync(f.full)
    const local = localHeader(f.rel, data, now)
    chunks.push(local)
    central.push(centralHeader(f.rel, offset, data, now))
    offset += local.length
  }
  const centralBuf = Buffer.concat(central)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(files.length, 8); eocd.writeUInt16LE(files.length, 10)
  eocd.writeUInt32LE(centralBuf.length, 12); eocd.writeUInt32LE(offset, 16); eocd.writeUInt16LE(0, 20)
  return { buf: Buffer.concat([...chunks, centralBuf, eocd]), names: files.map((f) => f.rel) }
}

const [src, out] = process.argv.slice(2)
if (!src || !out) { console.error('uso: node scripts/zip-dir.mjs <origem> <saida.zip>'); process.exit(1) }
const { buf, names } = zipDir(src)
writeFileSync(out, buf)
console.log(`OK ${out} (${buf.length} bytes)`)
console.log('arquivos:', names.join(', '))
