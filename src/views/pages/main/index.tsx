/**
 * @fileOverview Home
 * @date 2023-04-12
 * @author poohlaha
 */
import React, { ReactElement, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import useMount from '@hooks/useMount'
import { USER } from '@utils/base'
import Page from '@views/modules/page'
import Left from '@pages/main/left'
import Right from '@pages/main/right'
import TitleBar from '@sdk/titleBar'
import Utils from '@utils/utils'
import { useNavigate } from 'react-router'
import { listen } from '@tauri-apps/api/event'

const Home = (): ReactElement => {
  const { homeStore, systemStore } = useStore()
  const navigate = useNavigate()

  useMount(async () => {
    homeStore.userInfo = USER.getUserInfo() || {}
    homeStore.getSelectedKeysByUrl()

    await onBackEnd()
  })

  const onBackEnd = async () => {
    await onEmit()
  }

  const onEmit = async () => {
    await listen('set-setting-menu', event => {
      console.log('[main] 主窗口收到更改为设置菜单消息', event)
      let payload: any = event.payload || {}
      homeStore.selectedMenu = payload.menu || ''
    })
  }

  useEffect(() => {
    console.log('change menu', homeStore.selectedMenu)
    if (Utils.isBlank(homeStore.selectedMenu || '')) {
      return
    }

    // 根据key查找url
    let obj = homeStore.MENU_LIST.find((item: { [K: string]: any } = {}) => item.key === homeStore.selectedMenu) || {}
    if (Utils.isObjectNull(obj || {})) {
      return
    }

    navigate(`${obj.parentUrl || ''}${obj.url || ''}`)
  }, [homeStore.selectedMenu])

  const render = () => {
    return (
      <Page
        className={`home-page wh100 overflow-hidden background-right ${systemStore.font.fontSize}`}
        contentClassName="flex-direction-column !p-0"
        loading={homeStore.loading}
        title={{
          show: false
        }}
      >
        {/* 标题栏 */}
        <TitleBar />

        {/* 导航条
        <Navigation
          userName={homeStore.userInfo.userName || ''}
          onLogout={async () => {}}
          onUpdatePwd={() => {}}
          onHome={() => {
            homeStore.selectedMenuKeys = [RouterUrls.DASHBOARD.URL]
            navigate(RouterUrls.DASHBOARD.URL)
          }}
        />
         */}

        {/* main */}
        <main className="flex-1 w100 overflow-hidden flex">
          <Left />
          <Right />
        </main>
      </Page>
    )
  }

  return render()
}

export default observer(Home)
