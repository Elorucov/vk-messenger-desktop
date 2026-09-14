import Store from 'electron-store'

type SavedFile = {
  size: number
  fileName: string
  filePath: string
}

const downloadsStore = new Store<Record<string, SavedFile>>()

export { downloadsStore }
