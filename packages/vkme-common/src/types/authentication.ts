export type AuthenticationPayload = {
  payload: string
  token: string
}

export type UserExchangeToken = {
  user_id: number
  profile_type: number
  common_token: string
}

export const enum UserProfileTypeEnumNames {
  NORMAL = 0,
  EDU = 2,
}

export type ResponseRedirectState = {
  profileType: UserProfileTypeEnumNames
  csrfToken: string
}

export type AuthPayload = {
  apiToken: string
  anonymToken: string
  currentUserId: number
  profileType: number
}

export const enum QRAuthStatus {
  CREATED,
  OPENED,
  APPROVED,
  DECLINED,
  EXPIRED,
}
