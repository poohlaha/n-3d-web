/**
 * @fileOverview Title Bar
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useStore } from '@views/stores'
import { exit } from '@tauri-apps/plugin-process'

// @ts-ignore
interface ITitleBarProps {
  onHome: () => void
}

const TitleBar = (): ReactElement => {
  const { systemStore } = useStore()
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)

  const onAlwaysOnTop = async () => {
    await getCurrentWindow()?.setAlwaysOnTop(!alwaysOnTop)
    setAlwaysOnTop(!alwaysOnTop)
  }

  const onMinimize = async () => {
    await getCurrentWindow()?.minimize()
  }

  const onMaximized = async () => {
    let currentWindow = getCurrentWindow()
    if (await currentWindow?.isMaximized()) {
      await getCurrentWindow()?.unmaximize()
    } else {
      await getCurrentWindow()?.maximize()
    }
  }

  const render = () => {
    return (
      <div className="title-bar relative bg-transparent z-999 left-0 w-full top-0 h-10 pt-1 pb-1 pl-2 pr-2 select-none flex-jsc-end flex flex-shrink-0 items-center gap-4">
        {/* 拖拽区域 */}
        <div className=" absolute left-0 top-0 z-0 h-full w-full" data-tauri-drag-region></div>

        {/* LOGO
        <div className="z-1 flex items-center pl-2 cursor-pointer" onClick={props.onHome}>
          <div className="svg-box cursor-pointer w-6 h-6">
            <svg
              className="svg-icon theme wh100 !w-6 !h-6"
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
        </div>
         */}

        {/* 右侧按钮 */}
        <div className="relative right z-1 flex items-center gap-1">
          {/* 置顶 */}
          <div
            className="svg-box w-8 h-8 p-2 mr-2 cursor-pointer bg-menu-hover rounded color-svg"
            onClick={async () => await onAlwaysOnTop()}
          >
            {alwaysOnTop ? (
              <svg className="wh100 theme" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M316.416 84.48A66.594133 66.594133 0 0 1 378.88 22.016l266.6496-1.8432 5.495467-0.1024c16.452267 0.512 31.914667 8.704 41.642666 22.289067l3.345067 4.334933c9.3184 13.312 12.8 29.934933 9.454933 45.909333a192.750933 192.750933 0 0 1-46.626133 90.794667l26.077867 200.874667 9.591466 5.632a336.759467 336.759467 0 0 1 161.109334 258.730666v6.280534l-0.341334 5.632c-3.413333 31.6416-29.696 56.183467-62.122666 56.797866l-247.808 0.2048v258.730667a34.133333 34.133333 0 0 1-67.9936 4.266667l-0.273067-4.3008-0.034133-258.628267-245.418667 0.170667-5.973333-0.477867a67.310933 67.310933 0 0 1-41.198934-21.7088A55.057067 55.057067 0 0 1 168.516267 648.533333l1.194666-10.990933a326.997333 326.997333 0 0 1 170.120534-248.593067l24.132266-200.704-6.8608-7.850666a197.12 197.12 0 0 1-40.618666-83.319467 19.729067 19.729067 0 0 0-0.238934-2.901333l-0.989866-4.573867c-0.375467-1.9456-0.4096-3.515733 1.160533-5.085867z m68.744533 5.802667l2.730667 8.465066c5.802667 15.940267 14.7456 30.651733 26.3168 43.281067l3.857067 4.573867a68.266667 68.266667 0 0 1 13.687466 49.800533l-24.132266 200.669867-0.989867 5.9392a68.266667 68.266667 0 0 1-34.577067 46.08l-8.430933 4.7104a258.7648 258.7648 0 0 0-126.0544 191.112533l-0.477867 4.642133 549.888-0.477866-0.4096-4.334934a268.629333 268.629333 0 0 0-135.099733-200.942933 68.266667 68.266667 0 0 1-34.269867-50.722133L591.189333 192.170667l-0.512-6.007467a68.266667 68.266667 0 0 1 17.92-48.9472l5.461334-6.3488c8.669867-10.8544 15.4624-23.074133 20.138666-36.181333l1.9456-6.178134-250.948266 1.7408z"
                  fill="currentColor"
                ></path>
              </svg>
            ) : (
              <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M944.82575294 335.24692819L683.03290766 73.45408293c-17.54183667-17.35116455-42.90123101-22.68998439-65.97255971-13.72839395s-38.32509969 29.55418135-39.46913254 54.15088717l-4.194787 71.31137956L296.54048422 369.18656876l-102.58161015-4.76680347c-25.7407386-1.14403283-49.00273942 13.15637753-59.48970703 36.60905048-10.48696758 23.6433451-5.52949199 50.71878867 12.77503323 69.0233139l177.32508821 177.32508821L65.82719741 905.73796468c-14.68175461 14.68175461-14.68175461 39.08778826 0 53.76954287s39.08778826 14.68175461 53.76954287 0l258.17007469-258.55141892 170.07954694 170.07954693c11.82167255 11.82167255 27.64746001 18.1138531 43.66391957 18.11385312 8.5802462 0 17.16049241-1.71604925 25.16872219-5.14814769 23.26200082-10.48696758 37.94375543-33.74896841 36.60905048-59.48970704l-4.76680345-102.58161018 184.37995731-276.85594416 71.31137956-4.19478703c24.59670577-1.33470498 45.18929666-16.96982027 54.15088717-40.04114896 8.96159047-23.26200082 3.62277062-48.24005088-13.5377218-65.59121543zM790.76266554 370.90261798L571.29903487 700.19340009l4.19478705 90.95060974-348.54866802-348.73934014 90.75993763 4.19478704 329.29078206-219.65430283 4.57613133-77.41288797 216.79422075 216.79422076-77.60356013 4.57613129z"
                  fill="currentColor"
                ></path>
              </svg>
            )}
          </div>

          {/* 最小化 */}
          <div
            className="svg-box w-8 h-8 p-2 mr-2 cursor-pointer bg-menu-hover rounded color-svg"
            onClick={async () => await onMinimize()}
          >
            <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M65.23884 456.152041 958.760137 456.152041l0 111.695918L65.23884 567.847959 65.23884 456.152041z"
                fill="currentColor"
              ></path>
            </svg>
          </div>

          {/* 最大化 */}
          <div
            className="svg-box w-8 h-8 p-2 mr-2 cursor-pointer bg-menu-hover rounded color-svg"
            onClick={async () => await onMaximized()}
          >
            <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M307.2 0H153.6C68.7744 0 0 68.7744 0 153.6v153.6a51.2 51.2 0 1 0 102.4 0V153.6a51.2 51.2 0 0 1 51.2-51.2h153.6a51.2 51.2 0 1 0 0-102.4z m716.8 307.2V153.6c0-84.8256-68.7744-153.6-153.6-153.6H716.8a51.2 51.2 0 1 0 0 102.4h153.6a51.2 51.2 0 0 1 51.2 51.2v153.6a51.2 51.2 0 1 0 102.4 0zM716.8 1024h153.6c84.8256 0 153.6-68.7744 153.6-153.6V716.8a51.2 51.2 0 1 0-102.4 0v153.6a51.2 51.2 0 0 1-51.2 51.2H716.8a51.2 51.2 0 1 0 0 102.4zM0 716.8v153.6c0 84.8256 68.7744 153.6 153.6 153.6h153.6a51.2 51.2 0 1 0 0-102.4H153.6a51.2 51.2 0 0 1-51.2-51.2V716.8a51.2 51.2 0 1 0-102.4 0z"
                fill="currentColor"
              ></path>
            </svg>
          </div>

          {/* 关闭 */}
          <div
            className="svg-box w-8 h-8 p-2 mr-2 cursor-pointer bg-menu-hover rounded color-svg"
            onClick={async () => {
              if (systemStore.system.closeType === '1') {
                await exit(0)
              } else {
                await onMinimize()
              }
            }}
          >
            <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M557.311759 513.248864l265.280473-263.904314c12.54369-12.480043 12.607338-32.704421 0.127295-45.248112-12.512727-12.576374-32.704421-12.607338-45.248112-0.127295L512.127295 467.904421 249.088241 204.063755c-12.447359-12.480043-32.704421-12.54369-45.248112-0.063647-12.512727 12.480043-12.54369 32.735385-0.063647 45.280796l262.975407 263.775299-265.151458 263.744335c-12.54369 12.480043-12.607338 32.704421-0.127295 45.248112 6.239161 6.271845 14.463432 9.440452 22.687703 9.440452 8.160624 0 16.319527-3.103239 22.560409-9.311437l265.216826-263.807983 265.440452 266.240344c6.239161 6.271845 14.432469 9.407768 22.65674 9.407768 8.191587 0 16.352211-3.135923 22.591372-9.34412 12.512727-12.480043 12.54369-32.704421 0.063647-45.248112L557.311759 513.248864z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(TitleBar)
