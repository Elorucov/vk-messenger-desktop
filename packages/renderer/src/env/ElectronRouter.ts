import { Router } from '@vkontakte-internal/messenger/dist/data/env/Router'
import { authWrapper } from '../utils/authWrapper'

class ElectronRouter extends Router {
  public override checkIsolation = (): boolean =>
    authWrapper.checkIsEducationProfile()
}

export { ElectronRouter }
