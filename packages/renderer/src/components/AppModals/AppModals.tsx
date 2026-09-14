import React, { memo } from 'react'
import { HangupCallsModal } from './components'
import { SelectCapturerSourceModal } from '../../libs/mediaSharing'
import { JoinCallModal } from '../../libs/calls'

const AppModals = memo((): JSX.Element => {
  return (
    <>
      <SelectCapturerSourceModal />
      <JoinCallModal />
      <HangupCallsModal />
    </>
  )
})

export { AppModals }
