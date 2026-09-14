import { Stats as BaseStats, IStats } from '@vkontakte-internal/messenger'

export class ElectronStats extends BaseStats {
  public override trackExternalEvent: IStats.IStats['trackExternalEvent'] = (
    eventData,
  ) => {
    const tmr = window._tmr || (window._tmr = [])

    switch (eventData.type) {
      case 'message_sent':
        tmr.push({
          id: 3510816,
          type: 'incrementEventTimespent',
          activity: 26,
        })
        break
      default:
        throw new Error('Exhaustivness failure! This should never happen.')
    }
  }
}
