/**
 * @fileOverview dashboard
 * @date 2023-07-05
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@stores/index'
import Loading from '@views/components/loading/loading'
import Page from '@views/modules/page'
import RouterUrls from '@route/router.url.toml'
import { useNavigate } from 'react-router-dom'

const Dashboard = (): ReactElement => {
  const { dashboardStore, homeStore } = useStore()

  const navigate = useNavigate()

  // @ts-ignore
  const toPage = (index: number = 0) => {
    const menu = homeStore.MENU_LIST[index]
    homeStore.onSetSelectMenu(menu.key)
    navigate(`${menu.parentUrl || ''}${menu.url || ''}`)
  }

  const render = () => {
    return (
      <Page
        className="dashboard-page"
        title={{
          label: RouterUrls.DASHBOARD.NAME || ''
        }}
      >
        <div className="flex-wrap"></div>
        <Loading show={dashboardStore.loading} />
      </Page>
    )
  }

  return render()
}

export default observer(Dashboard)
