import { scope } from '@vkontakte-internal/di'
import { Analytics } from '@vkontakte-internal/plugins'
import { ProductionStatsEvent } from '@vkontakte-internal/vk-analytics-events'

const saveProductionStats = (..._args: unknown[]) => {}

/**
 * Перенесено из `data/static/js/modules/shared/di/impl/BrowserAnalytics.ts`
 *
 * Браузерная реализация сервиса аналитики
 * @see workspaces/plugins/src/analytics/Analytics.ts
 */
@scope.global()
export class BrowserAnalytics implements Analytics {
  private readonly DEBUG = false

  /**
   * Отправляет событие аналитики ProductionStats
   */
  public sendProductionStats(
    event: ProductionStatsEvent,
    options?: { force?: boolean },
  ): void {
    saveProductionStats(event, options)
  }

  /**
   * DO NOT USE. Method not implemented
   */
  public sendBenchmarkMainStats(): void {
    throw new Error('Method not implemented')
  }
  /**
   * DO NOT USE. Method not implemented
   */
  public sendCustomStats(): void {
    throw new Error('Method not implemented')
  }
  /**
   * DO NOT USE. Method not implemented
   */
  public sendNetworkStats(): void {
    throw new Error('Method not implemented')
  }
  /**
   * DO NOT USE. Method not implemented
   */
  public sendStatlogEvents(): void {
    throw new Error('Method not implemented')
  }
  /**
   * DO NOT USE. Method not implemented
   */
  public sendStoryViewStats(): void {
    throw new Error('Method not implemented')
  }
  /**
   * DO NOT USE. Method not implemented
   */
  public sendWebPerfStats(): void {
    throw new Error('Method not implemented')
  }
  /**
   * DO NOT USE. Method not implemented
   */
  public sendWebStatsWithoutQueue(): void {
    throw new Error('Method not implemented')
  }
}
