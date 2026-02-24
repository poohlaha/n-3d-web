/**
 * @fileOverview home store
 * @date 2023-07-03
 * @author poohlaha
 */
import { observable, action } from 'mobx'
import BaseStore from '../base/base.store'
import { lazy } from 'react'
import RouterUrls from '@route/router.url.toml'
import React from 'react'
import Utils from '@utils/utils'
import { ADDRESS } from '@utils/base'
import { SYSTEM } from '@config/index'

class HomeStore extends BaseStore {
  // 选中的菜单
  @observable selectedMenuKeys: Array<string> = []

  // 用户信息
  @observable userInfo: { [K: string]: any } = {}

  readonly MENU_LIST: Array<{ [K: string]: any }> = [
    {
      key: RouterUrls.DASHBOARD.KEY,
      label: RouterUrls.DASHBOARD.NAME,
      url: RouterUrls.DASHBOARD.URL,
      parentUrl: '',
      icon: (
        <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="currentColor"
            d="M902.016 130.016H123.008q-23.008 0-40 16.992t-16.992 40v480q0 24 16.992 40.512t40 16.512H480v108h-147.008q-12.992 0-22.496 9.504t-9.504 22.496 9.504 22.016 22.496 8.992h358.016q12.992 0 22.496-8.992t9.504-22.016-9.504-22.496-22.496-9.504h-148v-108h359.008q24 0 40.512-16.512t16.512-40.512v-480q0-23.008-16.512-40t-40.512-16.992zM896 192.992v468H128.992V192.992H896z"
          ></path>
        </svg>
      ),
      component: lazy(() => import(/* webpackChunkName:'dashboard' */ '@views/pages/dashboard'))
    },
    {
      key: RouterUrls.ROOM.KEY,
      label: RouterUrls.ROOM.NAME,
      url: RouterUrls.ROOM.URL,
      parentUrl: '',
      icon: (
        <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M765.979015 921.773958H337.734786c-1.125612 0-2.148896-0.102328-3.17218-0.204657h-67.332067c-1.432597 0-2.762866-0.102328-4.195464-0.306985-45.945438-6.549016-63.852903-51.982812-67.229739-77.871889-0.102328-1.125612-0.204657-2.353553-0.204656-3.479165l-2.865195-246.09973-69.890277-32.745079c-18.623763-8.697911-33.359049-22.819227-41.545318-39.601079-11.870091-24.354152-10.846807-52.08514 2.865194-78.178875 5.01409-9.516538 11.870091-18.009793 20.465674-25.479764l96.08634-82.88598V222.87119c0-33.154392 18.112122-63.545918 46.252423-77.462576 23.023883-11.358449 48.094334-10.949136 70.708904 1.22794 19.44239 10.437494 33.666034 28.344959 40.522035 49.62926l72.243829-62.727291c25.889078-25.684421 54.64335-38.680124 85.648846-38.680124h1.22794c47.275707 0.511642 81.044069 31.517138 88.309384 38.782452 15.349256 13.405016 228.089937 198.517038 300.538423 260.528031 37.963825 32.438093 54.950335 65.183172 50.447886 97.31428-5.832717 42.05696-45.536125 61.397022-50.140901 63.545918l-65.490157 32.028779-0.716299 51.778156c0 1.023284-0.102328 2.046567-0.204656 3.069851l-2.353553 198.210053c0 1.125612-0.102328 2.353553-0.204657 3.479164-3.376836 25.786749-21.386629 71.322874-67.229739 77.87189-1.432597 0.204657-2.865194 0.306985-4.297791 0.306985z m-67.332068-58.941141h64.569202c10.02818-2.865194 14.530629-20.874988 15.553912-25.786749l3.069851-262.165285c0-1.432597 0.102328-2.865194 0.409314-4.297791v-2.455881c0.204657-11.153792 6.549016-21.181973 16.474867-26.093734l82.374338-40.317378c3.581493-1.739582 15.860897-9.516538 16.98651-18.521435 0.511642-3.888478-0.204657-18.521435-30.391526-44.308184C792.686719 374.726491 568.178275 179.279304 565.927051 177.335065c-0.716299-0.61397-1.330269-1.22794-1.944239-1.944239-0.102328-0.102328-21.488958-21.591286-47.787349-21.693614h-0.204657c-15.246927 0-29.879884 7.265314-44.615169 22.102928-0.511642 0.511642-1.023284 1.023284-1.534925 1.432597L352.470071 279.151794c-8.697911 7.572299-21.079644 9.311882-31.517138 4.604776-10.539822-4.809433-17.191166-15.246927-17.191166-26.810033v-31.926451c0-11.563106-5.525732-21.898271-14.018987-26.503048-5.832717-3.172179-10.437494-3.274508-16.474868-0.306985-8.083941 3.990806-13.507345 13.916658-13.507344 24.661137v125.761567c0 8.595583-3.683821 16.679524-10.232837 22.307585l-106.319177 91.686219c-2.967523 2.558209-5.321075 5.423404-6.856001 8.390927-7.265314 13.81433-3.274508 22.0006-1.944239 24.763465 2.353553 4.707105 7.162986 9.004897 13.609673 12.074748l86.05816 40.317378c1.432597 0.61397 2.762866 1.432597 4.093135 2.251224 3.581493 2.251224 6.446687 5.218747 8.697911 8.697911 2.353553 3.479165 3.888478 7.572299 4.502448 11.97242 0.204657 1.432597 0.306985 2.967523 0.306985 4.502448l3.069851 261.551314c1.023284 4.707105 5.423404 22.819227 15.553913 25.786749h425.481363c0.716299-0.306985 1.841911-0.204657 2.865194-0.102328z"
            fill="currentColor"
          ></path>
          <path
            d="M604.402518 921.773958H425.737184c-16.270211 0-29.470571-13.20036-29.470571-29.47057V667.078645c0-38.066154 31.005496-69.07165 69.07165-69.07165h99.463176c38.066154 0 69.07165 31.005496 69.07165 69.07165v225.327071c0 16.167882-13.20036 29.368242-29.470571 29.368242z m-149.194763-58.941141h119.724193V667.078645c0-5.62806-4.502448-10.130509-10.130509-10.130509h-99.463176c-5.62806 0-10.130509 4.502448-10.130508 10.130509v195.754172z"
            fill="currentColor"
          ></path>
        </svg>
      ),
      component: lazy(() => import(/* webpackChunkName:'dashboard' */ '@views/pages/room'))
    }
  ]

  @observable breadcrumbItems: Array<{ [K: string]: any }> = [] // 面包屑

  @observable selectedMenu: string = this.MENU_LIST[0].key

  constructor() {
    super()
    this.getSelectMenuByUrl()
  }

  /**
   * 根据 url 获取选中的 key
   */
  @action
  getSelectMenuByUrl() {
    let { addressUrl } = ADDRESS.getAddress()
    console.log('addressUrl', addressUrl)

    // 根据key查找url
    let obj =
      this.MENU_LIST.find((item: { [K: string]: any } = {}) => `${item.parentUrl}${item.url}` === addressUrl) || {}
    if (!Utils.isObjectNull(obj || {})) {
      this.selectedMenu = obj.key
      return
    }

    this.selectedMenu = ''
  }

  /**
   * 获取选中的菜单
   */
  @action
  getSelectedKeysByUrl() {
    const list = this.MENU_LIST || []
    if (list.length === 0) return []

    let { addressUrl } = ADDRESS.getAddress()
    console.log('addressUrl', addressUrl)

    // dashboard
    if (addressUrl === RouterUrls.DASHBOARD.URL || Utils.isBlank(addressUrl || '')) {
      this.selectedMenuKeys = [RouterUrls.DASHBOARD.KEY]
      return
    }

    // 如果有三层 /, 去掉最后一层
    if (addressUrl.endsWith('/')) {
      addressUrl = addressUrl.substring(0, addressUrl.length - 1)
    }

    let moreSplit = addressUrl.split('/').filter(Boolean).length > 2
    let path = addressUrl
    if (moreSplit) {
      path = addressUrl.substring(0, addressUrl.lastIndexOf('/'))
    }

    let obj = this.findMenu(this.MENU_LIST, '', path) || {}
    this.selectedMenuKeys.push(obj.key || '')
  }

  /**
   * 查找菜单
   */
  findMenu(list: Array<{ [K: string]: any }> = [], key: string = '', url: string = ''): { [K: string]: any } {
    if (list.length === 0) return {}

    for (const item of list) {
      if (item.key === key || (item.url === url && !Utils.isBlank(url || ''))) {
        return item || {}
      }

      const children = item.children || []
      if (children.length === 0) {
        continue
      }

      let obj = this.findMenu(children, key, url) || {}
      if (!Utils.isObjectNull(obj || {})) {
        return obj
      }
    }

    return {}
  }

  // 直接根据 url 查找
  getUrl(needParams: boolean = true) {
    let relativePath = this.getRelativePath(window.location.href || '')
    relativePath = relativePath.replace(RouterUrls.HOME_URL, '')
    if (!needParams) {
      let index = relativePath.indexOf('?')
      if (index !== -1) {
        relativePath = relativePath.substring(0, index)
      }
    }

    return relativePath
  }

  @action
  reset() {
    this.breadcrumbItems = []
  }

  @action
  onSetSelectMenu(key: string = '') {
    this.selectedMenu = key || ''
    Utils.setLocal(SYSTEM.LEFT_MENU_NAME, this.selectedMenu)
  }

  onGetSelectMenu() {
    this.selectedMenu = Utils.getLocal(SYSTEM.LEFT_MENU_NAME) || ''
  }

  /**
   * 重置数据
   */
  @action
  onReset() {
    this.selectedMenuKeys = []
    this.userInfo = {}
  }
}

export default new HomeStore()
