import { createContext, useContext } from 'react'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'

export type AuthReturn = {
  setAccount: (id: Peer.UserId) => void
  onRegisterAccount: (profileType: 'edu' | 'normal') => void
}

const AuthContext = createContext<AuthReturn | null>(null)
const AuthProvider = AuthContext.Provider

function useAuth(): AuthReturn {
  const auth = useContext(AuthContext)

  if (!auth) {
    throw new Error('AuthProvider не добавлен в дерево Реакта!')
  }

  return auth
}

export { useAuth, AuthProvider }
