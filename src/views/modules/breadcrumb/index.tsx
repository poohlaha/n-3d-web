/**
 * @fileOverview breadcrumb
 * @date 2023-07-06
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { Breadcrumb } from 'antd'
import { useNavigate } from 'react-router-dom'
import Utils from '@utils/utils'
import { useStore } from '@views/stores'

interface IMBreadcrumbProps {
  className?: string
  items: Array<IPageBreadcrumbItemProps>
}

interface IPageBreadcrumbItemProps {
  [property: string]: any
}

const MBreadcrumb: React.FC<IMBreadcrumbProps> = (props: IMBreadcrumbProps): ReactElement => {
  const { systemStore } = useStore()
  const navigate = useNavigate()

  const toPage = (url: string, onClick?: Function) => {
    if (Utils.isBlank(url)) return
    onClick?.()
    navigate(url)
  }

  const getNewIcon = () => {
    return (
      <svg key="add-svg" className="svg-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M754.753851 475.715769a29.759795 29.759795 0 0 0-29.759795 29.759796v187.518711H545.731288a29.759795 29.759795 0 0 0-29.759795 29.823795v0.063999c0 16.447887 13.311908 29.759795 29.759795 29.759796h179.262768v185.470724c0 16.447887 13.311908 29.759795 29.759795 29.759796h0.127999a29.759795 29.759795 0 0 0 29.759796-29.759796V752.641866h163.006879a29.759795 29.759795 0 0 0 29.759795-29.759796v-0.127999a29.759795 29.759795 0 0 0-29.759795-29.759795H784.641646v-187.518711a29.759795 29.759795 0 0 0-29.887795-29.759796z"
          fill="currentColor"
        ></path>
        <path
          d="M393.412335 662.594485c18.047876 0 30.079793-12.031917 30.079794-30.079794 0-18.111875-12.031917-30.143793-30.079794-30.143792H92.230406V361.412555h783.098616c0 18.111875 12.031917 30.079793 30.079793 30.079793s30.079793-11.967918 30.079794-30.079793V150.598005A149.118975 149.118975 0 0 0 785.025643 0.00704H182.597785A149.118975 149.118975 0 0 0 32.00682 150.598005v662.587444a149.118975 149.118975 0 0 0 150.590965 150.590965h210.81455c18.047876 0 30.079793-12.031917 30.079794-30.079793 0-18.111875-12.031917-30.143793-30.079794-30.143793H182.597785c-48.191669 0-90.367379-42.17571-90.367379-90.367379v-150.590964h301.181929z m-301.181929-511.99648C92.230406 102.406336 134.406116 60.230626 182.597785 60.230626h602.363858c48.191669 0 90.367379 42.23971 90.367379 90.367379v150.590964H92.166406V150.598005z"
          fill="currentColor"
        ></path>
      </svg>
    )
  }

  const getDetailIcon = () => {
    return (
      <svg
        key="detail-svg"
        className="svg-icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M884.363636 977.454545H139.636364a93.090909 93.090909 0 0 1-93.090909-93.090909V139.636364a93.090909 93.090909 0 0 1 93.090909-93.090909h744.727272a93.090909 93.090909 0 0 1 93.090909 93.090909v744.727272a93.090909 93.090909 0 0 1-93.090909 93.090909zM186.181818 139.636364a46.545455 46.545455 0 0 0-46.545454 46.545454v651.636364a46.545455 46.545455 0 0 0 46.545454 46.545454h651.636364a46.545455 46.545455 0 0 0 46.545454-46.545454V186.181818a46.545455 46.545455 0 0 0-46.545454-46.545454z"
          fill="currentColor"
        ></path>
        <path d="M279.272727 651.636364h465.454546v93.090909H279.272727z" fill="currentColor"></path>
        <path
          d="M279.319273 349.044364l230.4 230.4 230.4-230.4-65.861818-65.815273-164.538182 164.538182-164.584728-164.538182z"
          fill="currentColor"
        ></path>
      </svg>
    )
  }

  const getItems = () => {
    if (props.items.length === 0) return props.items || []
    let items: Array<{ [K: string]: any }> = []
    for (let i = 0; i < props.items.length; i++) {
      let item = props.items[i]
      let icon = item.icon
      if (item.type === 'new') {
        icon = getNewIcon()
      } else if (item.type === 'detail') {
        icon = getDetailIcon()
      }

      items.push({
        key: i,
        title: (
          <div
            key={`${i}-title`}
            className="h100 flex-align-center"
            onClick={() => {
              let url = item.url || ''
              if (Utils.isBlank(url)) {
                return
              }

              toPage(url, item.onClick)
            }}
          >
            <div className="flex-align-center breadcrumb pl-1 pr-1">
              {icon && (
                <p className="icon flex-center w-4 h-4" key={`${icon}-${i}`}>
                  {icon}
                </p>
              )}
              <p>{item.name || ''}</p>
            </div>
          </div>
        )
      })
    }

    return items
  }

  const render = () => {
    return (
      <Breadcrumb
        rootClassName={`m-ant-breadcrumb ${systemStore.font.descFontSize || ''}`}
        items={getItems()}
        className={props.className || ''}
      />
    )
  }

  return render()
}

export default MBreadcrumb
