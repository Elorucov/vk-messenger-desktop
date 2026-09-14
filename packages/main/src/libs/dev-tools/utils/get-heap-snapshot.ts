import { BrowserWindow } from 'electron'
import { join } from 'path'
import { DEV_TOOLS_TAG } from '../constants/dev-tools-tag'
import { ParameterizedLogger } from 'vkme-common'

type Params = {
  getWindow: () => BrowserWindow | undefined
  directoryPath: string
  logger: ParameterizedLogger
}

const GET_HEAP_SNAPSHOT_TAG = 'getHeapSnapshot'

export const getHeapSnapshot = ({
  getWindow,
  directoryPath,
  logger,
}: Params): void => {
  const window = getWindow()
  logger.debug(
    'main',
    DEV_TOOLS_TAG,
    GET_HEAP_SNAPSHOT_TAG,
    'Heap snapshot requested',
  )

  if (window) {
    const timestamp = Date.now()

    const filePath = join(
      directoryPath,
      `heap-snapshot-${timestamp}.heapsnapshot`,
    )

    window.webContents.takeHeapSnapshot(filePath).then(() => {
      logger.debug(
        'main',
        DEV_TOOLS_TAG,
        GET_HEAP_SNAPSHOT_TAG,
        'Snapshot created',
        filePath,
      )
    })
  } else {
    logger.debug(
      'main',
      DEV_TOOLS_TAG,
      GET_HEAP_SNAPSHOT_TAG,
      'Could not find a window to get a snapshot from',
    )
  }
}
