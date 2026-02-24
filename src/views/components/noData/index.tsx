/**
 * @fileOverview no data
 * @date 2023-04-14
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { Empty } from 'antd'

const NoData = (): ReactElement | null => {
  const render = () => {
    return (
      <div className="no-data wh100 flex-center overflow-hidden">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }

  return render()
}

export default NoData
