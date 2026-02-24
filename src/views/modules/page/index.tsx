/**
 * @fileOverview Page
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { PropsWithChildren, ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import Loading from '../../components/loading/loading'
import MBreadcrumb from '@views/modules/breadcrumb'
import CommonHtmlHandler from '@views/handlers/common'
import { useStore } from '@views/stores'

interface IPageTitleProps {
  show?: boolean
  needBack?: boolean
  label?: string
  right?: React.ReactNode
}

interface IPageProps {
  className?: string
  contentClassName?: string
  loading?: boolean
  breadCrumbItemList?: Array<{ [K: string]: any }> // 面包屑列表
  title?: IPageTitleProps
}

const Page = (props: PropsWithChildren<IPageProps>): ReactElement => {
  const { systemStore } = useStore()

  const getBreadcrumb = () => {
    return (
      <div className="breadcrumb-top flex-align-center pb-3">
        <MBreadcrumb items={props.breadCrumbItemList || []} />
      </div>
    )
  }

  const render = () => {
    let title = props.title || {}
    const hasTitle = title.show ?? true
    const needBack = title.needBack ?? false
    return (
      <div className={`wh100 ${props.className || ''}`}>
        <div className={`${props.contentClassName || ''} wh100 p-6 flex-direction-column`}>
          {(props.breadCrumbItemList || []).length > 0 && getBreadcrumb()}

          {hasTitle && (
            <div className="page-title flex-align-center mb-4 color">
              {needBack && CommonHtmlHandler.getBackNode()}
              <p className={`flex-1 font-bold ${systemStore.font.titleFontSize || ''} ${needBack ? 'ml-2' : ''}`}>
                {title.label || ''}
              </p>
              {title.right}
            </div>
          )}

          {/* content */}

          {props.children}
        </div>

        {/* loading */}
        <Loading show={props.loading ?? false} />
      </div>
    )
  }

  return render()
}

export default observer(Page)
