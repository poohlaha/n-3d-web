/**
 * @fileOverview 在应用启动时创建 ActionDispatcher、注册 handler、创建 Jet 实例并注入 Svelte context。还可以设置预取条目（示例中 jet.setPrefetched('flow:/', ...)）
 * @date 2025-11-10
 * @author poohlaha
 * @description 把 bootstrap 中的 wiring 集中在一个文件，便于替换/测试（例如在单元测试中可以创建一个使用 mock handler 的 Jet）
 */
import { LoggerFactory, ConsoleMetrics, FeaturesCallbacks, Jet, initializeUniqueIdContext } from '@bale-web/jet/export'

export async function bootstrap({
  loggerFactory,
  featuresCallbacks,
  store,
  navigate,
  user
}: {
  loggerFactory: LoggerFactory
  featuresCallbacks?: FeaturesCallbacks
  store: Record<string, any>
  navigate: (to: string) => void
  user: Record<string, any>
}) {
  // metrics
  const consoleMetrics = new ConsoleMetrics(loggerFactory)
  const context = new Map<string, unknown>()

  // jet
  const jet = Jet.load({
    loggerFactory,
    context,
    metrics: consoleMetrics,
    featuresCallbacks,
    store,
    navigate,
    user
  })

  initializeUniqueIdContext(context, loggerFactory)

  return {
    jet,
    context
  }
}
