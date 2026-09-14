// Пакет используется только как источник типов: в собранном коде его модулей нет.
export type CaptchaData = {
  captcha_sid?: string
  captcha_img?: string
  captcha_ts?: number
  captcha_attempt?: number
  is_refresh_enabled?: boolean
  captcha_ratio?: number
  captcha_track?: string
  redirect_uri?: string
  [key: string]: unknown
}
