/**
 * @fileOverview 公共 html
 * @date 2023-08-28
 * @author poohlaha
 */
import React from 'react'

const CommonHtmlHandler = {
  /**
   * 返回箭头
   */
  getBackNode(className: string = '', onClick?: Function) {
    return (
      <svg
        className={`icon w-6 h-6 color cursor-pointer ${className || ''}`}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        onClick={() => {
          if (onClick) {
            onClick?.()
            return
          }
          window.history.go(-1)
        }}
      >
        <path d="M0 0h1024v1024H0z" fill="currentColor" fillOpacity=".01"></path>
        <path
          d="M409.892571 225.865143a42.715429 42.715429 0 0 1 4.900572 54.418286l-4.900572 5.851428-183.296 183.222857h665.088a42.642286 42.642286 0 0 1 6.948572 84.772572l-6.948572 0.512H226.596571l183.296 183.222857a42.715429 42.715429 0 0 1 4.900572 54.418286l-4.900572 5.851428a42.715429 42.715429 0 0 1-54.418285 4.973714l-5.924572-4.973714-256-256-4.242285-4.900571a42.788571 42.788571 0 0 1-0.292572-0.365715l4.534857 5.266286A42.715429 42.715429 0 0 1 81.042286 512v-1.974857l0.292571-3.072L81.042286 512a42.861714 42.861714 0 0 1 12.434285-30.134857l256-256a42.642286 42.642286 0 0 1 60.416 0z"
          fill="currentColor"
        ></path>
      </svg>
    )
  }
}

export default CommonHtmlHandler
