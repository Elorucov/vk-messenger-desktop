import { WebContentsView, app } from 'electron'
import { getWindow } from '../../utils'
import { join } from 'path'
import { configureRegWebView } from '../../utils/configureRegWebView'

let regWebView: WebContentsView | null

export const getRegWebView = (
  withCreation: boolean = false,
): WebContentsView | null => {
  if (!regWebView && withCreation) {
    const meWindow = getWindow()

    regWebView = new WebContentsView({
      webPreferences: {
        webSecurity: false,
        enablePreferredSizeMode: true,
        devTools: false,
        preload: join(
          app.getAppPath(),
          'packages/preload/dist/entryRegWebView.js',
        ),
      },
    })
    configureRegWebView(regWebView, meWindow)
    return regWebView
  } else {
    return regWebView
  }
}

export const destroyWindow = (): void => {
  regWebView = null
}
