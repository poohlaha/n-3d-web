/**
 * @fileOverview 项目启动
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import {
  ConsoleLoggerFactory,
  CompositeLoggerFactory,
  ErrorKitLoggerFactory,
  DeferredLoggerFactory,
  setupErrorKit,
  registerActionHandlers,
  setupRuntimeFeatures,
  ERROR_KIT_CONFIG,
  CONTEXT_NAME,
  Utils
} from '@bale-web/jet/export'
import { setContext, setJet } from './global'
import { bootstrap } from './bootstrap'

export async function startApplication(
  store: Record<string, any> = {},
  navigate: (to: string) => void,
  user: Record<string, any> = {},
  callback?: Function
) {
  console.log(
    `🟢%c[${CONTEXT_NAME}] %cStarting application...`,
    'color: green;font-weight:bold;',
    'color: magenta;font-weight:bold;'
  )

  // 日志
  let logger: any
  const onyxFeatures = await setupRuntimeFeatures(new DeferredLoggerFactory(() => logger))
  const consoleLogger = new ConsoleLoggerFactory()
  const errorKit = setupErrorKit(
    {
      ...ERROR_KIT_CONFIG,
      environment: Utils.getEnv('qa')
    },
    consoleLogger
  )
  logger = new CompositeLoggerFactory([
    consoleLogger,
    new ErrorKitLoggerFactory(errorKit),
    ...(onyxFeatures ? [onyxFeatures.recordingLogger] : [])
  ])

  const { jet, context } = await bootstrap({
    loggerFactory: logger,
    featuresCallbacks: {
      getITFEValues(): string[] | undefined {
        return onyxFeatures?.featureKit?.itfe
      }
    },
    store,
    navigate,
    user
  })

  //@ts-ignore
  window.__JET__ = jet

  // 全局保存
  setJet(jet)
  setContext(context)

  // 注册 ActionHandlers
  registerActionHandlers({
    jet,
    logger
  })

  callback?.(context, logger)

  console.log(
    `🟢%c[${CONTEXT_NAME}] %cApplication ready`,
    'color: green;font-weight:bold;',
    'color: magenta;font-weight:bold;'
  )
}
