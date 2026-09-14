import React, { FC, PropsWithChildren, useMemo } from 'react'
import { SelectCapturerSourceModal } from '../../mediaSharing'
import {
  ModalsProvider,
  ModalStack,
} from '@vkontakte-internal/messenger/dist/browser/ui/Modals/Modals'
import * as Modals from '@vkontakte-internal/messenger/dist/data/env/Modals'
import { Stack } from '@vkontakte-internal/messenger/dist/data/env/Modals'
import { IModals } from '@vkontakte-internal/messenger/dist/data/env/IModals'
import { IOverrideILang } from '@vkontakte-internal/messenger'
import { MiniViewMinimizeButton, DraggableHeader } from '..'
import { LangProvider } from '../../../hooks/useLang'

type Props = {
  lang: IOverrideILang
}

export const CallsPage: FC<PropsWithChildren<Props>> = ({ lang }) => {
  const modalsStacks: Record<ModalStack, IModals.Stack> = useMemo(
    () => ({
      popup: new Modals.Stack(),
      rightPanel: new Stack(),
    }),
    [],
  )

  return (
    <React.StrictMode>
      <LangProvider value={lang}>
        <ModalsProvider stacks={modalsStacks}>
          <SelectCapturerSourceModal />
        </ModalsProvider>
        <DraggableHeader />
        <MiniViewMinimizeButton />
      </LangProvider>
    </React.StrictMode>
  )
}
