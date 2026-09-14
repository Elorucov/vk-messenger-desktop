export type DSnackbarType =
  | 'initial'
  | 'update'
  | 'success'
  | 'error'
  | 'errorDirectory'

export type DSnackbarOptions = {
  id: string
  type: DSnackbarType
  fileName?: string
  filePath?: string
  count?: number
  downloaded?: number
  totalSize?: number
  withPriority?: boolean
}
