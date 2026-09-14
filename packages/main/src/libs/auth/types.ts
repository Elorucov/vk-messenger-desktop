import { QRAuthStatus, UserExchangeToken } from 'vkme-common'

export type ApiError = {
  error_code: number
  error_msg: string
  error_type?: string
}

export type AnonymToken = {
  token: string
  expired_at: number
}

export type GetQRCodeData = {
  auth_url: string
  auth_hash: string
  auth_id?: string
  expires_in?: number
}

export type FetchQrAuthStatus = {
  status: QRAuthStatus
  access_token?: string
  user_id?: number
  expires_in?: number
  auth_hash?: string
}

export type ExchangeTokenResponse = {
  users_exchange_tokens?: UserExchangeToken[]
  error?: ApiError
}

export type ExchangeSilentTokenResponsePayload = {
  access_token: string
  user_id?: number
  expires_in?: number
  access_token_id?: string
  additional_signup_required?: boolean
  is_partial?: boolean
  is_service?: boolean
}

export type ExchangeSilentTokenResponse = {
  response?: ExchangeSilentTokenResponsePayload
  error?: ApiError
}
