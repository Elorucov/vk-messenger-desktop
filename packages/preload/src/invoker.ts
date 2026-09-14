import { ipcRenderer, contextBridge } from 'electron'

const decodeError = ({ name, message, extra }: Error & { extra: any }) => {
  const e = new Error(message)
  e.name = name
  Object.assign(e, extra)
  return e
}

export const invoke = async (
  url: string,
  params: Record<string, string>,
): Promise<any> => {
  const { result, error } = await ipcRenderer.invoke('invoke:api', url, params)
  if (error) {
    throw decodeError(error)
  }
  return result
}

contextBridge.exposeInMainWorld('_invoke', {
  invoke: async (url: string, params: Record<string, string>): Promise<any> => {
    const { result, error } = await ipcRenderer.invoke(
      'invoke:api',
      url,
      params,
    )
    if (error) {
      throw decodeError(error)
    }
    return result
  },
})
