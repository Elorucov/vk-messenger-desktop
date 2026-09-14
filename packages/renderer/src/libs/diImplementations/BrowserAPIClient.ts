/**
 * DO NOT EXPORT ANYWHERE EXCEPT CALLS
 */
import { Constructor, scope } from '@vkontakte-internal/di'
import {
  APIClient,
  APIClientRequestOptions,
  type APIClientFetchWebTokenConfig,
  type APIClientFetchWebTokenRequest,
  type APIClientFetchWebTokenResponse,
  type APIClientLoginExchangeHashResponse,
  type APIClientLoginExchangeTokenResponse,
} from '@vkontakte-internal/plugins'
import { login, upload } from '@vkontakte-internal/api-client'
import { IApi } from '@vkontakte-internal/messenger'
import { exponentialRetry } from '@vkontakte-internal/calls/helpers/helpers'
import { ServerError } from '@vkontakte-internal/calls-core'
import {
  LoginExchangeHash,
  LoginExchangeToken,
} from '@vkontakte-internal/api-client/dist/modules/Login/types'
import { isObject } from '@vkontakte/vkjs'

const fixMethod = (method: string) =>
  method.startsWith('calls.calls.') ? method.replace('calls.', '') : method

export const createAPIClientImplementation = (
  api: Pick<IApi.IApi, 'fetchForExternalLibs'>,
): Constructor<APIClient> => {
  @scope.global()
  class VkMeCallsAPIClient implements APIClient {
    private readonly _api = api

    public fetchWebToken(
      methodParams?: APIClientFetchWebTokenRequest,
      overrideLoginConfig?: APIClientFetchWebTokenConfig,
    ): Promise<APIClientFetchWebTokenResponse> {
      return login('web_token', methodParams, overrideLoginConfig)
    }

    public request<RequestType, ResponseType>(
      method: string,
      params: RequestType,
      options?: APIClientRequestOptions,
    ): Promise<ResponseType> {
      const optsCast: IApi.Options<keyof IApi.Request> = {
        retries: options?.maxRetries,
      }

      return exponentialRetry(this._api.fetchForExternalLibs.bind(this._api), {
        attempts: 100,
        isForceBreak: (error) => {
          let requestErrors: IApi.RequestError[] = []

          if (error instanceof IApi.RequestError) {
            requestErrors = [error]
          }

          if (error instanceof IApi.ExecuteErrors) {
            requestErrors = error.list
          }

          return !requestErrors.some(
            (item) => item?.code === ServerError.FLOOD_CONTROL,
          )
        },
        staticTimeoutSec: 1,
        // @ts-expect-error типизация не подходит
      })(fixMethod(method), isObject(params) ? params : {}, optsCast)
    }

    public fetchConnectExchangeHash(
      data: LoginExchangeHash['request'],
    ): Promise<APIClientLoginExchangeHashResponse> {
      return login('connect_exchange_hash', data)
    }

    public fetchConnectExchangeToken(
      data: LoginExchangeToken['request'],
    ): Promise<APIClientLoginExchangeTokenResponse> {
      return login('connect_exchange_token', data)
    }

    public upload<Response>(
      url: string,
      formData: FormData,
    ): Promise<Response> {
      return upload(url, formData)
    }
  }

  return VkMeCallsAPIClient
}
