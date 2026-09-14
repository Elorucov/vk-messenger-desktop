/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string
  readonly REFORGED_VERSION: string
  readonly CALLS_VERSION: string
  readonly VITE_BUILD_NUMBER?: string
  readonly VITE_APP_UPDATE_URL?: string
  readonly VITE_DEV_TOOLS_ALLOWED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
