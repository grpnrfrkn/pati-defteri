// Sevgi notlarını repoda okunaksız durması için kodlar. Bu bir şifreleme değildir.
//   npm run notlar        notlar/sevgi-notlari.json  ->  src/data/notlar.ts
//   npm run notlar:coz    src/data/notlar.ts         ->  notlar/sevgi-notlari.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// src/ui/love.ts içindeki anahtarla aynı olmalı.
const KEY = 'pati-defteri-minik-notlar'
const PLAIN = 'notlar/sevgi-notlari.json'
const ENCODED = 'src/data/notlar.ts'
const CONTEXTS = ['acilis', 'gorev-tamamlandi', 'buyuk-kutlama', 'gun-sonu', 'genel', 'cicek']

const mix = (bytes) => bytes.map((b, i) => b ^ KEY.charCodeAt(i % KEY.length))

if (process.argv[2] === 'coz') {
  const encoded = readFileSync(ENCODED, 'utf8').match(/'([A-Za-z0-9+/=]*)'/)[1]
  if (existsSync(PLAIN)) throw new Error(`${PLAIN} zaten var; üzerine yazmamak için durdum.`)
  mkdirSync('notlar', { recursive: true })
  writeFileSync(PLAIN, Buffer.from(mix([...Buffer.from(encoded, 'base64')])).toString('utf8'))
  console.log(`${PLAIN} yazıldı.`)
} else {
  const notes = JSON.parse(readFileSync(PLAIN, 'utf8'))
  for (const ctx of CONTEXTS) {
    if (!Array.isArray(notes[ctx]) || notes[ctx].length === 0) throw new Error(`"${ctx}" için en az bir not gerekli.`)
  }
  const encoded = Buffer.from(mix([...Buffer.from(JSON.stringify(notes), 'utf8')])).toString('base64')
  writeFileSync(
    ENCODED,
    `// Bu dosya "npm run notlar" ile üretilir; elle düzenleme.\nexport const NOTLAR =\n  '${encoded}'\n`,
  )
  console.log(`${ENCODED} güncellendi (${CONTEXTS.map((c) => `${c}: ${notes[c].length}`).join(', ')}).`)
}
