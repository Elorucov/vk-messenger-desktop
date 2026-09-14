import { net } from 'electron'
import { URL } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { maskData } from '../workers/data-masking.worker'
import { USER_AGENT } from '../globals'
import { loggerSettings, netLogger } from '../libs/logger'
import { API_LOCALES } from 'vkme-common'
import { memoryStore } from '../storage/memory.store'

const scope = 'invoke'

export const invoke = async (
  url: string,
  params: Record<string, string>,
  timeout: number = 31000,
): Promise<any> => {
  const id = uuidv4()
  let timeoutId: NodeJS.Timeout

  if (timeout) {
    timeoutId = setTimeout(() => controller.abort(), timeout)
  }

  const controller = new AbortController()

  const parsed = new URL(url)
  let maskedUrl: string

  const formData = Object.keys(params).reduce((acc, param) => {
    if (typeof params[param] !== 'undefined') {
      acc.append(param, params[param] as string)
    }
    return acc
  }, new URLSearchParams())

  const currentLocal = await memoryStore.getLang()
  formData.append('lang', API_LOCALES[currentLocal])

  if (loggerSettings.getIsNetLogsActive()) {
    try {
      const urlWithoutQuery = parsed.href.split('?')[0]

      const queryParams = Object.fromEntries(parsed.searchParams)
      const maskedQueryParams = await maskData(queryParams)
      const maskedQueryParamsString = new URLSearchParams(
        maskedQueryParams,
      ).toString()

      maskedUrl = `${urlWithoutQuery}?${maskedQueryParamsString}`

      const maskedData = await maskData(params)

      netLogger.info(
        'main',
        scope,
        `request | ${id} | ${maskedUrl} |`,
        maskedData,
      )
    } catch (error: unknown) {
      netLogger.error('main', scope, error)
    }
  }

  return net
    .fetch(url, {
      method: 'POST',
      headers: {
        'x-origin': parsed.origin,
        'content-type': 'application/x-www-form-urlencoded',
        Accept: 'image/webp',
        'Accept-Language': 'ru,en;q=0.9,it;q=0.8,en-US;q=0.7',
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
      body: formData,
    })
    .then((res) => res.json())
    .then((json) => {
      if (loggerSettings.getIsNetLogsActive()) {
        maskData(json)
          .then((value) => {
            netLogger.info(
              'main',
              scope,
              `response | ${id} | ${maskedUrl} |`,
              value,
            )
          })
          .catch((error) => {
            netLogger.error('main', scope, error)
          })
      }
      return json
    })
    .catch((error) => {
      netLogger.error('main', scope, error)
    })
    .finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })
}
