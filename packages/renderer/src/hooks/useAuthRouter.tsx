import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { IRouter, Router } from '@vkontakte-internal/messenger'
import { useRouter } from '@vkontakte-internal/messenger/dist/browser/ui/Router/Router'

type Props = {
  router: Router
}

type RouterContext = {
  router: IRouter.IRouter
  screenRoute: IRouter.ScreenRoute
  runtimeRoute: null | IRouter.RuntimeRoute
}

const AuthRouterContext = createContext<RouterContext | null>(null)

const AuthRouterProvider: React.FC<React.PropsWithChildren<Props>> = ({
  router,
  children,
}) => {
  const [screenRoute, setScreenRoute] = useState(router.screenRoute)

  useLayoutEffect(() => {
    const unsub = router.subscribe((route) => setScreenRoute(route))
    return () => unsub()
  }, [router])

  const value = useMemo<RouterContext>(
    () => ({
      router,
      screenRoute,
      runtimeRoute: router.runtimeRoute,
    }),
    [router, screenRoute],
  )

  return (
    <AuthRouterContext.Provider value={value}>
      {children}
    </AuthRouterContext.Provider>
  )
}

const useAuthRouter = (): ReturnType<typeof useRouter> => {
  const context = useContext(AuthRouterContext)

  if (!context) {
    throw new Error('AuthRouterContext не добавлен в дерево Реакта!')
  }

  const { router, screenRoute, runtimeRoute } = context

  return {
    router,
    screenRoute,
    runtimeRoute,
    modal: screenRoute.modal?.slice(-1).pop() || null,
    rightPanel: screenRoute.rp?.slice(-1).pop() || null,
    navigate: router.push,
    replace: router.replace,
    pop: router.pop,
  }
}

export { useAuthRouter, AuthRouterProvider }
