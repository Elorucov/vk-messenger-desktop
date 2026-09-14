import { sleep } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import { getMacMediaDevice } from './getMacMediaDevice'

const CHECKING_INTERVAL = 3000

export class MacMediaDeviceChecker {
  private inProgress = false
  private isPaused = false
  private hasDevice = false

  private resetState(): void {
    this.isPaused = false
    this.inProgress = false
  }

  public async check(): Promise<boolean> {
    this.inProgress = true

    if (this.isPaused) {
      this.resetState()
      return this.hasDevice
    }

    this.hasDevice = !!(await getMacMediaDevice())

    if (this.hasDevice) {
      this.resetState()
      return true
    }

    await sleep(CHECKING_INTERVAL)
    return await this.check()
  }

  public stopChecking(): void {
    if (this.inProgress) {
      this.isPaused = true
    }
  }
}
