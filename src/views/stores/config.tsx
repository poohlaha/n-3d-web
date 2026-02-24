/**
 * @fileOverview store
 * @date 2023-04-12
 * @author poohlaha
 */
import commonStore from './base/common.store'
import homeStore from './main/home.store'
import mainStore from './main/main.store'
import systemStore from '@stores/setting/system.store'
import dashboardStore from './modules/dashboard.store'
import roomStore from './modules/room.store'

export const STORES: any = {
  commonStore,
  homeStore,
  mainStore,
  systemStore,
  dashboardStore,
  roomStore
}
export function createStore() {
  return STORES
}

export const store = createStore()
export type Stores = ReturnType<typeof createStore>
