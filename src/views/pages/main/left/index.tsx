/**
 * @fileOverview Left
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import { Tooltip } from 'antd'
import AvatarImg from '@assets/images/avatar.jpeg'

const Left = (): ReactElement => {
  const { homeStore } = useStore()

  // 递归生成子菜单
  const generateMenuItems = (menuList: Array<{ [K: string]: any }> = [], parentPath: string = ''): Array<any> => {
    return menuList.map((menu: { [K: string]: any } = {}) => {
      let fullPath = parentPath + (menu.url || '')
      if (menu.children) {
        return {
          key: menu.key || '',
          fullPath,
          label: menu.label,
          icon: menu.icon,
          type: menu.type || '',
          children: generateMenuItems(menu.children, fullPath)
        }
      }

      return {
        key: menu.key || '',
        fullPath,
        label: menu.label,
        icon: menu.icon,
        type: menu.type || ''
      }
    })
  }

  const render = () => {
    // const list = generateMenuItems(homeStore.MENU_LIST || [])
    return (
      <div className="left w-16 flex-align-center border-right flex-direction-column background-left absolute h100 top-0 z-100">
        <div className="person-info p-3 border-bottom flex-align-center">
          <div className="avatar flex-align-center relative cursor-pointer">
            <img src={AvatarImg} alt="" className="wh100 rounded-full" />
          </div>
        </div>

        <div className="menus w100 flex-1 pt-4 pb-4 overflow-y-auto">
          {/*
          <Menu
            className="wh100 m-ant-menu"
            onClick={(e: any) => {
              let obj = homeStore.findMenu(list, e.key)
              if (Utils.isObjectNull(obj || {})) {
                return
              }

              navigate(obj.fullPath || '')
            }}
            items={generateMenuItems(list)}
            mode="inline"
            selectedKeys={homeStore.selectedMenuKeys}
            onSelect={({ selectedKeys }) => (homeStore.selectedMenuKeys = selectedKeys || [])}
          />
          */}

          <div className="flex-align-center flex-direction-column">
            {(homeStore.MENU_LIST || []).map((item: { [K: string]: any } = {}, index: number) => {
              return (
                <div
                  className={`w-8 h-8 p-1.5 mb-4 cursor-pointer flex-center bg-menu-hover rounded color-svg ${item.key === homeStore.selectedMenu ? 'bg-menu-active' : ''}`}
                  key={index}
                  onClick={() => {
                    homeStore.onSetSelectMenu(item.key || '')
                    // navigate(`${item.parentUrl || ''}${item.url || ''}`)
                  }}
                >
                  <Tooltip rootClassName="m-ant-tooltip" title={item.label || ''} placement="right">
                    <div className="wh100">{item.icon || null}</div>
                  </Tooltip>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(Left)
