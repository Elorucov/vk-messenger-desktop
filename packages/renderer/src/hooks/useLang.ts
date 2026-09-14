import { createContext, useContext } from 'react'
import { IOverrideBrowserEnv } from '@vkontakte-internal/messenger'

export type Lang = IOverrideBrowserEnv['lang']

//@ts-expect-error
const LangContext = createContext<Lang>(undefined)

const LangProvider = LangContext.Provider

const useLang = (): Lang => {
  const context = useContext(LangContext)

  if (!context) {
    throw new Error('LangProvider не добавлен в дерево Реакта!')
  }

  return context
}

export { useLang, LangProvider }
