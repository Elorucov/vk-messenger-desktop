import { net } from 'electron'

export const checkIsOnline = (): boolean => net.isOnline()
