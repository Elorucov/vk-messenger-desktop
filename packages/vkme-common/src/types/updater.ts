import { UpdateInfo } from 'electron-updater/out/main'

export enum UpdaterStoreKey {
  RELEASE_NOTES = 'RELEASE_NOTES',
  PREVIOUS_VERSION = 'PREVIOUS_VERSION',
  IS_FORCED_CHECK = 'IS_FORCED_CHECK',
  IS_AUTOMATIC_DOWNLOAD_ENABLED = 'IS_AUTOMATIC_DOWNLOAD_ENABLED',
  UPDATE_SIZE = 'UPDATE_SIZE',
  NEW_VERSION = 'NEW_VERSION',
  STATUS = 'STATUS',
  PROGRESS = 'PROGRESS',
}

export type UpdateInfoExtended = UpdateInfo & {
  readonly minimalRequiredOSVersion: string | undefined
}

export enum UpdateStatus {
  NOOP,
  CHECKING_FOR_UPDATES,
  UPDATE_AVAILABLE,
  NO_UPDATES,
  DOWNLOADING_UPDATE,
  UPDATE_DOWNLOADED,
  ERROR,
}

export type UpdateState = {
  [UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED]: boolean | null
  [UpdaterStoreKey.IS_FORCED_CHECK]: boolean
  [UpdaterStoreKey.PREVIOUS_VERSION]: string | null
  [UpdaterStoreKey.RELEASE_NOTES]: string | null
  [UpdaterStoreKey.UPDATE_SIZE]: number | null
  [UpdaterStoreKey.NEW_VERSION]: string | null
  [UpdaterStoreKey.STATUS]: UpdateStatus
  [UpdaterStoreKey.PROGRESS]: number
}
