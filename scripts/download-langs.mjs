import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Забирает языковые паки из lang-pack.js и кладёт их туда, откуда их читает
 * главный процесс (packages/main/dist/lang/<locale>.json).
 * Если сети нет, берём снапшот из packages/main/lang.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'packages/main/dist/lang')
const SNAPSHOT = path.join(ROOT, 'packages/main/lang')
const LANG_PACK_URL = 'https://vk.com/js/lang-pack.js?format=json'
const LOCALES = ['ru', 'en']

const fetchPack = async (name, lang) => {
  const response = await fetch(`${LANG_PACK_URL}&name=${name}&lang=${lang}`)
  if (!response.ok) throw new Error(`${name}/${lang}: HTTP ${response.status}`)
  return response.json()
}

fs.mkdirSync(DIST, { recursive: true })

for (const lang of LOCALES) {
  const target = path.join(DIST, `${lang}.json`)
  try {
    const [me, calls] = await Promise.all([fetchPack('me', lang), fetchPack('calls', lang)])
    const combined = { ...me, keys: { ...me.keys, ...calls.keys } }
    fs.writeFileSync(target, JSON.stringify(combined), 'utf-8')
    console.log(`${lang}: загружен`)
  } catch (error) {
    const fallback = path.join(SNAPSHOT, `${lang}.json`)
    if (!fs.existsSync(fallback)) throw error
    fs.copyFileSync(fallback, target)
    console.log(`${lang}: взят снапшот (${error.message})`)
  }
}
