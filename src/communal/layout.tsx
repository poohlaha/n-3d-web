/**
 * @fileOverview layout
 * @date 2023-04-12
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router'
import { RouteInterface } from '@router/router.interface'
import NotFound from '@route/not-found'
import ScrollToTop from '@router/scrollToTop'
import { routes } from '@route/router'
import Loading from '../views/components/loading'
import Utils from '@utils/utils'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import '@assets/styles/common/tailwind.css'
import '@assets/styles/theme/index.less'
import RouterUrls from '@route/router.url.toml'

import '@ant-design/v5-patch-for-react-19'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import useMount from '@hooks/useMount'
import { AppProvider, AppContextValue } from '../provider'
import { startApplication } from '../browser'
import { CONSTANT } from '@config/index'
import { STORES } from '@stores/config'
import { Window } from '@communal/tray/window'
import { CONTEXT_NAME, Jet, LoggerFactory } from '@bale-web/jet/export'
import { useNavigate } from 'react-router-dom'

const { Suspense } = React

// 解决 Object.hasOwn 报错问题
if (!Object.hasOwn) {
  Object.hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
}

const RenderRoutes = (routes: RouteInterface[]) => {
  // 判断没用的路由, 跳转到404
  let usedRoutes: Array<RouteInterface> = []
  for (let router of routes) {
    if (!Utils.isBlank(router.path) || router.component !== null) {
      usedRoutes.push(router)
    }
  }

  if (usedRoutes.length > 0) {
    return (
      <Routes>
        {routes.map((route: RouteInterface) => {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Suspense fallback={<Loading show />}>
                  <ScrollToTop />
                  <route.component routes={route.routes || []} />
                </Suspense>
              }
            ></Route>
          )
        })}

        <Route path="*" element={<Navigate to={RouterUrls.NOT_FOUND_URL} />} />
      </Routes>
    )
  }
  return <Route element={<NotFound />} />
}

// 切换皮肤
const switchSkin = (skin: string = '', font: { [K: string]: any } = {}) => {
  /*
  let classList = document.body.classList || []
  const remove = () => {
    if (skin === CONSTANT.SKINS[0]) {
      classList.remove(CONSTANT.SKINS[1])
    } else {
      classList.remove(CONSTANT.SKINS[0])
    }
  }
   */

  document.body.setAttribute('class', '')

  let className = `${font.fontFamily || ''} ${font.fontSize || ''} `
  // 跟随系统
  if (skin === CONSTANT.SKINS[2]) {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    className += isSystemDark ? CONSTANT.SKINS[1] : CONSTANT.SKINS[0]
  } else {
    className += skin
  }

  document.body.setAttribute('class', className)
}

const Layout = (): ReactElement => {
  const { commonStore, systemStore, homeStore } = useStore()

  const navigate = useNavigate()
  const [appValue, setAppValue] = useState<AppContextValue>({
    context: new Map(),
    logger: console,
    jet: undefined
  })

  useEffect(() => {
    switchSkin(commonStore.skin, systemStore.font || {})
  }, [commonStore.skin, systemStore.font.fontFamily, systemStore.font.fontSize])

  useMount(async () => {
    commonStore.onGetSkin()
    homeStore.onGetSelectMenu()
    // await trayStore.getApplicationList()
    // await pipelineStore.getList()

    await new Window().addListen()

    await startApplication(STORES, navigate, {}, (context: Map<string, unknown>, logger: LoggerFactory) => {
      const jet = context.get(CONTEXT_NAME) as Jet
      setAppValue({
        context,
        logger,
        jet
      })
    })
  })

  const px2rem = px2remTransformer({
    rootValue: 16 // 32px = 1rem; @default 16
  })

  const render = () => {
    return (
      <AppProvider value={appValue}>
        <StyleProvider transformers={[px2rem]}>
          <ConfigProvider locale={zhCN}>{RenderRoutes(routes)}</ConfigProvider>
        </StyleProvider>
      </AppProvider>
    )
  }

  return render()
}

export default observer(Layout)
