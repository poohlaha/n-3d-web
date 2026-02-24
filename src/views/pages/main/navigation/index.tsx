/**
 * @fileOverview Navigation
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { Dropdown, MenuProps } from 'antd'
import Utils from '@utils/utils'
import AvatarImg from '@assets/images/avatar.jpeg'

interface INavigationProps {
  onUpdatePwd: () => void
  onLogout: () => void
  onHome: () => void
  userName: string
}

const Navigation = (props: INavigationProps): ReactElement => {
  const getMenuItems = (): MenuProps['items'] => {
    return [
      {
        key: Utils.generateUUID(),
        label: <p onClick={props.onUpdatePwd}>修改密码</p>
      },
      {
        key: Utils.generateUUID(),
        label: <p onClick={props.onLogout}>退出登录</p>
      }
    ]
  }

  const render = () => {
    return (
      <div className="navigation flex-align-center border-bottom h-12 pl-8 pr-8">
        {/* logo */}
        <div className="navigation-left flex-1 flex-align-center" onClick={props.onHome}>
          <div className="svg-box cursor-pointer">
            <svg
              className="svg-icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="128"
              height="128"
            >
              <path
                d="M512 16C785.92 16 1008 238.08 1008 512c0 273.92-222.08 496-496 496C238.08 1008 16 785.92 16 512 16 238.08 238.08 16 512 16z m-68.384 291.392H292.032v408.32h151.584V506.24l143.232 209.408h155.904V307.36h-150.4v212.128l-148.736-212.096z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <p className="text-base font-bold ml-2 cursor-pointer">nacos</p>
        </div>

        <div className="navigation-right">
          <Dropdown menu={{ items: getMenuItems() }} placement="bottom" trigger={['click']} arrow>
            <div className="avatar flex-center relative cursor-pointer">
              <img src={AvatarImg} alt="" className="h-10 w-10 rounded-full" />
            </div>
          </Dropdown>

          {!Utils.isBlank(props.userName || '') && (
            <p className="cursor-pointer text-sm ml-2">{props.userName || ''}</p>
          )}
        </div>
      </div>
    )
  }

  return render()
}

export default observer(Navigation)
