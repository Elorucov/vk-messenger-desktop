import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const readVersion = (packageName, fallback) => {
  try {
    return require(`${packageName}/package.json`).version
  } catch {
    return fallback
  }
}

/**
 * Значения, которые подставляются в бандлы вместо import.meta.env.*
 * PACKAGE_VERSION — версия приложения, REFORGED_VERSION и CALLS_VERSION —
 * версии веб-мессенджера и модуля звонков, они попадают в лог при старте.
 */
export function buildDefines() {
  const pkg = require('../package.json')

  return {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.REFORGED_VERSION': JSON.stringify(
      readVersion('@vkontakte-internal/messenger', '0.0.0'),
    ),
    'import.meta.env.CALLS_VERSION': JSON.stringify(
      readVersion('@vkontakte-internal/calls', '0.0.0'),
    ),
  }
}
